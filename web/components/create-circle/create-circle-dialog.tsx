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
import { createCircle, type CreateCircleResult } from "@/lib/create-circle"

interface CreateCircleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  walletAddress?: string
  onCircleCreated?: (result: CreateCircleResult) => void
}

export function CreateCircleDialog({
  open,
  onOpenChange,
  walletAddress,
  onCircleCreated,
}: CreateCircleDialogProps) {
  const { data: walletClient } = useWalletClient()
  const [circleName, setCircleName] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CreateCircleResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!walletAddress) {
      setError("Please connect your wallet first")
      return
    }

    if (!circleName.trim()) {
      setError("Please enter a circle name")
      return
    }

    if (!walletClient) {
      setError("No wallet connected. Please ensure you're connected.")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("CreateCircleDialog - Using wagmi wallet client...")
      const provider = walletClient.transport as any
      
      if (!provider) {
        throw new Error("Failed to get wallet provider")
      }
      
      console.log("CreateCircleDialog - Calling createCircle with provider...")

      // Create the circle using the wallet's provider
      const createResult = await createCircle(walletAddress, circleName.trim(), provider)

      if (createResult.success) {
        setResult(createResult)
        setCircleName("")
        onCircleCreated?.(createResult)
      } else {
        setError(createResult.error || "Failed to create circle")
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
    setCircleName("")
    setError(null)
    setResult(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Circle</DialogTitle>
          <DialogDescription>
            Create a trusted circle to share financial freedom safely with your group.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            {/* Input section */}
            {!loading && (
              <div className="space-y-2">
                <Label htmlFor="circleName">Circle Name</Label>
                <Input
                  id="circleName"
                  placeholder="e.g., Family Circle, Friends Group"
                  value={circleName}
                  onChange={(e) => {
                    setCircleName(e.target.value)
                    setError(null)
                  }}
                  disabled={loading}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  {circleName.length}/100 characters
                </p>
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
                <p className="text-sm text-muted-foreground">Creating your circle...</p>
                <p className="text-xs text-muted-foreground">Please confirm the transaction in MetaMask</p>
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
                onClick={handleCreate}
                disabled={loading || !circleName.trim()}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Circle"
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Success state */
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="rounded-full bg-success/20 p-3">
                <Check className="h-6 w-6 text-success" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">Circle Created!</h3>
                <p className="mt-1 text-sm text-muted-foreground">Your circle is ready to use</p>
              </div>
            </div>

            {/* Circle details */}
            <div className="space-y-3 rounded-lg border border-border/50 bg-card/50 p-4">
              <div>
                <p className="text-xs text-muted-foreground">Circle Name</p>
                <p className="text-sm font-medium text-foreground">{result.circleName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Circle ID</p>
                <p className="text-sm font-medium text-foreground">{result.circleId.toString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Circle Address</p>
                <p className="break-all text-sm font-mono text-foreground">
                  {result.circleAddress}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Transaction</p>
                <a
                  href={`https://sepolia.basescan.org/tx/${result.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-primary hover:underline"
                >
                  {result.txHash.slice(0, 10)}...{result.txHash.slice(-8)}
                </a>
              </div>
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
