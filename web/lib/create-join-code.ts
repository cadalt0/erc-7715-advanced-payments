"use client"

import { keccak256, encodePacked, type Address, type Hash, createPublicClient, http } from "viem"
import { CircleABI } from "./circle-abis"

const RPC_URL = "https://sepolia.base.org"

/**
 * Join code result
 */
export interface JoinCodeResult {
  success: boolean
  codeId: bigint
  plaintext: string
  hash: string
  createdAt: bigint
  expiresAt: bigint
  isUsed: boolean
  txHash: string
  error?: string
}

/**
 * Generate a random alphanumeric join code
 */
function generateAlphanumericCode(length: number = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

/**
 * Create a join code for a circle
 * 
 * @param circleAddress - The circle contract address
 * @param provider - EIP1193 wallet provider from Privy
 * @param walletAddress - The connected wallet address (must be admin)
 * @param expiresAt - Unix timestamp for expiry (0 = no expiry)
 * @returns Join code result with details
 */
export async function createJoinCode(
  circleAddress: string,
  provider: any,
  walletAddress: string,
  expiresAt: bigint = BigInt(0)
): Promise<JoinCodeResult> {
  if (!circleAddress || !provider || !walletAddress) {
    return {
      success: false,
      codeId: BigInt(0),
      plaintext: "",
      hash: "",
      createdAt: BigInt(0),
      expiresAt: BigInt(0),
      isUsed: false,
      txHash: "",
      error: "Missing required parameters",
    }
  }

  try {
    // Generate random alphanumeric code
    const plaintextCode = generateAlphanumericCode(12)
    console.log("Generated plaintext code:", plaintextCode)

    // Hash the code using keccak256(abi.encodePacked(code))
    const codeHash = keccak256(encodePacked(["string"], [plaintextCode]))
    console.log("Code hash:", codeHash)
    console.log("Expires at:", expiresAt === BigInt(0) ? "Never" : new Date(Number(expiresAt) * 1000).toISOString())

    // Encode the createJoinCode function call
    const { encodeFunctionData } = await import("viem")
    const data = encodeFunctionData({
      abi: CircleABI,
      functionName: "createJoinCode",
      args: [codeHash, expiresAt],
    })

    // Send transaction
    const transactionRequest = {
      to: circleAddress as `0x${string}`,
      from: walletAddress as `0x${string}`,
      data: data,
    }

    console.log("Sending createJoinCode transaction...")
    const hash = await provider.request({
      method: "eth_sendTransaction",
      params: [transactionRequest],
    }) as Hash

    console.log("Transaction hash:", hash)

    // Create public client to wait for receipt
    const publicClient = createPublicClient({
      transport: http(RPC_URL),
    })

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
        codeId: BigInt(0),
        plaintext: plaintextCode,
        hash: codeHash,
        createdAt: BigInt(0),
        expiresAt,
        isUsed: false,
        txHash: hash,
        error: "Transaction pending - could not get receipt in time",
      }
    }

    // Parse E2 event (JoinCodeCreated)
    // E2(uint256 indexed circleId, uint256 indexed codeId, bytes32 indexed codeHash, uint256 expiresAt)
    const e2Event = receipt.logs.find((log) => 
      log.topics.length === 4 && 
      log.address.toLowerCase() === circleAddress.toLowerCase()
    )

    if (e2Event && e2Event.topics[2]) {
      const codeId = BigInt(e2Event.topics[2])
      console.log("Join code created with ID:", codeId.toString())

      // Get join code details from contract
      try {
        const joinCodeDetails = await publicClient.readContract({
          address: circleAddress as Address,
          abi: CircleABI,
          functionName: "getJoinCode",
          args: [codeId],
        }) as any

        console.log("✅ Join code created successfully!")
        console.log("   Code ID:", codeId.toString())
        console.log("   Plaintext:", plaintextCode)
        console.log("   Created at:", new Date(Number(joinCodeDetails.createdAt) * 1000).toISOString())

        return {
          success: true,
          codeId,
          plaintext: plaintextCode,
          hash: codeHash,
          createdAt: joinCodeDetails.createdAt,
          expiresAt: joinCodeDetails.expiresAt,
          isUsed: joinCodeDetails.isUsed,
          txHash: hash,
        }
      } catch (error) {
        console.error("Failed to get join code details:", error)
        // Still return success with what we know
        return {
          success: true,
          codeId,
          plaintext: plaintextCode,
          hash: codeHash,
          createdAt: BigInt(Math.floor(Date.now() / 1000)),
          expiresAt,
          isUsed: false,
          txHash: hash,
        }
      }
    }

    // No event found
    return {
      success: false,
      codeId: BigInt(0),
      plaintext: plaintextCode,
      hash: codeHash,
      createdAt: BigInt(0),
      expiresAt,
      isUsed: false,
      txHash: hash,
      error: "Join code created but event not found - please verify manually",
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Failed to create join code:", error)

    return {
      success: false,
      codeId: BigInt(0),
      plaintext: "",
      hash: "",
      createdAt: BigInt(0),
      expiresAt: BigInt(0),
      isUsed: false,
      txHash: "",
      error: errorMessage,
    }
  }
}
