"use client"

import { keccak256, encodePacked, type Address, type Hash, createPublicClient, http } from "viem"
import { CircleABI } from "./circle-abis"

const RPC_URL = "https://sepolia.base.org"

// Default token configuration (Join token on Base Sepolia)
const DEFAULT_TOKEN_NAME = "Join"
const DEFAULT_TOKEN_ADDRESS = "0x7FDf680547041A7144070C4Be89D7b19A9fA6e18" as Address
const DEFAULT_TOKEN_AMOUNT = BigInt("1000000") // 1 Join (6 decimals)
const DEFAULT_EXPIRY = BigInt(0) // No expiry
const DEFAULT_PERMISSIONS_CONTEXT = "0x" // Empty permissions context

/**
 * Join circle result
 */
export interface JoinCircleResult {
  success: boolean
  memberAddress: Address
  tokenName: string
  tokenAddress: Address
  amountGiven: bigint
  amountUsed: bigint
  amountLeft: bigint
  expiresAt: bigint
  joinedAt: bigint
  txHash: string
  error?: string
}

/**
 * Token configuration for joining
 */
export interface TokenConfig {
  tokenName: string
  tokenAddress: string
  amountGiven: bigint
  expiresAt: bigint
  permissionsContext: string
}

/**
 * Join a circle using a join code
 * 
 * @param circleAddress - The circle contract address
 * @param provider - EIP1193 wallet provider from Privy
 * @param walletAddress - The connected wallet address
 * @param codeId - The join code ID
 * @param plaintextCode - The plaintext join code (e.g., "ABCD1234EFGH")
 * @param tokenConfig - Token configuration (defaults to USDC)
 * @returns Join result with member details
 */
