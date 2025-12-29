"use client"

import { useEffect, useState, useRef } from "react"
import { Wallet, ShieldCheck, WalletCards, Sparkles, Copy, CheckCircle2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useWeb3Auth } from "@web3auth/modal/react"
import { useWeb3AuthConnect, useWeb3AuthDisconnect } from "@web3auth/modal/react"
import { useAccount } from "wagmi"
import type { Address } from "viem"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
// import { getOrCreateSmartAccount, deploySmartAccount, checkSmartAccount, estimateDeploymentGas } from "@/lib/smart-account"
import { Checkbox } from "@/components/ui/checkbox"

type SmartStatus = "idle" | "checking" | "smart" | "not-smart" | "deploying" | "error"

interface SmartAccountInfo {
  smartAccountAddress: Address | null
  isDeployed: boolean
  eoaAddress: Address | null
}

export default function LoginPage() {
  const router = useRouter()
  const { connect, isConnected, loading: connectLoading } = useWeb3AuthConnect()
  const { disconnect } = useWeb3AuthDisconnect()
  const { address } = useAccount()
  const [status, setStatus] = useState<SmartStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [smartAccountInfo, setSmartAccountInfo] = useState<SmartAccountInfo>({
    smartAccountAddress: null,
    isDeployed: false,
    eoaAddress: null,
  })
  const [copied, setCopied] = useState(false)
  const [deploymentTxHash, setDeploymentTxHash] = useState<string | null>(null)
  const [gasEstimate, setGasEstimate] = useState<{
    gasEstimate?: string
    estimatedCost?: string
  } | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [redirectCountdown, setRedirectCountdown] = useState(5)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const redirectStartedRef = useRef(false)

  const authenticated = !!address
  const [isFlaskDetected, setIsFlaskDetected] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const eth: any = (window as any).ethereum
    if (!eth) {
      setIsFlaskDetected(false)
      return
    }
    if (Array.isArray(eth.providers) && eth.providers.length) {
      setIsFlaskDetected(eth.providers.some((p: any) => p?.isFlask))
    } else {
      setIsFlaskDetected(!!eth.isFlask)
    }
  }, [])

  // Smart account generation/deploy is disabled on login
  // useEffect(() => {
  //   async function checkAndGetSmartAccount() { /* disabled */ }
  //   if (authenticated && address) { /* disabled */ } else { /* disabled */ }
  // }, [authenticated, address])

  // Auto-redirect to /home when smart account is deployed
  // Redirect to /home 5s after wallet connects
  useEffect(() => {
    if (authenticated && address) {
      if (!redirectStartedRef.current) {
        redirectStartedRef.current = true
        setIsRedirecting(true)
        setRedirectCountdown(5)

        // Countdown timer - update every second
        countdownIntervalRef.current = setInterval(() => {
          setRedirectCountdown((prev) => {
            const newValue = prev - 1
            if (newValue <= 0) {
              if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current)
                countdownIntervalRef.current = null
              }
              return 0
            }
            return newValue
          })
        }, 1000)

        // Redirect after 5 seconds
        const redirectTimer = setTimeout(() => {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current)
            countdownIntervalRef.current = null
          }
          router.push("/home")
        }, 5000)

        return () => {
          clearTimeout(redirectTimer)
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current)
            countdownIntervalRef.current = null
          }
        }
      }
    } else {
      // Reset state when disconnected
      setIsRedirecting(false)
      setRedirectCountdown(5)
      redirectStartedRef.current = false
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current)
        countdownIntervalRef.current = null
      }
    }
  }, [authenticated, address, router])

  // const handleDeploySmartWallet = async () => { /* disabled on login page */ }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-background">
      <div className="w-full max-w-lg px-4">
        <Card className="relative overflow-hidden border-border/60 bg-card/90 p-8 shadow-xl">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />

          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
              <Sparkles className="h-3 w-3" />
              <span>Advanced Permissions via ERC-7715</span>
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-foreground md:text-3xl">Connect your wallet</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect to access your trusted circles, payments, and finance automations.
                Only MetaMask Flask is supported on this page; normal MetaMask is disabled.
              </p>
            </div>

            <div className="space-y-3 rounded-lg border border-border/60 bg-background/60 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-foreground">
                      {authenticated && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "No wallet connected"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {authenticated ? "Connected wallet" : "Connect a wallet to get started"}
                    </p>
                  </div>
                </div>

                <div>
                  {!isConnected ? (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      onClick={() => void connect()}
                      disabled={connectLoading || isFlaskDetected === false}
                    >
                      {connectLoading ? "Connecting..." : "Connect with MetaMask Flask"}
                    </Button>
                  ) : authenticated ? (
                    <Button size="sm" variant="outline" onClick={disconnect}>
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      onClick={() => void connect()}
                      disabled={connectLoading || isFlaskDetected === false}
                    >
                      {connectLoading ? "Connecting..." : "Connect with MetaMask Flask"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {authenticated && address && (
              <div className="space-y-4 rounded-lg border border-border/60 bg-background/60 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <WalletCards className="h-4 w-4 text-primary" />
                  <span>Smart Account Upgrade</span>
                </div>

                <div className="flex items-start gap-3 rounded-md border border-border/50 bg-background/50 p-3">
                  <Checkbox checked disabled className="mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Auto-upgrade enabled</p>
                    <p className="text-xs text-muted-foreground">Your account will be automatically upgraded to a smart account on first use. No manual deployment required.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-md bg-amber-500/10 p-3 text-amber-600">
                  <AlertTriangle className="mt-0.5 h-4 w-4" />
                  <div className="text-xs">
                    <p className="font-medium">Only MetaMask Flask supported</p>
                    <p className="text-amber-700/90">Normal MetaMask is disabled here. If you don’t wish to auto-upgrade, disconnect now. Connect again via smart account (erc 7715)</p>
                  </div>
                </div>

                {/* Flask detection warning removed per request */}

                {status === "error" && error && (
                  <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    <p>Error: {error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Redirecting message */}
            {isRedirecting && (
              <div className="rounded-lg border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-500/20 to-green-500/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-500">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-emerald-400">Wallet Connected!</p>
                    <p className="text-sm text-emerald-300">
                      Redirecting to home page in{" "}
                      <span className="font-bold text-white">{redirectCountdown}</span>{" "}
                      {redirectCountdown === 1 ? "second" : "seconds"}...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isRedirecting && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Need to explore first?</span>
                <Link href="/" className="text-primary underline-offset-4 hover:underline">
                  Go back home
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  )
}


