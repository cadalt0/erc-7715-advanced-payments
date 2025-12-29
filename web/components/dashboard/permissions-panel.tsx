"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Trash2 } from "lucide-react"

const permissions = [
  {
    name: "Monthly Subscription",
    token: "USDC",
    limit: "100/month",
    expires: "11 months",
  },
  {
    name: "DCA Strategy",
    token: "ETH",
    limit: "0.1/week",
    expires: "Never",
  },
  {
    name: "Team Payroll",
    token: "USDC",
    limit: "5000/month",
    expires: "5 months",
  },
]

export function PermissionsPanel() {
  return (
    <Card className="border-border/50 bg-card p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Active Permissions</h2>
        <Shield className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-4">
        {permissions.map((permission, index) => (
          <div key={index} className="rounded-lg border border-border/50 bg-background/50 p-4">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{permission.name}</h3>
                <p className="text-sm text-muted-foreground">{permission.token}</p>
              </div>
              <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spend Limit</span>
                <span className="text-foreground">{permission.limit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expires</span>
                <span className="text-foreground">{permission.expires}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" className="mt-4 w-full bg-transparent">
        Manage All Permissions
      </Button>
    </Card>
  )
}
