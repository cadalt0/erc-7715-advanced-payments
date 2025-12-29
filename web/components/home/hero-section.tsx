"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden py-16 md:py-20">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20 opacity-50 animate-glow" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

      <div className="container relative px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary animate-scale-in">
            <Sparkles className="h-4 w-4" />
            <span>Powered by MetaMask Advanced Permissions</span>
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-7xl animate-slide-up">
            <span className="gradient-text">Advanced Finance</span>
          </h1>

          <p
            className="mb-2 text-base text-muted-foreground md:text-lg animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            One permission. Smarter on-chain payments.
          </p>

          <p
            className="mb-2 text-2xl font-semibold text-foreground md:text-3xl animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            Give financial freedom to your loved ones.
          </p>
          <p
            className="mb-10 text-lg text-muted-foreground md:text-xl animate-slide-up"
            style={{ animationDelay: "0.25s" }}
          >
            Share financial freedom, not your wallet.
          </p>

          <div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white">
              <Link href="/home">
                Try now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            {/* <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">Open Dashboard</Link>
            </Button> */}
          </div>
        </div>
      </div>
    </section>
  )
}
