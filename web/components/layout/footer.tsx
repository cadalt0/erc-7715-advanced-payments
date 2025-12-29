import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/50 py-12">
      <div className="container px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="animate-slide-up">
            <h3 className="text-lg font-bold text-foreground">Advanced Finance</h3>
            <p className="mt-2 text-sm text-muted-foreground">Autonomous On-Chain Payments</p>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/create-payment" className="hover:text-primary">
                  Create Payment
                </Link>
              </li>
              <li>
                <Link href="/finance" className="hover:text-primary">
                  Finance
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <h4 className="mb-4 text-sm font-semibold text-foreground">Powered By</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>MetaMask Advanced Permissions</li>
              <li>Smart Accounts</li>
              <li>EIP-7702</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Advanced Finance. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
