import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Web3AuthProviderComponent } from "@/components/providers/web3auth-provider"
import { BaseSepoliaGuard } from "@/components/providers/base-sepolia-guard"
import { PixelCursorTrail } from "@/components/ui/pixel-trail"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" })

export const metadata: Metadata = {
  title: "Advanced Finance - On-Chain Payments",
  description:
    "One permission. Create and manage powerful on-chain payment flows using MetaMask Advanced Permissions.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <Web3AuthProviderComponent>
          <BaseSepoliaGuard />
          {children}
          <PixelCursorTrail />
        </Web3AuthProviderComponent>
        <Analytics />
      </body>
    </html>
  )
}
