/*
Original Dashboard page temporarily disabled.
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { PermissionsPanel } from "@/components/dashboard/permissions-panel"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container px-4">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Monitor your payments and permissions</p>
          </div>
          <div className="space-y-8">
            <DashboardOverview />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <ActivityFeed />
              </div>
              <div>
                <PermissionsPanel />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
*/

export default function DisabledDashboardPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-foreground">Dashboard Disabled</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page is disabled in this build.</p>
        <a href="/home" className="mt-4 inline-block text-primary underline">Go to Home</a>
      </div>
    </main>
  )
}
