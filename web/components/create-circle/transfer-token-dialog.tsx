"use client"

import { useState, useEffect } from "react"
import { Loader2, Check, AlertCircle, ArrowRight } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { transferToken, type TransferTokenResult } from "@/lib/transfer-token"

interface MemberPermission {
  memberAddress: string
  tokenName: string
  tokenAddress: string
  amountLeft: bigint
  hasAdvancedPermission: boolean
}

interface TransferTokenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  circleAddress: string
  circleName: string
  members: MemberPermission[]
  provider?: any
  callerAddress?: string
  onTransferComplete?: () => void
}

export function TransferTokenDialog({
  open,
  onOpenChange,
  circleAddress,
  circleName,
  members,
  provider,
  callerAddress,
  onTransferComplete,
}: TransferTokenDialogProps) {
  const [selectedMember, setSelectedMember] = useState<string>("")
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("1")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TransferTokenResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Reset state when dialog is reopened
  useEffect(() => {
    if (open) {
      setSelectedMember("")
      setRecipient("")
      setAmount("1")
      setError(null)
      setResult(null)
      setLoading(false)
    }
  }, [open])

  // Filter members to only those with advanced permission
  const availableMembers = members.filter(m => m.hasAdvancedPermission)

  const selectedMemberData = availableMembers.find(m => m.memberAddress === selectedMember)

  const handleTransfer = async () => {
    if (!callerAddress) {
      setError("Please connect your wallet first")
      return
    }

    if (!selectedMember || !recipient.trim() || !amount.trim()) {
      setError("Please fill in all fields")
      return
    }

    if (!provider) {
      setError("No wallet provider available")
      return
    }

    // Validate Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      setError("Invalid recipient address format")
      return
    }

    const selectedMemberInfo = availableMembers.find(m => m.memberAddress === selectedMember)
    if (!selectedMemberInfo) {
      setError("Selected member not found")
      return
    }

    // Parse amount (assuming 6 decimals like USDC)
    const amountBigInt = BigInt(Math.floor(parseFloat(amount) * 1_000_000))
    
    if (amountBigInt <= BigInt(0)) {
      setError("Amount must be greater than 0")
      return
    }

    if (amountBigInt > selectedMemberInfo.amountLeft) {
      setError(`Insufficient balance! Member has ${(Number(selectedMemberInfo.amountLeft) / 1_000_000).toFixed(2)} left`)
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("TransferTokenDialog - Calling transferToken...")

      const transferResult = await transferToken(
        circleAddress,
        selectedMember,
        selectedMemberInfo.tokenAddress,
        recipient.trim(),
        amountBigInt,
        provider,
        callerAddress
      )

      if (transferResult.success) {
        setResult(transferResult)
        onTransferComplete?.()
      } else {
        setError(transferResult.error || "Failed to transfer token")
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
    setSelectedMember("")
    setRecipient("")
    setAmount("1")
    setError(null)
    setResult(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Tokens</DialogTitle>
          <DialogDescription>
            Transfer tokens using a member&apos;s delegation permission
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            {/* Input section */}
            {!loading && (
              <div className="space-y-4">
                {availableMembers.length === 0 ? (
                  <div className="flex gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-500" />
                    <p className="text-sm text-amber-700">
                      No members with advanced delegation permission available for transfer
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fromMember">Transfer From Member</Label>
                      <Select value={selectedMember} onValueChange={(value) => {
                        setSelectedMember(value)
                        setError(null)
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select member with permission" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMembers.map((member) => (
                            <SelectItem key={member.memberAddress} value={member.memberAddress}>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs">
                                  {member.memberAddress.slice(0, 6)}...{member.memberAddress.slice(-4)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ({(Number(member.amountLeft) / 1_000_000).toFixed(2)} {member.tokenName} left)
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedMemberData && (
                        <p className="text-xs text-muted-foreground">
                          Available: {(Number(selectedMemberData.amountLeft) / 1_000_000).toFixed(2)} {selectedMemberData.tokenName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recipient">Recipient Address</Label>
                      <Input
                        id="recipient"
                        placeholder="0x..."
                        value={recipient}
                        onChange={(e) => {
                          setRecipient(e.target.value)
                          setError(null)
                        }}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="1.00"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value)
                          setError(null)
                        }}
                        disabled={loading || !selectedMember}
                      />
                      <div className="space-y-1">
                        {selectedMemberData && (
                          <p className="text-xs text-muted-foreground">
                            Token: {selectedMemberData.tokenName}
                          </p>
                        )}
                        <p className="text-xs text-amber-600">Recommended: start with 1 to avoid decimal/limit issues.</p>
                      </div>
                    </div>
                  </>
                )}
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
                <p className="text-sm text-muted-foreground">Transferring tokens...</p>
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
                onClick={handleTransfer}
                disabled={loading || !selectedMember || !recipient || !amount || availableMembers.length === 0}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-90"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Transfer
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Success state */
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="rounded-full bg-emerald-500/20 p-3">
                <Check className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">Transfer Successful!</h3>
                <p className="mt-1 text-sm text-muted-foreground">Tokens have been transferred</p>
              </div>
            </div>

            {/* Transfer details */}
            <div className="space-y-3 rounded-lg border border-border/50 bg-card/50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">From Member</p>
                <p className="break-all text-sm font-mono text-foreground">
                  {result.fromMember.slice(0, 6)}...{result.fromMember.slice(-4)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">To Recipient</p>
                <p className="break-all text-sm font-mono text-foreground">
                  {result.recipient.slice(0, 6)}...{result.recipient.slice(-4)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Amount</p>
                <p className="text-sm font-medium text-foreground">
                  {(Number(result.amount) / 1_000_000).toFixed(2)} {selectedMemberData?.tokenName}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t pt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Used Before</p>
                  <p className="text-sm font-medium text-foreground">
                    {(Number(result.amountUsedBefore) / 1_000_000).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Used After</p>
                  <p className="text-sm font-medium text-emerald-600">
                    {(Number(result.amountUsedAfter) / 1_000_000).toFixed(2)}
                  </p>
                </div>
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
