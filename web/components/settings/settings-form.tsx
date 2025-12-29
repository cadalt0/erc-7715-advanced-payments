"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle } from "lucide-react"

export function SettingsForm() {
  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card p-6 animate-slide-up">
        <h2 className="mb-4 text-xl font-semibold text-foreground">General Settings</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-token">Default Token</Label>
            <Select defaultValue="usdc">
              <SelectTrigger id="default-token">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usdc">USDC</SelectItem>
                <SelectItem value="eth">ETH</SelectItem>
                <SelectItem value="usdt">USDT</SelectItem>
                <SelectItem value="dai">DAI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="border-border/50 bg-card p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="mb-4 text-xl font-semibold text-foreground">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="payment-success">Payment Success</Label>
              <p className="text-sm text-muted-foreground">Notify when payments execute successfully</p>
            </div>
            <Switch id="payment-success" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="payment-failed">Payment Failed</Label>
              <p className="text-sm text-muted-foreground">Notify when payments fail</p>
            </div>
            <Switch id="payment-failed" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="permission-expiry">Permission Expiry</Label>
              <p className="text-sm text-muted-foreground">Notify before permissions expire</p>
            </div>
            <Switch id="permission-expiry" defaultChecked />
          </div>
        </div>
      </Card>

      <Card className="border-border/50 bg-card p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <h2 className="mb-4 text-xl font-semibold text-foreground">Auto-Retry Rules</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="retry-attempts">Maximum Retry Attempts</Label>
            <Select defaultValue="3">
              <SelectTrigger id="retry-attempts">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 attempt</SelectItem>
                <SelectItem value="3">3 attempts</SelectItem>
                <SelectItem value="5">5 attempts</SelectItem>
                <SelectItem value="10">10 attempts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="retry-delay">Retry Delay</Label>
            <Select defaultValue="1h">
              <SelectTrigger id="retry-delay">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15m">15 minutes</SelectItem>
                <SelectItem value="1h">1 hour</SelectItem>
                <SelectItem value="6h">6 hours</SelectItem>
                <SelectItem value="24h">24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="border-destructive/50 bg-destructive/5 p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div className="flex-1">
            <h2 className="mb-2 text-xl font-semibold text-foreground">Danger Zone</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Revoke all active permissions immediately. This action cannot be undone.
            </p>
            <Button variant="destructive">Emergency Revoke All Permissions</Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3 animate-slide-up" style={{ animationDelay: "0.4s" }}>
        <Button variant="outline">Cancel</Button>
        <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">Save Changes</Button>
      </div>
    </div>
  )
}
