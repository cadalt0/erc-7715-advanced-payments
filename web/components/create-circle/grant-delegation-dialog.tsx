"use client"

import { useEffect, useState } from "react"
import { Loader2, Check, AlertCircle, ShieldCheck } from "lucide-react"
import { createPublicClient, http, isAddress, erc20Abi } from "viem"
import { baseSepolia } from "viem/chains"

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
import { grantCircleDelegation, type GrantDelegationResult } from "@/lib/grant-delegation"
import { DelegationForm } from "./delegation-form"

interface GrantDelegationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  circleAddress: string
  circleName: string
  sessionAccountAddress?: string
  chainId?: number
  walletClient?: any
  userAddress?: string
  onPermissionGranted?: (result: GrantDelegationResult & { tokenName: string; tokenAddress: string; expiresAt: number }) => void
}

export function GrantDelegationDialog({
  open,
  onOpenChange,
  circleAddress,
  circleName,
  sessionAccountAddress,
  chainId = 84532, // Base Sepolia by default
  walletClient,
  userAddress,
  onPermissionGranted,
}: GrantDelegationDialogProps) {
  const [tokenAddress, setTokenAddress] = useState("0x7FDf680547041A7144070C4Be89D7b19A9fA6e18") // Join token Base Sepolia
  const [tokenName, setTokenName] = useState("Join")
  const [tokenDecimals, setTokenDecimals] = useState("6")
  const [amount, setAmount] = useState("100")
  const [periodDuration, setPeriodDuration] = useState("86400") // 1 day
  const [expiryDays, setExpiryDays] = useState("30")
  const [justification, setJustification] = useState("Circle allowance")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GrantDelegationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Auto-fetch token metadata when address changes
  useEffect(() => {
    let cancelled = false

    const fetchTokenMetadata = async () => {
      if (!isAddress(tokenAddress)) return
      try {
        const client = createPublicClient({ chain: baseSepolia, transport: http("https://sepolia.base.org") })
        const [fetchedName, fetchedDecimals] = await Promise.all([
          client.readContract({ address: tokenAddress as `0x${string}`, abi: erc20Abi, functionName: "name" }) as Promise<string>,
          client.readContract({ address: tokenAddress as `0x${string}`, abi: erc20Abi, functionName: "decimals" }) as Promise<number>,
        ])
        if (!cancelled) {
          setTokenName(fetchedName)
          setTokenDecimals(String(fetchedDecimals))
        }
      } catch (e) {
        // Silently ignore fetch errors; user can still input manually
      }
    }

    void fetchTokenMetadata()

    return () => {
      cancelled = true
    }
  }, [tokenAddress])

  const handleGrant = async () => {
    if (!circleAddress) {
      setError("Circle address not available")
      return
    }
    if (!tokenAddress || !amount || !periodDuration || !tokenDecimals) {
      setError("All fields are required")
      return
    }

    // Ensure we have an ERC-7715-capable wallet client (Web3Auth path)
    if (!walletClient) {
      setError("Wallet client not ready. Please reconnect and try again.")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const nowSec = Math.floor(Date.now() / 1000)
      const expiry = nowSec + Number(expiryDays || "0") * 86400

      const grantResult = await grantCircleDelegation(
        circleAddress,
        {
          circleAddress,
          tokenAddress: tokenAddress.trim(),
          tokenDecimals: Number(tokenDecimals),
          amount: amount.trim(),
          periodDuration: Number(periodDuration),
          expiry,
          justification: justification.trim(),
          chainId,
        },
        walletClient,
        userAddress
      )

      if (grantResult.success) {
        setResult(grantResult)
        onPermissionGranted?.({
          ...grantResult,
          tokenName,
          tokenAddress,
          expiresAt: expiry,
        })
      } else {
        setError(grantResult.error || "Failed to grant permission")
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
      <DialogContent className="sm:max-w-sm w-[360px]">
        <DialogHeader>
          <DialogTitle>Give Delegation</DialogTitle>
          <DialogDescription>
            Grant an ERC-20 periodic allowance to <span className="font-semibold">{circleName}</span>
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <DelegationForm
              tokenAddress={tokenAddress}
              tokenName={tokenName}
              tokenDecimals={tokenDecimals}
              amount={amount}
              periodDuration={periodDuration}
              expiryDays={expiryDays}
              justification={justification}
              circleAddress={circleAddress}
              onTokenAddressChange={setTokenAddress}
              onTokenNameChange={setTokenName}
              onTokenDecimalsChange={setTokenDecimals}
              onAmountChange={setAmount}
              onPeriodDurationChange={setPeriodDuration}
              onExpiryDaysChange={setExpiryDays}
              onJustificationChange={setJustification}
            />

            {error && (
              <div className="flex gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Requesting permission...</p>
                <p className="text-xs text-muted-foreground">Please approve in MetaMask Flask</p>
                <p className="text-xs text-muted-foreground italic">Make sure MetaMask Flask 13.5.0+ is installed</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleClose} disabled={loading} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleGrant}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  "Give Delegation"
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
                <h3 className="text-lg font-semibold text-foreground">Step 1 Complete!</h3>
                <p className="mt-1 text-sm text-muted-foreground">Advanced permission created</p>
                <p className="mt-2 text-xs text-amber-600 font-medium">Next: Publish to circle (Step 2)</p>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border/50 bg-card/50 p-4">
              {result.userAccountAddress && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">User Account</p>
                  <div className="rounded-md border border-border/40 bg-background/60 p-2">
                    <p className="break-all text-xs font-mono text-foreground leading-relaxed">
                      {result.userAccountAddress}
                    </p>
                    {result.userAccountIsUpgraded !== undefined && (
                      <p className="text-xs mt-1 text-muted-foreground">
                        Status: {result.userAccountIsUpgraded ? "✓ Upgraded" : "Standard"}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Permissions Context</p>
                <div className="max-h-40 overflow-y-auto rounded-md border border-border/40 bg-background/60 p-2">
                  <p className="break-all text-xs font-mono text-foreground leading-relaxed">
                    {result.permissionsContext || "(not returned)"}
                  </p>
                </div>
              </div>
              {result.delegationManager && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Delegation Manager</p>
                  <div className="max-h-24 overflow-y-auto rounded-md border border-border/40 bg-background/60 p-2">
                    <p className="break-all text-xs font-mono text-foreground leading-relaxed">
                      {result.delegationManager}
                    </p>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Circle Address (Signer)</p>
                <div className="rounded-md border border-border/40 bg-background/60 p-2">
                  <p className="break-all text-xs font-mono text-foreground leading-relaxed">
                    {circleAddress}
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
