"use client"

import type React from "react"

import { PrivyProvider as Privy } from "@privy-io/react-auth"

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <Privy
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#6366f1",
          logo: "https://placeholder.svg?height=40&width=40",
        },
        loginMethods: ["wallet", "email"],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        supportedChains: [
          {
            id: 1,
            name: "Ethereum",
            network: "mainnet",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: {
              default: { http: ["https://eth.llamarpc.com"] },
              public: { http: ["https://eth.llamarpc.com"] },
            },
          },
          {
            id: 137,
            name: "Polygon",
            network: "matic",
            nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
            rpcUrls: {
              default: { http: ["https://polygon-rpc.com"] },
              public: { http: ["https://polygon-rpc.com"] },
            },
          },
          {
            id: 8453,
            name: "Base",
            network: "base",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: {
              default: { http: ["https://mainnet.base.org"] },
              public: { http: ["https://mainnet.base.org"] },
            },
          },
        ],
        defaultChain: {
          id: 1,
          name: "Ethereum",
          network: "mainnet",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: {
            default: { http: ["https://eth.llamarpc.com"] },
            public: { http: ["https://eth.llamarpc.com"] },
          },
        },
      }}
    >
      {children}
    </Privy>
  )
}
