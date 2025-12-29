"use client"

import { encodeFunctionData, type Address, type Hash, createPublicClient, http } from "viem"
import { CircleABI } from "./circle-abis"

const RPC_URL = "https://sepolia.base.org"

/**
 * Result from updating member permission
 */
export interface UpdatePermissionResult {
  success: boolean
  memberAddress: Address
  tokenName: string
  tokenAddress: Address
  permissionsContext: string
  txHash: string
  error?: string
}

/**
 * Update member permission on circle contract
 * 
 * @param circleAddress - The circle contract address
 * @param memberAddress - The member address to update
 * @param tokenName - Token name
 * @param tokenAddress - Token address
 * @param permissionsContext - Permissions context from ERC-7715 delegation
 * @param expiresAt - Expiry timestamp
 * @param provider - EIP1193 wallet provider
 * @param walletAddress - Connected wallet address
 * @returns Update result
 */
export async function updateMemberPermission(
  circleAddress: string,
  memberAddress: string,
  tokenName: string,
  tokenAddress: string,
  permissionsContext: string,
  expiresAt: number,
  provider: any,
  walletAddress: string
): Promise<UpdatePermissionResult> {
  if (!circleAddress || !memberAddress || !tokenName || !tokenAddress || !permissionsContext) {
    return {
      success: false,
      memberAddress: "0x" as Address,
      tokenName: "",
      tokenAddress: "0x" as Address,
      permissionsContext: "",
      txHash: "",
      error: "Missing required parameters",
    }
  }

  // Only member can update their own permission
  if (memberAddress.toLowerCase() !== walletAddress.toLowerCase()) {
    return {
      success: false,
      memberAddress: memberAddress as Address,
      tokenName: "",
      tokenAddress: "0x" as Address,
      permissionsContext: "",
      txHash: "",
      error: "Only the member can update their own permission",
    }
  }

  try {
    console.log("Updating member permission...")
    console.log("Circle Address:", circleAddress)
    console.log("Member Address:", memberAddress)
    console.log("Token Name:", tokenName)
    console.log("Token Address:", tokenAddress)
    console.log("Permissions Context Length:", permissionsContext.length, "characters")

    // Create public client for reading current state
    const publicClient = createPublicClient({
      transport: http(RPC_URL),
    })

    // Get current member details to preserve amount
    const currentMember = await publicClient.readContract({
      address: circleAddress as Address,
      abi: CircleABI,
      functionName: "getMember",
      args: [memberAddress as Address],
    }) as any

    console.log("Current Amount Given:", currentMember.permission.amountGiven.toString())

    // Encode updateMemberPermission function call
    // operationType 2 = Set absolute (keeps current amount)
    const data = encodeFunctionData({
      abi: CircleABI,
      functionName: "updateMemberPermission",
      args: [
        memberAddress as Address,
        tokenName,
        tokenAddress as Address,
        currentMember.permission.amountGiven, // Keep current amount
        2, // operationType 2 = Set absolute
        BigInt(expiresAt),
        permissionsContext as `0x${string}`,
      ],
    })

    console.log("Encoded function data:", data)

    // Send transaction via provider
    const transactionRequest = {
      to: circleAddress as `0x${string}`,
      from: walletAddress as `0x${string}`,
      data: data,
    }

    console.log("Sending transaction...")
    const hash = await provider.request({
      method: "eth_sendTransaction",
      params: [transactionRequest],
    }) as Hash

    console.log("Transaction hash:", hash)

    // Wait for transaction confirmation
    console.log("Waiting for confirmation...")
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
        console.log(`Waiting... (${attempts + 1}/${maxAttempts})`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        attempts++
      }
    }

    if (!receipt) {
      throw new Error("Transaction not confirmed after 30 seconds")
    }

    // Verify update
    const updatedMember = await publicClient.readContract({
      address: circleAddress as Address,
      abi: CircleABI,
      functionName: "getMember",
      args: [memberAddress as Address],
    }) as any

    console.log("Updated Permission:")
    console.log("  Token Name:", updatedMember.permission.tokenName)
    console.log("  Token Address:", updatedMember.permission.tokenAddress)
    console.log("  Context Length:", updatedMember.permission.permissionsContext.length, "bytes")

    return {
      success: true,
      memberAddress: memberAddress as Address,
      tokenName: updatedMember.permission.tokenName,
      tokenAddress: updatedMember.permission.tokenAddress,
      permissionsContext: updatedMember.permission.permissionsContext,
      txHash: hash,
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error("Error updating permission:", errorMessage)
    return {
      success: false,
      memberAddress: memberAddress as Address,
      tokenName: "",
      tokenAddress: "0x" as Address,
      permissionsContext: "",
      txHash: "",
      error: errorMessage,
    }
  }
}
