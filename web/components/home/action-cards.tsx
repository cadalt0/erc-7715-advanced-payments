"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  CreditCard,
  FileText,
  LinkIcon,
  Receipt,
  Layers,
  Split,
  Repeat,
  Calendar,
  TrendingUp,
  Coins,
  ArrowRight,
} from "lucide-react"

const paymentActions = [
  { icon: CreditCard, label: "Create Payment Request", color: "from-blue-500/20 to-cyan-500/20" },
  { icon: FileText, label: "One-Time Payments", color: "from-purple-500/20 to-pink-500/20" },
  { icon: LinkIcon, label: "Payment Links", color: "from-green-500/20 to-emerald-500/20" },
  { icon: Receipt, label: "Invoice Payments", color: "from-orange-500/20 to-red-500/20" },
  { icon: Layers, label: "Installments", color: "from-indigo-500/20 to-purple-500/20" },
  { icon: Split, label: "Split Payments", color: "from-pink-500/20 to-rose-500/20" },
]

const financeActions = [
  { icon: Repeat, label: "Recurring Payments", color: "from-blue-500/20 to-indigo-500/20" },
  { icon: Calendar, label: "Subscriptions", color: "from-purple-500/20 to-violet-500/20" },
  { icon: Layers, label: "Installments", color: "from-green-500/20 to-teal-500/20" },
  { icon: TrendingUp, label: "DCA", color: "from-orange-500/20 to-amber-500/20" },
  { icon: Coins, label: "Recurring Swaps", color: "from-pink-500/20 to-fuchsia-500/20" },
  { icon: Calendar, label: "Scheduled Payments", color: "from-cyan-500/20 to-blue-500/20" },
]

export function PaymentsCard({ disabled = false }: { disabled?: boolean }) {
  return (
    <Card
      className={`group relative flex h-full flex-col overflow-hidden border-border/50 bg-card p-8 card-hover animate-slide-up ${
        disabled ? "cursor-not-allowed" : ""
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Small badge instead of heavy overlay when disabled */}
      {disabled && (
        <div className="absolute right-3 top-3 z-10">
          <span className="rounded-full border border-border/50 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            Coming Soon
          </span>
        </div>
      )}

      <div className="relative flex h-full flex-col">
        <h2 className="mb-4 text-3xl font-bold text-foreground">Payments</h2>
        <p className="mb-8 text-muted-foreground">Create payment requests for customers, clients.</p>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {paymentActions.map((action, index) => (
            <button
              key={action.label}
              className={`group/btn flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-background/50 p-4 transition-all ${
                disabled ? "cursor-not-allowed" : "hover:scale-105 hover:border-primary/50"
              }`}
              style={{
                animation: `scaleIn 0.4s ease-out ${index * 0.1}s both`,
              }}
              {...(disabled ? { disabled: true, tabIndex: -1, 'aria-disabled': true } : {})}
            >
              <div className={`rounded-full bg-gradient-to-br ${action.color} p-3`}>
                <action.icon className="h-6 w-6 text-foreground" />
              </div>
              <span className="text-center text-xs font-medium text-muted-foreground group-hover/btn:text-foreground">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {disabled ? (
          <Button disabled className="mt-auto w-full cursor-not-allowed" variant="destructive">
            Coming Soon
          </Button>
        ) : (
          <Button asChild className="mt-auto w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
            <Link href="/create-payment">
              Create Payment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </Card>
  )
}

export function FinanceCard({ disabled = false }: { disabled?: boolean }) {
  return (
    <Card
      className={`group relative flex h-full flex-col overflow-hidden border-border/50 bg-card p-8 card-hover animate-slide-up ${
        disabled ? "cursor-not-allowed" : ""
      }`}
      style={{ animationDelay: "0.2s" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Small badge instead of heavy overlay when disabled */}
      {disabled && (
        <div className="absolute right-3 top-3 z-10">
          <span className="rounded-full border border-border/50 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            Coming Soon
          </span>
        </div>
      )}

      <div className="relative flex h-full flex-col">
        <h2 className="mb-4 text-3xl font-bold text-foreground">Finance</h2>
        <p className="mb-8 text-muted-foreground">Automate money movement and financial strategies.</p>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {financeActions.map((action, index) => (
            <button
              key={action.label}
              className={`group/btn flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-background/50 p-4 transition-all ${
                disabled ? "cursor-not-allowed" : "hover:scale-105 hover:border-accent/50"
              }`}
              style={{
                animation: `scaleIn 0.4s ease-out ${index * 0.1}s both`,
              }}
              {...(disabled ? { disabled: true, tabIndex: -1, 'aria-disabled': true } : {})}
            >
              <div className={`rounded-full bg-gradient-to-br ${action.color} p-3`}>
                <action.icon className="h-6 w-6 text-foreground" />
              </div>
              <span className="text-center text-xs font-medium text-muted-foreground group-hover/btn:text-foreground">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {disabled ? (
          <Button disabled className="mt-auto w-full cursor-not-allowed" variant="destructive">
            Coming Soon
          </Button>
        ) : (
          <Button asChild className="mt-auto w-full bg-gradient-to-r from-accent to-primary hover:opacity-90">
            <Link href="/finance">
              Open Finance
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </Card>
  )
}

export function ActionCards() {
  return (
    <section className="py-20">
      <div className="container px-4">
        <div className="grid items-stretch gap-8 lg:grid-cols-2">
          <PaymentsCard />
          <FinanceCard />
        </div>
      </div>
    </section>
  )
}
