"use client"

import { encodeFunctionData, type Address, type Hash, createPublicClient, http } from "viem"
import { CircleFactoryABI } from "./circle-abis"

// Hardcoded contract address
const FACTORY_ADDRESS = "0x1e30ca31827b66E9b7d4d32e67F59F7E83983213" as Address
const RPC_URL = "https://sepolia.base.org"

// Default token (Join token on Base Sepolia)
const DEFAULT_TOKEN_NAME = "Join"
const DEFAULT_TOKEN_ADDRESS = "0x7FDf680547041A7144070C4Be89D7b19A9fA6e18" as Address
const DEFAULT_TOKEN_AMOUNT = BigInt("1000000000000000000") // 1 token with 18 decimals
const DEFAULT_EXPIRY = BigInt(0) // No expiry

/**
 * Result from creating a circle
 */
export interface CreateCircleResult {
  success: boolean
  circleId: bigint
  circleAddress: Address
  admin: Address
  circleName: string
  txHash: string
  blockNumber: bigint
  error?: string
}

/**
 * Create a new circle via CircleFactory using wallet provider
 * 
 * @param walletAddress - The connected wallet address
 * @param circleName - Name for the new circle
 * @param provider - EIP1193 wallet provider from Privy
 * @param tokenName - Admin token name (defaults to USDC)
 * @param tokenAddress - Admin token address (defaults to USDC on Base Sepolia)
 * @param tokenAmount - Admin amount given (defaults to 1 token with 18 decimals)
 * @param expiresAt - Admin permission expiry (defaults to 0 = no expiry)
 * @returns Circle creation result with details
 */
export async function createCircle(
  walletAddress: string,
  circleName: string,
  provider: any, // EIP1193 provider from Privy wallet
  tokenName: string = DEFAULT_TOKEN_NAME,
  tokenAddress: string = DEFAULT_TOKEN_ADDRESS,
  tokenAmount: bigint = DEFAULT_TOKEN_AMOUNT,
  expiresAt: bigint = DEFAULT_EXPIRY
): Promise<CreateCircleResult> {
  if (!walletAddress) {
    return {
      success: false,
      circleId: BigInt(0),
      circleAddress: "0x" as Address,
      admin: "0x" as Address,
      circleName: "",
      txHash: "",
      blockNumber: BigInt(0),
      error: "Wallet not connected",
    }
  }

  if (!circleName || circleName.trim().length === 0) {
    return {
      success: false,
      circleId: BigInt(0),
      circleAddress: "0x" as Address,
      admin: "0x" as Address,
      circleName: "",
      txHash: "",
      blockNumber: BigInt(0),
      error: "Circle name cannot be empty",
    }
  }

  if (circleName.length > 100) {
    return {
      success: false,
      circleId: BigInt(0),
      circleAddress: "0x" as Address,
      admin: "0x" as Address,
      circleName: "",
      txHash: "",
      blockNumber: BigInt(0),
      error: "Circle name must be less than 100 characters",
    }
  }

  try {
    console.log("Creating circle with name:", circleName)
    console.log("Using account:", walletAddress)
    console.log("Token:", tokenName, "Address:", tokenAddress)
    console.log("Admin Amount:", tokenAmount.toString())

    // Encode the function call with all 5 parameters
    const data = encodeFunctionData({
      abi: CircleFactoryABI,
      functionName: "deployCircle",
      args: [circleName, tokenName, tokenAddress as Address, tokenAmount, expiresAt],
    })

    console.log("Encoded function data:", data)

    // Send transaction via provider
    const transactionRequest = {
      to: FACTORY_ADDRESS,
      from: walletAddress as `0x${string}`,
      data: data,
    }

    console.log("Transaction request:", transactionRequest)
    console.log("Calling eth_sendTransaction via provider...")

    // Use eth_sendTransaction to send the transaction
    const hash = await provider.request({
      method: "eth_sendTransaction",
      params: [transactionRequest],
    }) as Hash

    console.log("Transaction hash:", hash)

    // Create a public client to wait for receipt and parse events
    const publicClient = createPublicClient({
      transport: http(RPC_URL),
    })

    console.log("Waiting for transaction receipt...")
    
    // Wait for transaction with timeout
    let receipt = null
    let attempts = 0
    const maxAttempts = 30 // 30 attempts = ~30 seconds with 1 second intervals

    while (attempts < maxAttempts) {
      try {
        receipt = await publicClient.getTransactionReceipt({ hash })
        if (receipt) {
          console.log("Transaction confirmed in block:", receipt.blockNumber)
          break
        }
      } catch (e) {
        // Transaction not yet confirmed, wait and retry
      }
      
      if (!receipt) {
        console.log(`Waiting for transaction... (${attempts + 1}/${maxAttempts})`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        attempts++
      }
    }

    if (!receipt) {
      // Return with hash even if we couldn't get receipt yet
      console.log("Could not get receipt in time, but transaction was sent:", hash)
      return {
        success: true,
        circleId: BigInt(0),
        circleAddress: "0x" as Address,
        admin: walletAddress as Address,
        circleName,
        txHash: hash,
        blockNumber: BigInt(0),
        error: "Transaction pending - check status manually",
      }
    }

    // Parse E1 event from receipt
    // E1 has 4 topics: signature + 3 indexed params (circleId, admin, circleAddress)
    const e1Event = receipt.logs.find((log) => 
      log.topics.length === 4 && 
      log.address.toLowerCase() === FACTORY_ADDRESS.toLowerCase()
    )
    
    if (e1Event && e1Event.topics.length >= 4 && e1Event.topics[1] && e1Event.topics[2] && e1Event.topics[3]) {
      const circleId = BigInt(e1Event.topics[1])
      const admin = `0x${e1Event.topics[2].slice(-40)}` as Address
      const circleAddress = `0x${e1Event.topics[3].slice(-40)}` as Address
      
      console.log("\n=== Circle Created Successfully ===")
      console.log("Circle ID:", circleId.toString())
      console.log("Circle Address:", circleAddress)
      console.log("Admin:", admin)

      return {
        success: true,
        circleId,
        circleAddress,
        admin,
        circleName,
        txHash: hash,
        blockNumber: receipt.blockNumber,
      }
    } else {
      console.log("Could not find CircleCreated event in receipt")
      console.log("Receipt logs:", receipt.logs.length)
      
      // Still return success since transaction was confirmed
      return {
        success: true,
        circleId: BigInt(0),
        circleAddress: "0x" as Address,
        admin: walletAddress as Address,
        circleName,
        txHash: hash,
        blockNumber: receipt.blockNumber,
        error: "Circle created but event parsing failed - please verify manually",
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Failed to create circle:", error)

    return {
      success: false,
      circleId: BigInt(0),
      circleAddress: "0x" as Address,
      admin: "0x" as Address,
      circleName: "",
      txHash: "",
      blockNumber: BigInt(0),
      error: errorMessage,
    }
  }
}
