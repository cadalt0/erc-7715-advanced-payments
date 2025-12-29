import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6 rounded-xl border border-border/50 bg-card/80 p-8 shadow-lg backdrop-blur">
        <div className="flex flex-col items-start gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
            <span>404</span>
            <span>Page not found</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">We couldn&apos;t find that page</h1>
          <p className="text-sm text-muted-foreground">
            The link might be broken or the page may have been moved. Choose where to go next:
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="flex-1">
            <Link href="/home">
              Go to Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/login" className="inline-flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Need help? Check your invitation links or contact your circle admin for a fresh invite.
        </p>
      </div>
    </main>
  )
}
