"use client"

import Link from "next/link"
import Image from "next/image"
import { useWeb3AuthConnect, useWeb3AuthDisconnect } from "@web3auth/modal/react"
import { useAccount } from "wagmi"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

export function Header() {
  const { connect, isConnected, loading: connectLoading } = useWeb3AuthConnect()
  const { disconnect } = useWeb3AuthDisconnect()
  const { address } = useAccount()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 animate-fade-in">
          <Image
            src="/logo.png"
            alt="Advanced Finance logo"
            width={32}
            height={32}
            className="rounded-lg"
            priority
          />
          <span className="text-xl font-bold text-foreground">Advanced Finance</span>
        </Link>

        <div className="animate-fade-in">
          {isConnected && address ? (
            <Button onClick={disconnect} variant="outline">
              <Wallet className="mr-2 h-4 w-4" />
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </Button>
          ) : (
            <Button onClick={() => void connect()} disabled={connectLoading} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <Wallet className="mr-2 h-4 w-4" />
              {connectLoading ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
