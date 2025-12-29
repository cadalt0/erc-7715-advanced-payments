"use client"

import { useState } from "react"
import Link from "next/link"
import { useWeb3Auth, useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react"
import { useAccount } from "wagmi"
import { Wallet, Users, CreditCard, LineChart, Loader2, Plus, Key, UserPlus, ShieldCheck, ChevronLeft, Shield, Zap } from "lucide-react"
import { type Address } from "viem"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PaymentsCard, FinanceCard } from "@/components/home/action-cards"
import { useCircles } from "@/hooks/use-circles"
import { useCheckPermissionContext } from "@/hooks/use-check-permission-context"
import { CreateCircleDialog } from "@/components/create-circle/create-circle-dialog"
import { CreateJoinCodeDialog } from "@/components/create-circle/create-join-code-dialog"
import { JoinCircleDialog } from "@/components/create-circle/join-circle-dialog"
import { GrantDelegationDialog } from "@/components/create-circle/grant-delegation-dialog"
import { PublishPermissionDialog } from "@/components/create-circle/publish-permission-dialog"
import { UseCircleView } from "@/components/create-circle/use-circle-view"
import { useWalletClient } from "@/hooks/use-wallet-client"
import type { CircleData } from "@/lib/circle-finder"
import type { GrantDelegationResult } from "@/lib/grant-delegation"

type HomeTab = "circle" | "payments" | "finance"

