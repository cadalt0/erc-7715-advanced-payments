"use client"

import { useState } from "react"
import { useWalletClient } from "wagmi"
import { Loader2, Check, AlertCircle, Copy, CheckCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createJoinCode, type JoinCodeResult } from "@/lib/create-join-code"

interface CreateJoinCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  circleAddress: string
  circleName: string
  walletAddress?: string
}

export function CreateJoinCodeDialog({
  open,
  onOpenChange,
  circleAddress,
  circleName,
  walletAddress,
}: CreateJoinCodeDialogProps) {
  const { data: walletClient } = useWalletClient()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<JoinCodeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const handleCreate = async () => {
    if (!walletAddress) {
      setError("Please connect your wallet first")
      return
    }

    if (!walletClient) {
      setError("No wallet connected. Please ensure you're connected.")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setCopied(false)

    try {
      console.log("CreateJoinCodeDialog - Using wagmi wallet client...")
      const provider = walletClient.transport as any
      
      if (!provider) {
        throw new Error("Failed to get wallet provider")
      }
      
      console.log("CreateJoinCodeDialog - Calling createJoinCode...")

      // Create the join code (with no expiry by default)
      const createResult = await createJoinCode(
        circleAddress,
        provider,
        walletAddress,
        BigInt(0) // No expiry
      )

      if (createResult.success) {
        setResult(createResult)
      } else {
        setError(createResult.error || "Failed to create join code")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(errorMessage)
      console.error("Dialog error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (result?.plaintext) {
      await navigator.clipboard.writeText(result.plaintext)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyLink = async () => {
    if (result?.codeId && result?.plaintext) {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
      const joinLink = `${baseUrl}/joincode?circle=${circleAddress}&codeId=${result.codeId}&code=${result.plaintext}`
      await navigator.clipboard.writeText(joinLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  const handleReset = () => {
    setError(null)
    setResult(null)
    setCopied(false)
    setLinkCopied(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Join Code</DialogTitle>
          <DialogDescription>
            Generate a secure join code for <span className="font-semibold">{circleName}</span>
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            {/* Info section */}
            {!loading && !error && (
              <div className="rounded-lg border border-border/50 bg-card/50 p-4">
                <p className="text-sm text-muted-foreground">
                  This will generate a unique join code that can be shared with others to join your circle.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  The code will never expire and can be used once.
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
                <p className="text-sm text-muted-foreground">Generating join code...</p>
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
                onClick={handleCreate}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Generate Code"
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
                <h3 className="text-lg font-semibold text-foreground">Join Code Created!</h3>
                <p className="mt-1 text-sm text-muted-foreground">Share this code to invite members</p>
              </div>
            </div>

            {/* Join code display */}
            <div className="space-y-3 rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Join Code
                </p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <p className="font-mono text-2xl font-bold tracking-widest text-primary">
                    {result.plaintext}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopy}
                    className="h-8 w-8 p-0"
                  >
                    {copied ? (
                      <CheckCheck className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <p className="mt-1 text-xs text-success">Copied to clipboard!</p>
                )}
              </div>
            </div>

            {/* Join link display */}
            <div className="space-y-2 rounded-lg border border-border/50 bg-card/50 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Join Link</p>
                  <p className="text-xs font-mono text-foreground break-all">
                    {typeof window !== "undefined" && `${window.location.origin}/joincode?circle=${circleAddress}&codeId=${result.codeId}&code=${result.plaintext}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyLink}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  {linkCopied ? (
                    <CheckCheck className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {linkCopied && (
                <p className="text-xs text-success">Link copied to clipboard!</p>
              )}
            </div>

            {/* Code details */}
            <div className="space-y-2 rounded-lg border border-border/50 bg-card/50 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Code ID:</span>
                <span className="font-medium text-foreground">{result.codeId.toString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium text-foreground">
                  {new Date(Number(result.createdAt) * 1000).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expires:</span>
                <span className="font-medium text-foreground">Never</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-success">Active</span>
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
