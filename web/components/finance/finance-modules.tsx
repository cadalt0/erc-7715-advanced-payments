"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Repeat, Calendar, Layers, TrendingUp, Coins, Clock, Split } from "lucide-react"

const modules = [
  {
    icon: Repeat,
    title: "Recurring Payments",
    description: "Automatically pay a fixed amount at regular intervals.",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Calendar,
    title: "Subscriptions",
    description: "Monthly or weekly subscriptions with automatic billing.",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: Layers,
    title: "Installments",
    description: "Split a total payment into multiple automated parts.",
    color: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: TrendingUp,
    title: "DCA",
    description: "Automatically buy crypto at regular intervals.",
    color: "from-orange-500/20 to-red-500/20",
  },
  {
    icon: Coins,
    title: "Recurring Swaps",
    description: "Automatically swap tokens on a schedule.",
    color: "from-pink-500/20 to-rose-500/20",
  },
  {
    icon: Clock,
    title: "Scheduled Payments",
    description: "Pay on a specific future date.",
    color: "from-indigo-500/20 to-purple-500/20",
  },
  {
    icon: Split,
    title: "Split Payouts",
    description: "Automatically route payments to multiple wallets.",
    color: "from-cyan-500/20 to-blue-500/20",
  },
]

export function FinanceModules() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {modules.map((module, index) => (
        <Card
          key={module.title}
          className="group border-border/50 bg-card p-6 card-hover animate-slide-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className={`mb-4 inline-flex rounded-lg bg-gradient-to-br ${module.color} p-3`}>
            <module.icon className="h-6 w-6 text-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-foreground">{module.title}</h3>
          <p className="mb-4 text-sm text-muted-foreground">{module.description}</p>
          <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
            Create {module.title}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Card>
      ))}
    </div>
  )
}