export async function joinCircle(
  circleAddress: string,
  provider: any,
  walletAddress: string,
  codeId: bigint,
  plaintextCode: string,
  tokenConfig?: Partial<TokenConfig>
): Promise<JoinCircleResult> {
  if (!circleAddress || !provider || !walletAddress || !plaintextCode) {
    return {
      success: false,
      memberAddress: "0x" as Address,
      tokenName: "",
      tokenAddress: "0x" as Address,
      amountGiven: BigInt(0),
      amountUsed: BigInt(0),
      amountLeft: BigInt(0),
      expiresAt: BigInt(0),
      joinedAt: BigInt(0),
      txHash: "",
      error: "Missing required parameters",
    }
  }

  // Merge with defaults
  const config: TokenConfig = {
    tokenName: tokenConfig?.tokenName || DEFAULT_TOKEN_NAME,
    tokenAddress: tokenConfig?.tokenAddress || DEFAULT_TOKEN_ADDRESS,
    amountGiven: tokenConfig?.amountGiven || DEFAULT_TOKEN_AMOUNT,
    expiresAt: tokenConfig?.expiresAt || DEFAULT_EXPIRY,
    permissionsContext: tokenConfig?.permissionsContext || DEFAULT_PERMISSIONS_CONTEXT,
  }

  try {
    console.log("Joining circle...")
    console.log("Circle Address:", circleAddress)
    console.log("Wallet Address:", walletAddress)
    console.log("Code ID:", codeId.toString())
    console.log("Plaintext Code:", plaintextCode)

    // Hash the code
    const codeHash = keccak256(encodePacked(["string"], [plaintextCode]))
    console.log("Code Hash:", codeHash)

    // Create public client for checks
    const publicClient = createPublicClient({
      transport: http(RPC_URL),
    })

    // Check if already a member
    const isMember = await publicClient.readContract({
      address: circleAddress as Address,
      abi: CircleABI,
      functionName: "isMember",
      args: [walletAddress as Address],
    }) as boolean

    if (isMember) {
      return {
        success: false,
        memberAddress: walletAddress as Address,
        tokenName: "",
        tokenAddress: "0x" as Address,
        amountGiven: BigInt(0),
        amountUsed: BigInt(0),
        amountLeft: BigInt(0),
        expiresAt: BigInt(0),
        joinedAt: BigInt(0),
        txHash: "",
        error: "You are already a member of this circle",
      }
    }

    console.log("\nToken Configuration:")
    console.log("  Token Name:", config.tokenName)
    console.log("  Token Address:", config.tokenAddress)
    console.log("  Amount Given:", config.amountGiven.toString())
    console.log("  Expires At:", config.expiresAt === BigInt(0) ? "Never" : new Date(Number(config.expiresAt) * 1000).toISOString())

    // Encode the joinCircle function call
    const { encodeFunctionData } = await import("viem")
    const data = encodeFunctionData({
      abi: CircleABI,
      functionName: "joinCircle",
      args: [
        codeId,
        codeHash,
        config.tokenName,
        config.tokenAddress as Address,
        config.amountGiven,
        config.expiresAt,
        config.permissionsContext as `0x${string}`,
      ],
    })

    // Send transaction
    const transactionRequest = {
      to: circleAddress as `0x${string}`,
      from: walletAddress as `0x${string}`,
      data: data,
    }

    console.log("Sending joinCircle transaction...")
    const hash = await provider.request({
      method: "eth_sendTransaction",
      params: [transactionRequest],
    }) as Hash

    console.log("Transaction hash:", hash)

    console.log("Waiting for transaction receipt...")
    
    // Wait for transaction with timeout
    let receipt = null
    let attempts = 0
    const maxAttempts = 30

    while (attempts < maxAttempts) {
      try {
        receipt = await publicClient.getTransactionReceipt({ hash })
        if (receipt) {
          console.log("Transaction confirmed in block:", receipt.blockNumber)
          break
        }
      } catch (e) {
        // Transaction not yet confirmed
      }
      
      if (!receipt) {
        console.log(`Waiting for transaction... (${attempts + 1}/${maxAttempts})`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        attempts++
      }
    }

    if (!receipt) {
      return {
        success: false,
        memberAddress: walletAddress as Address,
        tokenName: "",
        tokenAddress: "0x" as Address,
        amountGiven: BigInt(0),
        amountUsed: BigInt(0),
        amountLeft: BigInt(0),
        expiresAt: BigInt(0),
        joinedAt: BigInt(0),
        txHash: hash,
        error: "Transaction pending - could not get receipt in time",
      }
    }

    // If transaction reverted, surface as error
    const statusOk = receipt.status === "0x1" || receipt.status === 1 || receipt.status === "success"
    if (!statusOk) {
      return {
        success: false,
        memberAddress: walletAddress as Address,
        tokenName: "",
        tokenAddress: "0x" as Address,
        amountGiven: BigInt(0),
        amountUsed: BigInt(0),
        amountLeft: BigInt(0),
        expiresAt: BigInt(0),
        joinedAt: BigInt(0),
        txHash: hash,
        error: "Transaction failed or reverted",
      }
    }

    // Get member details
    try {
      const memberDetails = await publicClient.readContract({
        address: circleAddress as Address,
        abi: CircleABI,
        functionName: "getMember",
        args: [walletAddress as Address],
      }) as any

      console.log("\n✅ Successfully joined the circle!")
      console.log("Member Details:")
      console.log("  Address:", memberDetails.memberAddress)
      console.log("  Token Name:", memberDetails.permission.tokenName)
      console.log("  Amount Given:", memberDetails.permission.amountGiven.toString())
      console.log("  Amount Left:", memberDetails.permission.amountLeft.toString())

      return {
        success: true,
        memberAddress: memberDetails.memberAddress,
        tokenName: memberDetails.permission.tokenName,
        tokenAddress: memberDetails.permission.tokenAddress,
        amountGiven: memberDetails.permission.amountGiven,
        amountUsed: memberDetails.permission.amountUsed,
        amountLeft: memberDetails.permission.amountLeft,
        expiresAt: memberDetails.permission.expiresAt,
        joinedAt: memberDetails.joinedAt,
        txHash: hash,
      }
    } catch (error) {
      console.error("Failed to get member details:", error)
      // Still return success since transaction was confirmed
      return {
        success: true,
        memberAddress: walletAddress as Address,
        tokenName: config.tokenName,
        tokenAddress: config.tokenAddress as Address,
        amountGiven: config.amountGiven,
        amountUsed: BigInt(0),
        amountLeft: config.amountGiven,
        expiresAt: config.expiresAt,
        joinedAt: BigInt(Math.floor(Date.now() / 1000)),
        txHash: hash,
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Failed to join circle:", error)

    return {
      success: false,
      memberAddress: "0x" as Address,
      tokenName: "",
      tokenAddress: "0x" as Address,
      amountGiven: BigInt(0),
      amountUsed: BigInt(0),
      amountLeft: BigInt(0),
      expiresAt: BigInt(0),
      joinedAt: BigInt(0),
      txHash: "",
      error: errorMessage,
    }
  }
}
