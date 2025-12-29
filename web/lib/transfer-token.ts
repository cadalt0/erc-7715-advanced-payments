"use client"

import { type Address, type Hash, createPublicClient, http } from "viem"
import { CircleABI } from "./circle-abis"

const RPC_URL = "https://sepolia.base.org"

/**
 * Transfer token result
 */
export interface TransferTokenResult {
  success: boolean
  fromMember: Address
  recipient: Address
  amount: bigint
  tokenAddress: Address
  txHash: string
  amountUsedBefore: bigint
  amountUsedAfter: bigint
  error?: string
}

/**
 * Transfer token from a member's permission to a recipient
 * 
 * @param circleAddress - The circle contract address
 * @param fromMember - The member whose permission to use
 * @param tokenAddress - The token address to transfer
 * @param recipient - The recipient address
 * @param amount - The amount to transfer
 * @param provider - EIP1193 wallet provider
 * @param callerAddress - The connected wallet address (must be a member)
 * @returns Transfer result with transaction details
 */
export async function transferToken(
  circleAddress: string,
  fromMember: string,
  tokenAddress: string,
  recipient: string,
  amount: bigint,
  provider: any,
  callerAddress: string
): Promise<TransferTokenResult> {
  if (!circleAddress || !fromMember || !tokenAddress || !recipient || !provider || !callerAddress) {
    return {
      success: false,
      fromMember: "0x" as Address,
      recipient: "0x" as Address,
      amount: BigInt(0),
      tokenAddress: "0x" as Address,
      txHash: "",
      amountUsedBefore: BigInt(0),
      amountUsedAfter: BigInt(0),
      error: "Missing required parameters",
    }
  }

  try {
    console.log("Transfer Token - Starting...")
    console.log("Circle Address:", circleAddress)
    console.log("From Member:", fromMember)
    console.log("Token Address:", tokenAddress)
    console.log("Recipient:", recipient)
    console.log("Amount:", amount.toString())
    console.log("Caller:", callerAddress)

    // Create public client for checks
    const publicClient = createPublicClient({
      transport: http(RPC_URL),
    })

    // Check if caller is a member
    const isCallerMember = await publicClient.readContract({
      address: circleAddress as Address,
      abi: CircleABI,
      functionName: "isMember",
      args: [callerAddress as Address],
    }) as boolean

    if (!isCallerMember) {
      return {
        success: false,
        fromMember: fromMember as Address,
        recipient: recipient as Address,
        amount,
        tokenAddress: tokenAddress as Address,
        txHash: "",
        amountUsedBefore: BigInt(0),
        amountUsedAfter: BigInt(0),
        error: "You must be a member of the circle to transfer tokens",
      }
    }

    // Get fromMember details to verify permission
    const fromMemberDetails = await publicClient.readContract({
      address: circleAddress as Address,
      abi: CircleABI,
      functionName: "getMember",
      args: [fromMember as Address],
    }) as any

    console.log("\nFrom Member Permission Details:")
    console.log("  Token Name:", fromMemberDetails.permission.tokenName)
    console.log("  Token Address:", fromMemberDetails.permission.tokenAddress)
    console.log("  Amount Given:", fromMemberDetails.permission.amountGiven.toString())
    console.log("  Amount Used:", fromMemberDetails.permission.amountUsed.toString())
    console.log("  Amount Left:", fromMemberDetails.permission.amountLeft.toString())

    // Verify token address matches
    if (fromMemberDetails.permission.tokenAddress.toLowerCase() !== tokenAddress.toLowerCase()) {
      return {
        success: false,
        fromMember: fromMember as Address,
        recipient: recipient as Address,
        amount,
        tokenAddress: tokenAddress as Address,
        txHash: "",
        amountUsedBefore: fromMemberDetails.permission.amountUsed,
        amountUsedAfter: fromMemberDetails.permission.amountUsed,
        error: `Token address mismatch! Member has permission for ${fromMemberDetails.permission.tokenAddress}`,
      }
    }

    // Verify amount left is sufficient
    if (fromMemberDetails.permission.amountLeft < amount) {
      return {
        success: false,
        fromMember: fromMember as Address,
        recipient: recipient as Address,
        amount,
        tokenAddress: tokenAddress as Address,
        txHash: "",
        amountUsedBefore: fromMemberDetails.permission.amountUsed,
        amountUsedAfter: fromMemberDetails.permission.amountUsed,
        error: `Insufficient amount! Member has ${(Number(fromMemberDetails.permission.amountLeft) / 1_000_000).toFixed(2)} left`,
      }
    }

    // Check if permission is expired
    if (fromMemberDetails.permission.expiresAt > BigInt(0) && BigInt(Math.floor(Date.now() / 1000)) > fromMemberDetails.permission.expiresAt) {
      return {
        success: false,
        fromMember: fromMember as Address,
        recipient: recipient as Address,
        amount,
        tokenAddress: tokenAddress as Address,
        txHash: "",
        amountUsedBefore: fromMemberDetails.permission.amountUsed,
        amountUsedAfter: fromMemberDetails.permission.amountUsed,
        error: "Permission has expired",
      }
    }

    // Check if permissionsContext is valid (not empty)
    const permissionsContext = fromMemberDetails.permission.permissionsContext
    const isContextEmpty = !permissionsContext || permissionsContext === "0x" || permissionsContext.length === 0
    if (isContextEmpty) {
      return {
        success: false,
        fromMember: fromMember as Address,
        recipient: recipient as Address,
        amount,
        tokenAddress: tokenAddress as Address,
        txHash: "",
        amountUsedBefore: fromMemberDetails.permission.amountUsed,
        amountUsedAfter: fromMemberDetails.permission.amountUsed,
        error: "Member has not given advanced delegation permission yet",
      }
    }

    console.log("\n✅ All checks passed. Encoding transaction...")

    // Encode the transferToken function call
    const { encodeFunctionData } = await import("viem")
    const data = encodeFunctionData({
      abi: CircleABI,
      functionName: "transferToken",
      args: [
        fromMember as Address,
        tokenAddress as Address,
        recipient as Address,
        amount,
      ],
    })

    // Send transaction
    const transactionRequest = {
      to: circleAddress as `0x${string}`,
      from: callerAddress as `0x${string}`,
      data: data,
    }

    console.log("Sending transferToken transaction...")
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
        fromMember: fromMember as Address,
        recipient: recipient as Address,
        amount,
        tokenAddress: tokenAddress as Address,
        txHash: hash,
        amountUsedBefore: fromMemberDetails.permission.amountUsed,
        amountUsedAfter: fromMemberDetails.permission.amountUsed,
        error: "Transaction pending - could not get receipt in time",
      }
    }

    // If transaction reverted, surface as error
    const statusOk = receipt.status === "0x1" || receipt.status === 1 || receipt.status === "success"
    if (!statusOk) {
      return {
        success: false,
        fromMember: fromMember as Address,
        recipient: recipient as Address,
        amount,
        tokenAddress: tokenAddress as Address,
        txHash: hash,
        amountUsedBefore: fromMemberDetails.permission.amountUsed,
        amountUsedAfter: fromMemberDetails.permission.amountUsed,
        error: "Transaction failed or reverted",
      }
    }

    // Get updated member details
    const updatedMemberDetails = await publicClient.readContract({
      address: circleAddress as Address,
      abi: CircleABI,
      functionName: "getMember",
      args: [fromMember as Address],
    }) as any

    console.log("\n✅ Transfer successful!")
    console.log("Amount Used Before:", fromMemberDetails.permission.amountUsed.toString())
    console.log("Amount Used After:", updatedMemberDetails.permission.amountUsed.toString())

    return {
      success: true,
      fromMember: fromMember as Address,
      recipient: recipient as Address,
      amount,
      tokenAddress: tokenAddress as Address,
      txHash: hash,
      amountUsedBefore: fromMemberDetails.permission.amountUsed,
      amountUsedAfter: updatedMemberDetails.permission.amountUsed,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Failed to transfer token:", error)

    return {
      success: false,
      fromMember: fromMember as Address,
      recipient: recipient as Address,
      amount,
      tokenAddress: tokenAddress as Address,
      txHash: "",
      amountUsedBefore: BigInt(0),
      amountUsedAfter: BigInt(0),
      error: errorMessage,
    }
  }
}
