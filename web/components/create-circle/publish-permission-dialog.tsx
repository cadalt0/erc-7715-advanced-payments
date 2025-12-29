"use client"

import { useState } from "react"
import { Loader2, ShieldCheck, AlertCircle, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { updateMemberPermission, type UpdatePermissionResult } from "@/lib/update-member-permission"

interface PublishPermissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  circleAddress: string
  circleName: string
  memberAddress: string
  tokenName: string
  tokenAddress: string
  permissionsContext: string
  expiresAt: number
  provider?: any
  onPublished?: () => void
}

export function PublishPermissionDialog({
  open,
  onOpenChange,
  circleAddress,
  circleName,
  memberAddress,
  tokenName,
  tokenAddress,
  permissionsContext,
  expiresAt,
  provider,
  onPublished,
}: PublishPermissionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<UpdatePermissionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePublish = async () => {
    if (!provider) {
      setError("Wallet provider not available")
      return
    }

    if (!permissionsContext || permissionsContext === "0x") {
      setError("No permissions context to publish. Please complete Step 1 first.")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const updateResult = await updateMemberPermission(
        circleAddress,
        memberAddress,
        tokenName,
        tokenAddress,
        permissionsContext,
        expiresAt,
        provider,
        memberAddress
      )

      if (updateResult.success) {
        setResult(updateResult)
        // Call onPublished after a delay to let success box display
        setTimeout(() => {
          onPublished?.()
        }, 2500)
      } else {
        setError(updateResult.error || "Failed to publish permission")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setResult(null)
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Publish Permission to Circle
          </DialogTitle>
          <DialogDescription>
            Step 2: Publish your advanced permission details to <span className="font-semibold">{circleName}</span>
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-5">
            {/* Permission Summary */}
            <div className="space-y-3 rounded-xl border border-border/60 bg-gradient-to-br from-blue-500/5 to-blue-500/[0.02] p-5">
              <h3 className="text-sm font-semibold text-foreground">Permission Details</h3>
              
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Circle:</span>
                  <span className="font-mono text-xs text-foreground">{circleAddress.slice(0, 6)}...{circleAddress.slice(-4)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Member:</span>
                  <span className="font-mono text-xs text-foreground">{memberAddress.slice(0, 6)}...{memberAddress.slice(-4)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Token Name:</span>
                  <span className="font-semibold text-foreground">{tokenName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Token Address:</span>
                  <span className="font-mono text-xs text-foreground">{tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Context Size:</span>
                  <span className="font-semibold text-emerald-600">{permissionsContext.length} bytes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expires:</span>
                  <span className="text-xs text-foreground">
                    {expiresAt > 0 ? new Date(expiresAt * 1000).toLocaleDateString() : "Never"}
                  </span>
                </div>
              </div>
            </div>

            {/* Info box */}
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
              <div className="flex gap-3">
                <ShieldCheck className="h-5 w-5 flex-shrink-0 text-blue-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Publishing Advanced Permission</p>
                  <p className="text-xs text-muted-foreground">
                    This will update your circle membership with the advanced ERC-7715 permission context, enabling delegated transfers.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Publishing to circle...</p>
                <p className="text-xs text-muted-foreground">Please confirm in your wallet</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleClose} disabled={loading} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handlePublish}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Publish
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="rounded-full bg-emerald-100 p-3">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">Published Successfully!</h3>
                <p className="mt-1 text-sm text-muted-foreground">Permission updated on circle</p>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border/50 bg-card/50 p-4">
              <div>
                <p className="text-xs text-muted-foreground">Transaction Hash</p>
                <a
                  href={`https://sepolia.basescan.org/tx/${result.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-mono text-primary hover:underline break-all"
                >
                  {result.txHash}
                </a>
              </div>
              <div className="pt-2 border-t border-border/30">
                <p className="text-xs text-muted-foreground mb-2">Updated Details</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token:</span>
                    <span className="font-semibold text-foreground">{result.tokenName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-mono text-foreground">{result.tokenAddress.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Context:</span>
                    <span className="font-semibold text-emerald-600">{result.permissionsContext.length} bytes</span>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
