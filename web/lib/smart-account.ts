"use client"

import { createPublicClient, createWalletClient, custom, http, type Address } from "viem"
import { sepolia as chain } from "viem/chains"
import { Implementation, toMetaMaskSmartAccount } from "@metamask/smart-accounts-kit"

/**
 * Setup Public Client for reading blockchain data
 */
function setupPublicClient() {
  return createPublicClient({
    chain,
    transport: http(),
  })
}

/**
 * Setup Wallet Client from connected MetaMask
 */
function setupWalletClient() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not found. Please install MetaMask.")
  }

  return createWalletClient({
    transport: custom(window.ethereum),
    chain,
  })
}

/**
 * Check if an address is a smart account (has code)
 */
export async function checkSmartAccount(address: Address): Promise<{
  isSmartAccount: boolean
  code: string
}> {
  const publicClient = setupPublicClient()
  const code = await publicClient.getCode({ 
    address,
    blockTag: "latest" 
  })

  // Explicit check:
  // - If code is null/undefined → not a smart account
  // - If code is "0x" (empty string) → not a smart account  
  // - If code has length > 2 (has actual bytecode) → is a smart account
  const isSmartAccount = code !== null && code !== undefined && code !== "0x" && code.length > 2

  console.log("checkSmartAccount:", {
    address,
    rawCode: code,
    codeType: typeof code,
    codeLength: code?.length || 0,
    codeIsEmpty: code === "0x" || code === null || code === undefined,
    isSmartAccount,
  })

  return {
    isSmartAccount,
    code: code || "0x",
  }
}

/**
 * Get or create a Hybrid smart account for the connected wallet
 * Based on: https://docs.metamask.io/smart-accounts-kit/guides/smart-accounts/create-smart-account/
 * 
 * This creates a REAL Hybrid smart account using toMetaMaskSmartAccount from Smart Accounts Kit.
 * The address is deterministically calculated based on deployParams and deploySalt.
 * 
 * @param eoaAddress - The EOA address from the connected wallet (e.g., from Privy)
 * @returns Smart account instance and deployment info
 */
export async function getOrCreateSmartAccount(eoaAddress: Address): Promise<{
  smartAccountAddress: Address
  isDeployed: boolean
  eoaAddress: Address
  smartAccount: Awaited<ReturnType<typeof toMetaMaskSmartAccount>>
}> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not found. Please install MetaMask.")
  }

  if (!eoaAddress) {
    throw new Error("No wallet address provided. Please connect your wallet.")
  }

  const walletClient = setupWalletClient()
  const publicClient = setupPublicClient()

  // Use the provided EOA address (from Privy or other wallet connection)
  const owner = eoaAddress

  // Create a Hybrid smart account with Wallet Client signer
  // This follows the MetaMask docs exactly:
  // https://docs.metamask.io/smart-accounts-kit/guides/smart-accounts/create-smart-account/
  // Note: walletClient from custom(window.ethereum) works at runtime even though TypeScript
  // may complain about the account property - the Smart Accounts Kit handles this correctly
  const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [owner, [], [], []],
    deploySalt: "0x",
    signer: { walletClient } as any, // Type assertion needed for custom wallet client
  })

  // The smartAccount.address is the REAL deterministically calculated address
  // This is NOT mocked - it's calculated by the Smart Accounts Kit based on:
  // - Implementation type (Hybrid)
  // - deployParams (owner address, empty arrays for passkeys)
  // - deploySalt ("0x" for default)
  const smartAccountAddress = smartAccount.address

  // Check if the smart account is already deployed on-chain
  // getCode returns "0x" for addresses with no code (not deployed)
  // Returns bytecode string (starts with "0x" and has length > 2) for deployed contracts
  const code = await publicClient.getCode({ 
    address: smartAccountAddress,
    blockTag: "latest" 
  })
  
  // Explicit deployment check:
  // - If code is null/undefined → not deployed
  // - If code is "0x" (empty string) → not deployed  
  // - If code has length > 2 (has actual bytecode) → deployed
  const isDeployed = code !== null && code !== undefined && code !== "0x" && code.length > 2

  console.log("Smart Account Deployment Check:", {
    eoaAddress: owner,
    smartAccountAddress,
    rawCode: code,
    codeType: typeof code,
    codeLength: code?.length || 0,
    codeIsEmpty: code === "0x" || code === null || code === undefined,
    isDeployed,
    implementation: "Hybrid",
  })

  return {
    smartAccountAddress,
    isDeployed,
    eoaAddress: owner,
    smartAccount,
  }
}

/**
 * Estimate gas for deploying a smart account
 * 
 * @param eoaAddress - The EOA address from the connected wallet
 */
