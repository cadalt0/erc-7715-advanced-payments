"use client"

import { useEffect, useState } from "react"
import { createPublicClient, http } from "viem"
import { CircleABI } from "@/lib/circle-abis"

const RPC_URL = "https://sepolia.base.org"

export interface MemberPermission {
  memberAddress: string
  tokenName: string
  tokenAddress: string
  amountGiven: bigint
  amountUsed: bigint
  amountLeft: bigint
  expiresAt: bigint
  hasAdvancedPermission: boolean
  joinedAt: bigint
  loading: boolean
  error: string | null
}

/**
 * Hook to fetch all members' permission details from a circle
 */
export function useAllMembersPermissions(
  circleAddress: string | null,
  memberAddresses: string[],
  enabled: boolean = true
): { members: MemberPermission[]; loading: boolean; error: string | null } {
  const [members, setMembers] = useState<MemberPermission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !circleAddress || memberAddresses.length === 0) {
      setLoading(false)
      return
    }

    const fetchAllMembers = async () => {
      try {
        setLoading(true)
        setError(null)

        const publicClient = createPublicClient({
          transport: http(RPC_URL),
        })

        // Fetch all members' details in parallel
        const memberPromises = memberAddresses.map(async (addr) => {
          try {
            const memberData = await publicClient.readContract({
              address: circleAddress as `0x${string}`,
              abi: CircleABI,
              functionName: "getMember",
              args: [addr as `0x${string}`],
            }) as any

            const permContext = memberData.permission.permissionsContext || "0x"
            const hasAdvanced = permContext !== "0x" && permContext !== ""

            return {
              memberAddress: addr,
              tokenName: memberData.permission.tokenName,
              tokenAddress: memberData.permission.tokenAddress,
              amountGiven: memberData.permission.amountGiven,
              amountUsed: memberData.permission.amountUsed,
              amountLeft: memberData.permission.amountLeft,
              expiresAt: memberData.permission.expiresAt,
              hasAdvancedPermission: hasAdvanced,
              joinedAt: memberData.joinedAt,
              loading: false,
              error: null,
            } as MemberPermission
          } catch (err) {
            return {
              memberAddress: addr,
              tokenName: "",
              tokenAddress: "0x",
              amountGiven: BigInt(0),
              amountUsed: BigInt(0),
              amountLeft: BigInt(0),
              expiresAt: BigInt(0),
              hasAdvancedPermission: false,
              joinedAt: BigInt(0),
              loading: false,
              error: err instanceof Error ? err.message : String(err),
            } as MemberPermission
          }
        })

        const results = await Promise.all(memberPromises)
        setMembers(results)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error("Error fetching all members permissions:", message)
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchAllMembers()
  }, [circleAddress, memberAddresses, enabled])

  return { members, loading, error }
}
