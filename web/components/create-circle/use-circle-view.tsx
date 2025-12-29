"use client"

import React from "react"
import { Users, ChevronLeft, Lock, Unlock, Shield, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAllMembersPermissions } from "@/hooks/use-all-members-permissions"
import { TransferTokenDialog } from "@/components/create-circle/transfer-token-dialog"
import { Loader2 } from "lucide-react"

interface UseCircleViewProps {
  circleAddress: string
  circleName: string
  memberAddresses: string[]
  provider?: any
  callerAddress?: string
  onBack: () => void
}

export function UseCircleView({ circleAddress, circleName, memberAddresses, provider, callerAddress, onBack }: UseCircleViewProps) {
  const { members, loading, error } = useAllMembersPermissions(circleAddress, memberAddresses, true)
  const [openMember, setOpenMember] = React.useState<string | null>(null)
  const [transferDialogOpen, setTransferDialogOpen] = React.useState(false)

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-9 w-9 p-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Use Circle</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{circleName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1.5">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-semibold text-primary">{memberAddresses.length} Members</span>
          </div>
          <Button
            size="sm"
            onClick={() => setTransferDialogOpen(true)}
            className="gap-2 rounded-md bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:opacity-90"
            disabled={members.filter(m => m.hasAdvancedPermission).length === 0}
          >
            <ArrowRight className="h-4 w-4" />
            <span>Transfer Tokens</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading members permissions…</p>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <div className="space-y-4">
          {members.map((member, idx) => {
            const isExpired = member.expiresAt > BigInt(0) && member.expiresAt < BigInt(Math.floor(Date.now() / 1000))
            const percentUsed = member.amountGiven > BigInt(0)
              ? ((Number(member.amountUsed) / Number(member.amountGiven)) * 100).toFixed(1)
              : "0"

            return (
              <div
                key={member.memberAddress}
                className="rounded-xl border border-border/60 bg-gradient-to-br from-background to-background/50 p-5 shadow-sm"
              >
                {/* Member Header */}
                <div
                  className="mb-4 flex items-start justify-between gap-3 border-b border-border/40 pb-3 cursor-pointer"
                  onClick={() => {
                    setOpenMember((prev) => (prev === member.memberAddress ? null : member.memberAddress))
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-semibold text-primary">{idx + 1}</span>
                    </div>
                    <div className="min-w-0 flex items-center gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Member Address</p>
                        <p className="font-mono text-xs text-foreground break-all">{member.memberAddress}</p>
                      </div>
                      {!member.hasAdvancedPermission ? (
                        <AlertTriangle
                          className="h-4 w-4 text-amber-500 flex-shrink-0"
                          title="Has not given delegation permission yet"
                        />
                      ) : (
                        <CheckCircle
                          className="h-4 w-4 text-emerald-500 flex-shrink-0"
                          title="Click to view delegation details"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {member.hasAdvancedPermission ? (
                      <div className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-1">
                        <Unlock className="h-3 w-3 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-600">Advanced</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1">
                        <Lock className="h-3 w-3 text-amber-600" />
                        <span className="text-xs font-medium text-amber-600">Basic</span>
                      </div>
                    )}
                  </div>
                </div>

                {member.error ? (
                  <p className="text-xs text-destructive">{member.error}</p>
                ) : openMember === member.memberAddress ? (
                  member.hasAdvancedPermission ? (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                      {/* Token */}
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Token</p>
                          <p className="mt-1 text-sm font-semibold text-foreground">{member.tokenName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Token Address</p>
                          <p className="mt-1 font-mono text-xs text-foreground break-all">{member.tokenAddress}</p>
                        </div>
                      </div>

                      {/* Amounts */}
                      <div className="grid gap-3 md:grid-cols-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Given</p>
                          <p className="mt-1 font-mono text-sm font-semibold text-foreground">
                            {(Number(member.amountGiven) / 1_000_000).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Used</p>
                          <p className="mt-1 font-mono text-sm font-semibold text-amber-600">
                            {(Number(member.amountUsed) / 1_000_000).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Left</p>
                          <p className="mt-1 font-mono text-sm font-semibold text-emerald-600">
                            {(Number(member.amountLeft) / 1_000_000).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-xs text-muted-foreground">Usage: {percentUsed}%</span>
                          <span className="text-xs text-muted-foreground">
                            {isExpired ? (
                              <span className="text-destructive">Expired</span>
                            ) : member.expiresAt === BigInt(0) ? (
                              <span className="text-emerald-600">Never Expires</span>
                            ) : (
                              <span>Expires {new Date(Number(member.expiresAt) * 1000).toLocaleDateString()}</span>
                            )}
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all"
                            style={{ width: `${percentUsed}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700">
                      No delegation permission given yet.
                    </div>
                  )
                ) : null}
              </div>
            )
          })}
        </div>
      )}

      {/* Transfer Token Dialog */}
      <TransferTokenDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        circleAddress={circleAddress}
        circleName={circleName}
        members={members}
        provider={provider}
        callerAddress={callerAddress}
        onTransferComplete={() => {
          setTransferDialogOpen(false)
          // Members data will auto-refresh via the hook
        }}
      />
    </div>
  )
}