export async function estimateDeploymentGas(eoaAddress: Address): Promise<{
  gasEstimate?: bigint
  gasPrice?: bigint
  estimatedCost?: string
}> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not found. Please install MetaMask.")
  }

  const { smartAccountAddress, smartAccount } = await getOrCreateSmartAccount(eoaAddress)
  const publicClient = setupPublicClient()
  const accountAddress = eoaAddress

  try {
    const { factory, factoryData } = await smartAccount.getFactoryArgs()

    if (!factory || !factoryData) {
      return {}
    }

    // Estimate gas
    const gasEstimate = await publicClient.estimateGas({
      account: accountAddress,
      to: factory,
      data: factoryData,
    })

    // Get current gas price
    const feeData = await publicClient.estimateFeesPerGas()
    const gasPrice = feeData.gasPrice || feeData.maxFeePerGas || undefined

    // Calculate estimated cost in ETH
    let estimatedCost: string | undefined
    if (gasEstimate && gasPrice) {
      const costWei = gasEstimate * gasPrice
      const costEth = Number(costWei) / 1e18
      estimatedCost = costEth.toFixed(6)
    }

    return {
      gasEstimate,
      gasPrice,
      estimatedCost,
    }
  } catch (error) {
    console.warn("Gas estimation failed:", error)
    return {}
  }
}

/**
 * Deploy a smart account using the connected wallet as relay account
 * Based on: https://docs.metamask.io/smart-accounts-kit/guides/smart-accounts/deploy-smart-account/
 * 
 * The relay account (connected EOA) will pay for the deployment transaction.
 * 
 * @param eoaAddress - The EOA address from the connected wallet (used as relay account)
 */
export async function deploySmartAccount(eoaAddress: Address): Promise<{
  smartAccountAddress: Address
  txHash: string
  gasEstimate?: bigint
  gasPrice?: bigint
  estimatedCost?: string
}> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not found. Please install MetaMask.")
  }

  const { smartAccountAddress, isDeployed, smartAccount } = await getOrCreateSmartAccount(eoaAddress)

  if (isDeployed) {
    throw new Error("Smart account is already deployed.")
  }

  const publicClient = setupPublicClient()

  // Use the EOA address from Privy (already connected via Privy)
  // MetaMask will handle transaction signing when we send the transaction
  const accountAddress = eoaAddress

  // Ensure MetaMask is available and can sign transactions
  // Request account access if needed (this won't disconnect Privy)
  try {
    await window.ethereum.request({
      method: "eth_requestAccounts",
    })
  } catch (error) {
    // If request fails, continue anyway - MetaMask will prompt during transaction
    console.warn("MetaMask account request:", error)
  }

  // Get factory args from the smart account
  // This returns the factory address and factory data needed for deployment
  const { factory, factoryData } = await smartAccount.getFactoryArgs()

  if (!factory || !factoryData) {
    throw new Error("Failed to get factory args for smart account deployment.")
  }

  console.log("Deploying smart account:", {
    smartAccountAddress,
    factory,
    factoryData: factoryData ? `${factoryData.substring(0, 20)}...` : "null",
    accountAddress,
  })

  // Estimate gas for the deployment transaction
  let gasEstimate: bigint | undefined
  let gasPrice: bigint | undefined
  let estimatedCost: string | undefined

  try {
    // Estimate gas
    gasEstimate = await publicClient.estimateGas({
      account: accountAddress,
      to: factory,
      data: factoryData,
    })

    // Get current gas price
    const feeData = await publicClient.estimateFeesPerGas()
    gasPrice = feeData.gasPrice || feeData.maxFeePerGas || undefined

    // Calculate estimated cost in ETH
    if (gasEstimate && gasPrice) {
      const costWei = gasEstimate * gasPrice
      const costEth = Number(costWei) / 1e18
      estimatedCost = costEth.toFixed(6)
    }

    console.log("Gas estimation:", {
      gasEstimate: gasEstimate?.toString(),
      gasPrice: gasPrice?.toString(),
      estimatedCost: estimatedCost ? `${estimatedCost} ETH` : "unknown",
    })
  } catch (error) {
    console.warn("Gas estimation failed, proceeding anyway:", error)
  }

  // Deploy smart account using relay account (connected EOA)
  // The connected wallet will pay for the deployment transaction
  // Use window.ethereum.request directly since walletClient with custom transport
  // doesn't automatically set the account
  const transactionParams: {
    from: Address
    to: Address
    data: `0x${string}`
    gas?: `0x${string}`
    gasPrice?: `0x${string}`
  } = {
    from: accountAddress,
    to: factory,
    data: factoryData,
  }

  // Add gas estimate if available (MetaMask will still estimate, but this helps)
  if (gasEstimate) {
    transactionParams.gas = `0x${gasEstimate.toString(16)}`
  }

  // Add gas price if available
  if (gasPrice) {
    transactionParams.gasPrice = `0x${gasPrice.toString(16)}`
  }

  const hash = (await window.ethereum.request({
    method: "eth_sendTransaction",
    params: [transactionParams],
  })) as string

  // Ensure hash is in the correct format (0x prefix)
  const txHash = hash.startsWith("0x") ? (hash as `0x${string}`) : (`0x${hash}` as `0x${string}`)

  console.log("Deployment transaction sent:", {
    txHash,
    smartAccountAddress,
  })

  // Wait for the transaction to be mined
  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })

  console.log("Smart account deployed:", {
    txHash,
    smartAccountAddress,
    blockNumber: receipt.blockNumber,
    status: receipt.status,
  })

  return {
    smartAccountAddress,
    txHash: txHash as string, // Return as string to match return type
    gasEstimate,
    gasPrice,
    estimatedCost,
  }
}

