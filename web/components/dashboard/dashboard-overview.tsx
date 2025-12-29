"use client"

import { Card } from "@/components/ui/card"
import { CreditCard, Zap, DollarSign, Clock, Shield } from "lucide-react"

const stats = [
  {
    icon: CreditCard,
    label: "Active Payments",
    value: "12",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Zap,
    label: "Active Automations",
    value: "8",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: DollarSign,
    label: "Total Spent",
    value: "$2,450",
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: Clock,
    label: "Next Payment",
    value: "2 days",
    color: "from-orange-500/20 to-red-500/20",
  },
  {
    icon: Shield,
    label: "Permissions",
    value: "5 active",
    color: "from-indigo-500/20 to-purple-500/20",
  },
]

export function DashboardOverview() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat, index) => (
        <Card
          key={stat.label}
          className="border-border/50 bg-card p-6 card-hover animate-slide-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className={`mb-3 inline-flex rounded-lg bg-gradient-to-br ${stat.color} p-2`}>
            <stat.icon className="h-5 w-5 text-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </Card>
      ))}
    </div>
  )
}
