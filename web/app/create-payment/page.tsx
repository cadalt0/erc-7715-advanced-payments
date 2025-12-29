/*
Original Create Payment page temporarily disabled.
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CreatePaymentFlow } from "@/components/create-payment/create-payment-flow"

export default function CreatePaymentPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 animate-slide-up">
              <h1 className="text-4xl font-bold text-foreground">Create Payment Request</h1>
              <p className="mt-2 text-muted-foreground">Set up a new payment request with automated execution</p>
            </div>
            <CreatePaymentFlow />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
*/

export default function DisabledCreatePaymentPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-foreground">Create Payment Disabled</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page is disabled in this build.</p>
        <a href="/home" className="mt-4 inline-block text-primary underline">Go to Home</a>
      </div>
    </main>
  )
}
