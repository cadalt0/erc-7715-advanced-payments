"use client"

import { Card } from "@/components/ui/card"
import { Shield, Zap, Lock, Eye, CheckCircle, RefreshCw } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Powered by MetaMask Advanced Permissions",
    description: "Built on cutting-edge blockchain technology for maximum security and reliability.",
  },
  {
    icon: Zap,
    title: "One-time approval, continuous execution",
    description: "Grant permission once and let the system handle all subsequent transactions automatically.",
  },
  {
    icon: Lock,
    title: "User-defined spending limits",
    description: "You control the maximum amounts and frequencies. Complete control over your funds.",
  },
  {
    icon: RefreshCw,
    title: "Fully revocable at any time",
    description: "Cancel any permission instantly. Your security and control come first.",
  },
  {
    icon: Eye,
    title: "Transparent on-chain execution",
    description: "Every transaction is verifiable on the blockchain. Complete transparency guaranteed.",
  },
  {
    icon: CheckCircle,
    title: "Built for real-world payments",
    description: "Designed for actual use cases like subscriptions, invoices, and automated payments.",
  },
]

export function WhySection() {
  return (
    <section className="py-20">
      <div className="container px-4">
        <div className="mb-12 text-center animate-slide-up">
          <h2 className="mb-4 text-4xl font-bold text-foreground">Why Advanced Finance</h2>
          <p className="text-lg text-muted-foreground">
            The most secure and convenient way to handle on-chain payments
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="group border-border/50 bg-card p-6 card-hover animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4 inline-flex rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 p-3">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
