"use client"

import { useState } from "react"
import { useWalletClient } from "wagmi"
import { Loader2, Check, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { joinCircle, type JoinCircleResult } from "@/lib/join-circle"

interface JoinCircleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  walletAddress?: string
  provider?: any
  onCircleJoined?: () => void
}

export function JoinCircleDialog({
  open,
  onOpenChange,
  walletAddress,
  provider,
  onCircleJoined,
}: JoinCircleDialogProps) {
  const { data: walletClient } = useWalletClient()
  const [circleAddress, setCircleAddress] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [codeId, setCodeId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<JoinCircleResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleJoin = async () => {
    if (!walletAddress) {
      setError("Please connect your wallet first")
      return
    }

    if (!circleAddress.trim() || !joinCode.trim() || !codeId.trim()) {
      setError("Please fill in all fields")
      return
    }

    if (!walletClient && !provider) {
      setError("No wallet provider. Please connect your wallet.")
      return
    }

    // Validate Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(circleAddress)) {
      setError("Invalid circle address format")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("JoinCircleDialog - Using wallet provider...")
      const eip1193 = provider || (typeof window !== "undefined" ? (window as any).ethereum : null)
      if (!eip1193) {
        throw new Error("Failed to resolve EIP-1193 provider")
      }
      
      console.log("JoinCircleDialog - Calling joinCircle...")

      // Join the circle
      const joinResult = await joinCircle(
        circleAddress.trim(),
        eip1193,
        walletAddress,
        BigInt(codeId),
        joinCode.trim().toUpperCase()
      )

      if (joinResult.success) {
        setResult(joinResult)
        onCircleJoined?.()
      } else {
        setError(joinResult.error || "Failed to join circle")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(errorMessage)
      console.error("Dialog error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setCircleAddress("")
    setJoinCode("")
    setCodeId("")
    setError(null)
    setResult(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Circle</DialogTitle>
          <DialogDescription>
            Enter the circle address and join code to become a member
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            {/* Input section */}
            {!loading && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="circleAddress">Circle Address</Label>
                  <Input
                    id="circleAddress"
                    placeholder="0x..."
                    value={circleAddress}
                    onChange={(e) => {
                      setCircleAddress(e.target.value)
                      setError(null)
                    }}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codeId">Code ID</Label>
                  <Input
                    id="codeId"
                    type="number"
                    placeholder="0"
                    value={codeId}
                    onChange={(e) => {
                      setCodeId(e.target.value)
                      setError(null)
                    }}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ask the circle admin for the code ID
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="joinCode">Join Code</Label>
                  <Input
                    id="joinCode"
                    placeholder="ABCD1234EFGH"
                    value={joinCode}
                    onChange={(e) => {
                      setJoinCode(e.target.value.toUpperCase())
                      setError(null)
                    }}
                    disabled={loading}
                    maxLength={12}
                    className="font-mono text-lg tracking-wider"
                  />
                  <p className="text-xs text-muted-foreground">
                    12-character code from circle admin
                  </p>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="flex gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Joining circle...</p>
                <p className="text-xs text-muted-foreground">Please confirm the transaction</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoin}
                disabled={loading || !circleAddress || !joinCode || !codeId}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Join Circle"
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Success state */
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="rounded-full bg-success/20 p-3">
                <Check className="h-6 w-6 text-success" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">Successfully Joined!</h3>
                <p className="mt-1 text-sm text-muted-foreground">You are now a member of this circle</p>
              </div>
            </div>

            {/* Member details */}
            <div className="space-y-3 rounded-lg border border-border/50 bg-card/50 p-4">
              <div>
                <p className="text-xs text-muted-foreground">Member Address</p>
                <p className="break-all text-sm font-mono text-foreground">{result.memberAddress}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Token Permission</p>
                <p className="text-sm font-medium text-foreground">{result.tokenName}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Amount Given</p>
                  <p className="text-sm font-medium text-foreground">{result.amountGiven.toString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount Left</p>
                  <p className="text-sm font-medium text-success">{result.amountLeft.toString()}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Joined At</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(Number(result.joinedAt) * 1000).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expires</p>
                <p className="text-sm font-medium text-foreground">
                  {result.expiresAt === BigInt(0) ? "Never" : new Date(Number(result.expiresAt) * 1000).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Transaction link */}
            <div className="text-center">
              <a
                href={`https://sepolia.basescan.org/tx/${result.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                View transaction →
              </a>
            </div>

            <Button
              onClick={handleReset}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
