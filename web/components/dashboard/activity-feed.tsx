"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, ExternalLink } from "lucide-react"

const activities = [
  {
    type: "success",
    title: "Payment executed",
    amount: "100 USDC",
    time: "2 minutes ago",
    txHash: "0x1234...5678",
  },
  {
    type: "success",
    title: "Subscription renewed",
    amount: "50 USDC",
    time: "1 hour ago",
    txHash: "0x8765...4321",
  },
  {
    type: "pending",
    title: "Payment scheduled",
    amount: "200 USDC",
    time: "In 2 days",
    txHash: null,
  },
  {
    type: "failed",
    title: "Payment failed",
    amount: "75 USDC",
    time: "3 hours ago",
    txHash: "0xabcd...efgh",
  },
  {
    type: "success",
    title: "Split payout completed",
    amount: "300 USDC",
    time: "1 day ago",
    txHash: "0x9876...1234",
  },
]

export function ActivityFeed() {
  return (
    <Card className="border-border/50 bg-card p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
      <h2 className="mb-6 text-xl font-semibold text-foreground">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-start justify-between border-b border-border/30 pb-4 last:border-0 last:pb-0"
          >
            <div className="flex gap-3">
              <div className="mt-1">
                {activity.type === "success" && <CheckCircle className="h-5 w-5 text-success" />}
                {activity.type === "failed" && <XCircle className="h-5 w-5 text-destructive" />}
                {activity.type === "pending" && <Clock className="h-5 w-5 text-warning" />}
              </div>
              <div>
                <p className="font-medium text-foreground">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.time}</p>
                {activity.txHash && (
                  <a
                    href={`https://etherscan.io/tx/${activity.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    View transaction
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground">{activity.amount}</p>
              <Badge
                variant={
                  activity.type === "success" ? "default" : activity.type === "failed" ? "destructive" : "secondary"
                }
                className="mt-1"
              >
                {activity.type}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
