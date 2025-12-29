"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useWeb3Auth, useWeb3AuthConnect, useWeb3AuthDisconnect } from "@web3auth/modal/react"
import { useAccount } from "wagmi"
import { Wallet, Loader2, CheckCircle2, AlertCircle, Users, ChevronRight } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { joinCircle } from "@/lib/join-circle"
import { createPublicClient, http } from "viem"
import { baseSepolia } from "viem/chains"
import { CircleABI } from "@/lib/circle-abis"

export const dynamic = "force-dynamic"

function JoinCodeClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { connect, isConnected, loading: connectLoading } = useWeb3AuthConnect()
  const { disconnect } = useWeb3AuthDisconnect()
  const { provider } = useWeb3Auth()
  const { address } = useAccount()

  // URL params
  const circleAddress = searchParams.get("circle") || ""
  const codeIdParam = searchParams.get("codeId") || ""
  const joinCode = searchParams.get("code") || ""
  const codeId = codeIdParam ? (() => { try { return BigInt(codeIdParam) } catch { return null } })() : null

  // UI states
  const [status, setStatus] = useState<"idle" | "joining" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [circleName, setCircleName] = useState<string | null>(null)
  const [adminAddress, setAdminAddress] = useState<string | null>(null)

  // Auto-join when wallet connects
  useEffect(() => {
    if (!isConnected || !address || !circleAddress || !codeId || !joinCode) return
    if (status !== "idle") return

    async function handleAutoJoin() {
      setStatus("joining")
      setError(null)

      try {
        if (!provider) {
          throw new Error("Provider not available")
        }

        const result = await joinCircle(
          circleAddress,
          provider,
          address,
          codeId,
          joinCode
        )

        if (result.success) {
          setStatus("success")
          setTxHash(result.txHash || null)
          setCircleName(result.circleName || null)
        } else {
          setStatus("error")
          setError(result.error || "Failed to join circle")
        }
      } catch (err) {
        setStatus("error")
        setError(err instanceof Error ? err.message : "Failed to join circle")
      }
    }

    void handleAutoJoin()
  }, [isConnected, address, circleAddress, codeId, joinCode, provider, status])

  // Validate params
  const hasValidParams = circleAddress && codeId && joinCode

  // Fetch circle admin on mount
  useEffect(() => {
    if (!circleAddress) return

    async function fetchCircleAdmin() {
      try {
        const publicClient = createPublicClient({
          chain: baseSepolia,
          transport: http("https://sepolia.base.org"),
        })

        const admin = await publicClient.readContract({
          address: circleAddress as `0x${string}`,
          abi: CircleABI,
          functionName: "admin",
        })

        setAdminAddress(admin as string)
      } catch (err) {
        console.error("Failed to fetch admin:", err)
      }
    }

    void fetchCircleAdmin()
  }, [circleAddress])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Join Circle</h1>
          <p className="text-sm text-muted-foreground">
            You've been invited to join a trusted circle
          </p>
        </div>

        {!hasValidParams ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-md bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Invalid join link</p>
                <p className="text-destructive/90">This link is missing required parameters. Please ask for a new invitation link.</p>
              </div>
            </div>
            <Link href="/home">
              <Button className="w-full">Go to Home</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 rounded-lg border border-border/60 bg-background/60 p-4">
              <div className="text-xs space-y-2">
                <div>
                  <p className="text-muted-foreground">Circle Address</p>
                  <p className="font-mono text-foreground break-all">{circleAddress}</p>
                </div>
                {adminAddress && (
                  <div>
                    <p className="text-muted-foreground">Circle Admin</p>
                    <p className="font-mono text-foreground break-all">{adminAddress}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Join Code ID</p>
                  <p className="font-mono text-foreground">{codeIdParam}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Join Code</p>
                  <p className="font-mono text-foreground">{joinCode}</p>
                </div>
              </div>
            </div>

            {!isConnected ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-md bg-amber-500/10 p-4 text-amber-600">
                  <Wallet className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Connect your wallet</p>
                    <p className="text-amber-700/90">Connect your wallet to join this circle</p>
                  </div>
                </div>
                <Button
                  onClick={() => void connect()}
                  disabled={connectLoading}
                  className="w-full bg-gradient-to-r from-primary to-accent"
                >
                  {connectLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-4 w-4" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/60 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                      <Wallet className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-foreground">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </p>
                      <p className="text-xs text-muted-foreground">Connected</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={disconnect}>
                    Disconnect
                  </Button>
                </div>

                {status === "joining" && (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">Joining circle...</p>
                      <p className="text-xs text-muted-foreground mt-1">Please sign the transaction in your wallet</p>
                    </div>
                  </div>
                )}

                {status === "success" && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center gap-3 py-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-foreground">Successfully joined!</p>
                        {circleName && (
                          <p className="text-sm text-muted-foreground mt-1">You're now a member of {circleName}</p>
                        )}
                      </div>
                    </div>

                    {txHash && (
                      <div className="rounded-md border border-border/40 bg-background/40 p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Transaction</p>
                        <a
                          href={`https://sepolia.basescan.org/tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-mono text-primary hover:underline break-all"
                        >
                          {txHash.slice(0, 10)}...{txHash.slice(-8)}
                        </a>
                      </div>
                    )}

                    <Link href="/home">
                      <Button className="w-full bg-gradient-to-r from-primary to-accent">
                        Go to Home
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}

                {status === "error" && error && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 rounded-md bg-destructive/10 p-4 text-destructive">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium">Failed to join circle</p>
                        <p className="text-destructive/90">{error}</p>
                      </div>
                    </div>
                    <Link href="/home">
                      <Button variant="outline" className="w-full">Go to Home</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Card>
    </main>
  )
}

export default function JoinCodePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto" />
              <div className="h-6 w-40 mx-auto bg-muted rounded" />
              <div className="h-4 w-52 mx-auto bg-muted/80 rounded" />
            </div>
          </Card>
        </main>
      }
    >
      <JoinCodeClient />
    </Suspense>
  )
}
