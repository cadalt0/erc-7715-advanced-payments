"use client"

import { useEffect, useState } from "react"
import { createPublicClient, http } from "viem"
import { CircleABI } from "@/lib/circle-abis"

const RPC_URL = "https://sepolia.base.org"

export interface PermissionContextResult {
  hasPermission: boolean
  permissionsContext: string
  tokenName: string
  tokenAddress: string
  amountGiven: bigint
  amountUsed: bigint
  amountLeft: bigint
  expiresAt: bigint
  loading: boolean
  error: string | null
}

/**
 * Hook to check member's permission context in a circle
 * Returns true if permissionsContext has content (not "0x")
 */
export function useCheckPermissionContext(
  circleAddress: string | null,
  memberAddress: string | null,
  enabled: boolean = true
): PermissionContextResult {
  const [result, setResult] = useState<PermissionContextResult>({
    hasPermission: false,
    permissionsContext: "0x",
    tokenName: "",
    tokenAddress: "0x",
    amountGiven: BigInt(0),
    amountUsed: BigInt(0),
    amountLeft: BigInt(0),
    expiresAt: BigInt(0),
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!enabled || !circleAddress || !memberAddress) {
      setResult((prev) => ({ ...prev, loading: false }))
      return
    }

    const fetchPermission = async () => {
      try {
        setResult((prev) => ({ ...prev, loading: true, error: null }))

        const publicClient = createPublicClient({
          transport: http(RPC_URL),
        })

        // Check if member exists
        const isMember = await publicClient.readContract({
          address: circleAddress as `0x${string}`,
          abi: CircleABI,
          functionName: "isMember",
          args: [memberAddress as `0x${string}`],
        })

        if (!isMember) {
          setResult((prev) => ({
            ...prev,
            hasPermission: false,
            permissionsContext: "0x",
            loading: false,
            error: null,
          }))
          return
        }

        // Get member details
        const member = await publicClient.readContract({
          address: circleAddress as `0x${string}`,
          abi: CircleABI,
          functionName: "getMember",
          args: [memberAddress as `0x${string}`],
        }) as any

        const permContext = member.permission.permissionsContext || "0x"
        const hasAdvancedPermission = permContext !== "0x" && permContext !== ""

        setResult({
          hasPermission: hasAdvancedPermission,
          permissionsContext: permContext,
          tokenName: member.permission.tokenName,
          tokenAddress: member.permission.tokenAddress,
          amountGiven: member.permission.amountGiven,
          amountUsed: member.permission.amountUsed,
          amountLeft: member.permission.amountLeft,
          expiresAt: member.permission.expiresAt,
          loading: false,
          error: null,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error("Error checking permission context:", message)
        setResult((prev) => ({
          ...prev,
          loading: false,
          error: message,
        }))
      }
    }

    fetchPermission()
  }, [circleAddress, memberAddress, enabled])

  return result
}
