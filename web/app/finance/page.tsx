/*
Original Finance page temporarily disabled.
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FinanceModules } from "@/components/finance/finance-modules"
import { Card } from "@/components/ui/card"

export default function FinancePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container px-4">
          <Card className="group relative overflow-hidden border-border/50 bg-card p-8 card-hover animate-slide-up">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-foreground">Finance</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                  Automate financial actions using Advanced Permissions.
                </p>
              </div>
              <FinanceModules />
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
*/

export default function DisabledFinancePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-foreground">Finance Disabled</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page is disabled in this build.</p>
        <a href="/home" className="mt-4 inline-block text-primary underline">Go to Home</a>
      </div>
    </main>
  )
}
