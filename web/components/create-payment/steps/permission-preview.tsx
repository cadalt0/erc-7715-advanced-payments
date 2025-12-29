"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, AlertCircle } from "lucide-react"
import { useWeb3AuthConnect } from "@web3auth/modal/react"
import { useAccount } from "wagmi"

interface PermissionPreviewProps {
  data: any
  onNext: () => void
  onBack: () => void
}

export function PermissionPreview({ data, onNext, onBack }: PermissionPreviewProps) {
  const { connect, isConnected } = useWeb3AuthConnect()
  const { address } = useAccount()

  const handleGrantPermission = async () => {
    if (!address) {
      await connect()
      return
    }
    // Here you would integrate with MetaMask Advanced Permissions
    onNext()
  }

  const calculateMaxSpend = () => {
    if (data.type === "one-time" || data.type === "scheduled") {
      return `${data.amount} ${data.token}`
    }
    const months = Number.parseInt(data.duration) || 12
    return `${(Number.parseFloat(data.amount) * months).toFixed(2)} ${data.token}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Advanced Permission Preview</h2>
        <p className="mt-2 text-muted-foreground">Review the permission you'll grant for this payment</p>
      </div>

      <Card className="border-primary/50 bg-primary/5 p-6">
        <div className="mb-4 flex items-start gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">Permission Summary</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This permission allows automated payments within defined limits
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between border-b border-border/50 pb-2">
            <span className="text-sm text-muted-foreground">Maximum Spend</span>
            <span className="text-sm font-semibold text-foreground">{calculateMaxSpend()}</span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-2">
            <span className="text-sm text-muted-foreground">Spend Per Interval</span>
            <span className="text-sm font-semibold text-foreground">
              {data.amount} {data.token} {data.frequency && `/ ${data.frequency}`}
            </span>
          </div>
          <div className="flex justify-between border-b border-border/50 pb-2">
            <span className="text-sm text-muted-foreground">Token Scope</span>
            <span className="text-sm font-semibold text-foreground">{data.token}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Permission Expiry</span>
            <span className="text-sm font-semibold text-foreground">
              {data.duration ? `${data.duration} months` : "Until revoked"}
            </span>
          </div>
        </div>
      </Card>

      <Card className="border-warning/50 bg-warning/5 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-warning" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              You will grant a MetaMask Advanced Permission to automate this payment.
            </p>
            <p className="text-sm text-muted-foreground">
              You can revoke this permission at any time from your dashboard.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={handleGrantPermission} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
          {authenticated ? "Grant Permission via MetaMask" : "Connect Wallet First"}
        </Button>
      </div>
    </div>
  )
}
