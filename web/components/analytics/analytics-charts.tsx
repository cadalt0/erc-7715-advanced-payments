"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"

export function AnalyticsCharts() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/50 bg-card p-6 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Volume</p>
              <p className="text-3xl font-bold text-foreground">$12,450</p>
              <div className="mt-2 flex items-center gap-1 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                <span>+12.5%</span>
              </div>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-3">
              <Activity className="h-6 w-6 text-foreground" />
            </div>
          </div>
        </Card>

        <Card className="border-border/50 bg-card p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-3xl font-bold text-foreground">98.2%</p>
              <div className="mt-2 flex items-center gap-1 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                <span>+2.1%</span>
              </div>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-3">
              <Activity className="h-6 w-6 text-foreground" />
            </div>
          </div>
        </Card>

        <Card className="border-border/50 bg-card p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Failed Payments</p>
              <p className="text-3xl font-bold text-foreground">3</p>
              <div className="mt-2 flex items-center gap-1 text-sm text-destructive">
                <TrendingDown className="h-4 w-4" />
                <span>-5.2%</span>
              </div>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 p-3">
              <Activity className="h-6 w-6 text-foreground" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-border/50 bg-card p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <h2 className="mb-4 text-xl font-semibold text-foreground">Payment Activity</h2>
        <div className="flex h-64 items-end justify-around gap-2">
          {[40, 70, 45, 80, 60, 90, 55, 75, 85, 65, 95, 70].map((height, index) => (
            <div
              key={index}
              className="flex-1 rounded-t bg-gradient-to-t from-primary to-accent transition-all hover:opacity-80"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="mt-4 flex justify-around text-xs text-muted-foreground">
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month) => (
            <span key={month}>{month}</span>
          ))}
        </div>
      </Card>
    </div>
  )
}
