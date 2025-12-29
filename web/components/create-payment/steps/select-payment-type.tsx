"use client"

import { Button } from "@/components/ui/button"
import { CreditCard, Repeat, Layers, Calendar, Split } from "lucide-react"
import { cn } from "@/lib/utils"

const paymentTypes = [
  {
    id: "one-time",
    name: "One-Time Payment",
    description: "Single payment request for immediate or scheduled execution",
    icon: CreditCard,
  },
  {
    id: "subscription",
    name: "Subscription",
    description: "Recurring payments at regular intervals",
    icon: Repeat,
  },
  {
    id: "installments",
    name: "Installments",
    description: "Split total amount into multiple payments over time",
    icon: Layers,
  },
  {
    id: "scheduled",
    name: "Scheduled Payment",
    description: "Pay on a specific future date",
    icon: Calendar,
  },
  {
    id: "split",
    name: "Split Payment",
    description: "Distribute payment to multiple recipients",
    icon: Split,
  },
]

interface SelectPaymentTypeProps {
  value: string
  onChange: (type: string) => void
  onNext: () => void
}

export function SelectPaymentType({ value, onChange, onNext }: SelectPaymentTypeProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Select Payment Type</h2>
        <p className="mt-2 text-muted-foreground">Choose the type of payment you want to create</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {paymentTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onChange(type.id)}
            className={cn(
              "group relative flex flex-col items-start gap-3 rounded-xl border-2 p-6 text-left transition-all hover:border-primary",
              value === type.id ? "border-primary bg-primary/5" : "border-border/50 bg-background",
            )}
          >
            <div
              className={cn(
                "rounded-lg p-2 transition-colors",
                value === type.id
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
              )}
            >
              <type.icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{type.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{type.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!value} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
          Continue
        </Button>
      </div>
    </div>
  )
}