export default function HomeRoutePage() {
  const { connect, isConnected, connectorName, loading: connectLoading, error: connectError } = useWeb3AuthConnect()
  const { disconnect, loading: disconnectLoading, error: disconnectError } = useWeb3AuthDisconnect()
  const { userInfo } = useWeb3AuthUser()
  const { provider } = useWeb3Auth()
  const { address } = useAccount()
  const { address: walletAddress } = useAccount()
  const { walletClient } = useWalletClient(isConnected, provider, walletAddress)

  const [activeTab, setActiveTab] = useState<HomeTab>("circle")
  const [createCircleOpen, setCreateCircleOpen] = useState(false)
  const [joinCodeDialogOpen, setJoinCodeDialogOpen] = useState(false)
  const [joinCircleOpen, setJoinCircleOpen] = useState(false)
  const [selectedCircle, setSelectedCircle] = useState<{ address: string; name: string } | null>(null)
  const [grantDelegationOpen, setGrantDelegationOpen] = useState(false)
  const [delegationCircle, setDelegationCircle] = useState<{ address: string; name: string } | null>(null)
  const [detailCircle, setDetailCircle] = useState<CircleData | null>(null)
  const [publishPermissionOpen, setPublishPermissionOpen] = useState(false)
  const [pendingPermission, setPendingPermission] = useState<{
    permissionsContext: string
    tokenName: string
    tokenAddress: string
    expiresAt: number
  } | null>(null)
  const [showUseCircle, setShowUseCircle] = useState(false)
  
  // Fetch circles for the connected wallet
  const { circles, loading: circlesLoading, error: circlesError, refetch } = useCircles(walletAddress)
  
  // Check permission context for detail circle
  const permissionCheck = useCheckPermissionContext(
    detailCircle?.address || null,
    walletAddress || null,
    !!detailCircle
  )

  return (
    <main className="min-h-screen bg-background">
      {/* Minimal top bar with logo + wallet */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <span className="text-lg font-bold text-white">AF</span>
            </div>
            <span className="text-sm font-semibold text-foreground">Advanced Finance</span>
          </Link>

          <div>
            {!isConnected ? (
              <Button onClick={() => connect()} size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            ) : (
              <Button onClick={() => disconnect()} size="sm" variant="outline">
                <Wallet className="mr-2 h-4 w-4" />
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Left sidebar buttons + right content */}
      <div className="mx-auto flex max-w-5xl gap-6 px-4 py-10">
        {/* Left vertical buttons */}
        <div className="w-40 space-y-3">
          <Button
            variant={activeTab === "circle" ? "default" : "outline"}
            className="flex w-full items-center gap-2 justify-start"
            onClick={() => setActiveTab("circle")}
          >
            <Users className="h-4 w-4" />
            Circle
          </Button>
          <Button
            variant={activeTab === "payments" ? "default" : "outline"}
            className="flex w-full items-center gap-2 justify-start"
            onClick={() => setActiveTab("payments")}
          >
            <CreditCard className="h-4 w-4" />
            Payments
          </Button>
          <Button
            variant={activeTab === "finance" ? "default" : "outline"}
            className="flex w-full items-center gap-2 justify-start"
            onClick={() => setActiveTab("finance")}
          >
            <LineChart className="h-4 w-4" />
            Finance
          </Button>
        </div>

        {/* Right content area */}
        <div className="flex-1">
          {activeTab === "circle" && (
            <>
            <Card className="relative flex h-full flex-col border-border/50 bg-card p-8 card-hover animate-slide-up">
              <h2 className="mb-4 text-3xl font-bold text-foreground">Trusted Circle</h2>
              <p className="mb-6 text-muted-foreground">
                See your created trusted circles, or create or join a new circle to share financial freedom safely.
              </p>
              
              {isConnected && !circlesLoading && !circlesError && circles.length > 0 && (
                detailCircle ? (
                  <>
                    {showUseCircle ? (
                      <UseCircleView
                        circleAddress={detailCircle.address}
                        circleName={detailCircle.name}
                        memberAddresses={detailCircle.members}
                        provider={provider}
                        callerAddress={walletAddress}
                        onBack={() => setShowUseCircle(false)}
                      />
                    ) : (
                  <div className="space-y-6 pb-8">
                    {/* Header with back button */}
                    <div className="flex items-center justify-between border-b border-border/40 pb-4">
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => setDetailCircle(null)} className="h-9 w-9 p-0">
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">{detailCircle.name}</h2>
                          <p className="mt-0.5 text-xs text-muted-foreground">Circle Details</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1.5">
                          <Users className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-sm font-semibold text-emerald-600">{detailCircle.members.length}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setShowUseCircle(true)}
                          className="gap-2 rounded-md bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
                        >
                          <Users className="h-4 w-4" />
                          <span>Use Circle</span>
                        </Button>
                      </div>
                    </div>

                    {/* Admin & Address cards */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="group rounded-xl border border-border/60 bg-gradient-to-br from-blue-500/5 to-blue-500/[0.02] p-5 transition-all hover:border-blue-500/40 hover:shadow-md">
                        <div className="mb-1 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-500" />
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin</p>
                        </div>
                        <p className="mt-3 font-mono text-sm text-foreground break-all">{detailCircle.admin}</p>
                        <p className="mt-2 text-[11px] text-muted-foreground">Contract Administrator</p>
                      </div>

                      <div className="group rounded-xl border border-border/60 bg-gradient-to-br from-purple-500/5 to-purple-500/[0.02] p-5 transition-all hover:border-purple-500/40 hover:shadow-md">
                        <div className="mb-1 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-purple-500" />
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Address</p>
                        </div>
                        <p className="mt-3 font-mono text-sm text-foreground break-all">{detailCircle.address}</p>
                        <p className="mt-2 text-[11px] text-muted-foreground">Smart Contract Address</p>
                      </div>
                    </div>

                    {/* Members */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-foreground" />
                        <h3 className="text-lg font-semibold text-foreground">Members</h3>
                        <span className="ml-auto rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {detailCircle.members.length}
                        </span>
                      </div>
                      <div className="max-h-56 overflow-y-auto rounded-xl border border-border/60 bg-gradient-to-br from-background to-background/50 p-4 shadow-sm">
                        {detailCircle.members.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8">
                            <Users className="mb-2 h-8 w-8 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">No members yet</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {detailCircle.members.map((m, idx) => (
                              <div key={m} className="group flex items-center gap-3 rounded-lg border border-border/40 bg-card/60 px-4 py-3 transition-all hover:border-foreground/30 hover:bg-card">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                                  <span className="text-xs font-semibold text-primary">{idx + 1}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-mono text-xs text-foreground break-all">{m}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4 border-t border-border/40 pt-6">
                      {/* Admin-only actions */}
                      {walletAddress && detailCircle.admin.toLowerCase() === walletAddress.toLowerCase() && (
                        <div>
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin Actions</p>
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={() => {
                              setSelectedCircle({ address: detailCircle.address, name: detailCircle.name })
                              setJoinCodeDialogOpen(true)
                            }}
                            className="w-full gap-2 rounded-xl border-border/60 hover:border-amber-500/40 hover:bg-amber-500/5"
                          >
                            <Key className="h-4 w-4" />
                            <span>Create Join Code</span>
                          </Button>
                        </div>
                      )}

                      {/* Member Actions */}
                      <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Member Actions</p>
                        <div className="flex flex-col gap-3">
                          <Button
                            size="lg"
                            onClick={() => {
                              setDelegationCircle({ address: detailCircle.address, name: detailCircle.name })
                              setGrantDelegationOpen(true)
                            }}
                            disabled={permissionCheck.loading}
                            className="w-full gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50"
                          >
                            {permissionCheck.loading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Loading...</span>
                              </>
                            ) : permissionCheck.hasPermission ? (
                              <>
                                <ShieldCheck className="h-4 w-4" />
                                <span>Update Delegation</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="h-4 w-4" />
                                <span>Give Delegation</span>
                              </>
                            )}
                          </Button>
                          {/* Use Circle button moved to header next to member count */}
                        </div>
                      </div>
                    </div>
                  </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <Button size="sm" onClick={() => setCreateCircleOpen(true)} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Circle
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setJoinCircleOpen(true)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Join Circle
                      </Button>
                    </div>

                    {/* Circle List */}
                    {circles.map((circle) => (
                      <button
                        key={circle.address}
                        onClick={() => setDetailCircle(circle)}
                        className="w-full text-left"
                      >
                        <div className="rounded-xl border border-border/60 bg-background/40 p-4 transition-all hover:border-primary/50 hover:bg-background/60">
                          <div className="mb-2 flex items-start justify-between">
                            <h3 className="text-lg font-semibold text-foreground">{circle.name}</h3>
                            <span className="rounded-full bg-primary/20 px-2 py-1 text-xs text-primary">
                              {circle.members.length} {circle.members.length === 1 ? "member" : "members"}
                            </span>
                          </div>
                          <p className="mb-2 text-xs text-muted-foreground">
                            {circle.address.slice(0, 6)}...{circle.address.slice(-4)}
                          </p>
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Admin:</span>
                            <span className="text-xs text-foreground">
                              {circle.admin.slice(0, 6)}...{circle.admin.slice(-4)}
                            </span>
                            {walletAddress && circle.admin.toLowerCase() === walletAddress.toLowerCase() && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                                <Shield className="h-3 w-3" />
                                You're Admin
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">Click to view details</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              )}

              {circlesLoading && (
                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/60 bg-background/40 p-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading your circles...</p>
                </div>
              )}

              {circlesError && !circlesLoading && (
                <div className="flex flex-col gap-4 rounded-xl border border-dashed border-destructive/60 bg-destructive/10 p-6">
                  <p className="text-sm text-destructive">Error: {circlesError}</p>
                  <Button size="sm" variant="outline" onClick={() => refetch()}>
                    Retry
                  </Button>
                </div>
              )}

              {!isConnected && !circlesLoading && (
                <div className="flex flex-col gap-4 rounded-xl border border-dashed border-border/60 bg-background/40 p-6">
                  <p className="text-sm text-muted-foreground">
                    Connect your wallet to view your circles.
                  </p>
                  <Button size="sm" onClick={() => connect()} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    Connect Wallet
                  </Button>
                </div>
              )}

              {isConnected && !circlesLoading && !circlesError && circles.length === 0 && (
                <div className="flex flex-col gap-4 rounded-xl border border-dashed border-border/60 bg-background/40 p-6">
                  <p className="text-sm text-muted-foreground">
                    You don&apos;t have any circles yet. Start by creating a new circle or joining an existing one.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm" onClick={() => setCreateCircleOpen(true)} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                      <Plus className="mr-2 h-4 w-4" />
                      Create circle
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setJoinCircleOpen(true)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Join circle
                    </Button>
                  </div>
                </div>
              )}
            </Card>
            </>
          )}

          {activeTab === "payments" && <PaymentsCard disabled />}
          {activeTab === "finance" && <FinanceCard disabled />}
        </div>
      </div>

      {/* Create Circle Dialog */}
      <CreateCircleDialog
        open={createCircleOpen}
        onOpenChange={setCreateCircleOpen}
        walletAddress={walletAddress}
        onCircleCreated={() => {
          setCreateCircleOpen(false)
          refetch() // Refresh circles list after creation
        }}
      />
      
      {/* Create Join Code Dialog */}
      {selectedCircle && (
        <CreateJoinCodeDialog
          open={joinCodeDialogOpen}
          onOpenChange={(open) => {
            setJoinCodeDialogOpen(open)
            if (!open) setSelectedCircle(null)
          }}
          circleAddress={selectedCircle.address}
          circleName={selectedCircle.name}
          walletAddress={walletAddress}
        />
      )}

      {/* Grant Delegation Dialog (Step 1) */}
      <GrantDelegationDialog
        open={grantDelegationOpen && !!delegationCircle}
        onOpenChange={(open) => {
          setGrantDelegationOpen(open)
          if (!open) setDelegationCircle(null)
        }}
        circleAddress={delegationCircle?.address || ""}
        circleName={delegationCircle?.name || ""}
        sessionAccountAddress={walletAddress}
        chainId={84532}
        walletClient={walletClient}
        userAddress={walletAddress}
        onPermissionGranted={(result) => {
          // Store permission details for Step 2
          if (result.permissionsContext) {
            setPendingPermission({
              permissionsContext: result.permissionsContext,
              tokenName: result.tokenName,
              tokenAddress: result.tokenAddress,
              expiresAt: result.expiresAt,
            })
            
            // Close step 1 and open step 2
            setTimeout(() => {
              setGrantDelegationOpen(false)
              setPublishPermissionOpen(true)
            }, 1500)
          }
        }}
      />

      {/* Publish Permission Dialog (Step 2) */}
      {delegationCircle && pendingPermission && (
        <PublishPermissionDialog
          open={publishPermissionOpen}
          onOpenChange={(open) => {
            setPublishPermissionOpen(open)
            if (!open) {
              setPendingPermission(null)
              setDelegationCircle(null)
            }
          }}
          circleAddress={delegationCircle.address}
          circleName={delegationCircle.name}
          memberAddress={walletAddress || ""}
          tokenName={pendingPermission.tokenName}
          tokenAddress={pendingPermission.tokenAddress}
          permissionsContext={pendingPermission.permissionsContext}
          expiresAt={pendingPermission.expiresAt}
          provider={provider}
          onPublished={() => {
            setPublishPermissionOpen(false)
            setPendingPermission(null)
            setDelegationCircle(null)
            refetch() // Refresh circles after publishing
          }}
        />
      )}

      {/* Inline Use Circle view handled inside detail section (no dialog) */}
      
      {/* Join Circle Dialog */}
      <JoinCircleDialog
        open={joinCircleOpen}
        onOpenChange={setJoinCircleOpen}
        walletAddress={walletAddress}
        provider={provider}
        onCircleJoined={() => {
          setJoinCircleOpen(false)
          refetch() // Refresh circles list after joining
        }}
      />
    </main>
  )
}
