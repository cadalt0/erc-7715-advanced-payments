"use client"

import { useEffect, useState } from "react"
import { createPublicClient, http } from "viem"
import { CircleABI } from "@/lib/circle-abis"
import { Loader2, AlertCircle, Lock, Unlock } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface UseCycleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  circleAddress: string
  circleName: string
  memberAddress: string
}

const RPC_URL = "https://sepolia.base.org"

export function UseCycleDialog({
  open,
  onOpenChange,
  circleAddress,
  circleName,
  memberAddress,
}: UseCycleDialogProps) {
  const [loading, setLoading] = useState(false)
  const [memberData, setMemberData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !circleAddress || !memberAddress) {
      return
    }

    const fetchMemberDetails = async () => {
      setLoading(true)
      setError(null)

      try {
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
          setError("Not a member of this circle")
          setLoading(false)
          return
        }

        // Get member details
        const member = await publicClient.readContract({
          address: circleAddress as `0x${string}`,
          abi: CircleABI,
          functionName: "getMember",
          args: [memberAddress as `0x${string}`],
        }) as any

        setMemberData(member)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error("Error fetching member details:", message)
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchMemberDetails()
  }, [open, circleAddress, memberAddress])

  const hasAdvancedPermission =
    memberData?.permission.permissionsContext &&
    memberData?.permission.permissionsContext !== "0x" &&
    memberData?.permission.permissionsContext !== ""

  const isExpired =
    memberData?.permission.expiresAt > 0n &&
    memberData?.permission.expiresAt < BigInt(Math.floor(Date.now() / 1000))

  const percentUsed =
    memberData?.permission.amountGiven > 0n
      ? (
          (Number(memberData?.permission.amountUsed) /
            Number(memberData?.permission.amountGiven)) *
          100
        ).toFixed(1)
      : "0"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Use Circle</DialogTitle>
          <DialogDescription>
            Your permission details in <span className="font-semibold">{circleName}</span>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your permissions...</p>
          </div>
        ) : error ? (
          <div className="flex gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : memberData ? (
          <div className="space-y-5">
            {/* Token Details */}
            <div className="space-y-3 rounded-xl border border-border/60 bg-gradient-to-br from-purple-500/5 to-purple-500/[0.02] p-5">
              <h3 className="text-sm font-semibold text-foreground">Token Allocation</h3>
              
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Token Name:</span>
                  <span className="font-semibold text-foreground">{memberData.permission.tokenName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Token Address:</span>
                  <span className="font-mono text-xs text-foreground">
                    {memberData.permission.tokenAddress.slice(0, 8)}...{memberData.permission.tokenAddress.slice(-6)}
                  </span>
                </div>
              </div>
            </div>

            {/* Amount Details */}
            <div className="space-y-3 rounded-xl border border-border/60 bg-gradient-to-br from-blue-500/5 to-blue-500/[0.02] p-5">
              <h3 className="text-sm font-semibold text-foreground">Usage</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Given:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {(Number(memberData.permission.amountGiven) / Math.pow(10, 6)).toFixed(2)} {memberData.permission.tokenName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Used:</span>
                  <span className="font-mono font-semibold text-amber-600">
                    {(Number(memberData.permission.amountUsed) / Math.pow(10, 6)).toFixed(2)} {memberData.permission.tokenName}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Left:</span>
                  <span className="font-mono font-semibold text-emerald-600">
                    {(Number(memberData.permission.amountLeft) / Math.pow(10, 6)).toFixed(2)} {memberData.permission.tokenName}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Usage: {percentUsed}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all"
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Expiry Status */}
            <div className={`space-y-2 rounded-xl border p-4 ${
              isExpired
                ? "border-destructive/50 bg-destructive/10"
                : memberData.permission.expiresAt === 0n
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-blue-500/30 bg-blue-500/10"
            }`}>
              <div className="flex items-center gap-2">
                {isExpired ? (
                  <>
                    <Lock className="h-4 w-4 text-destructive" />
                    <span className="font-medium text-destructive">Permission Expired</span>
                  </>
                ) : memberData.permission.expiresAt === 0n ? (
                  <>
                    <Unlock className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium text-emerald-600">Never Expires</span>
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-600">
                      Expires {new Date(Number(memberData.permission.expiresAt) * 1000).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Advanced Permission Status */}
            <div className={`space-y-2 rounded-xl border p-4 ${
              hasAdvancedPermission
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-amber-500/30 bg-amber-500/10"
            }`}>
              {hasAdvancedPermission ? (
                <>
                  <div className="flex items-center gap-2">
                    <Unlock className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium text-emerald-600">Advanced Permission Available</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You have ERC-7715 delegated permission enabled for this circle.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-amber-600" />
                    <span className="font-medium text-amber-600">Not Given Yet</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Advanced permission has not been set up yet to use your funds. Click "Give Delegation" to enable delegated transfers.
                  </p>
                </>
              )}
            </div>

            <Button onClick={() => onOpenChange(false)} className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white">
              Close
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
