"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CheckCircle, Copy, Share2, QrCode } from "lucide-react"
import { useState } from "react"

interface GenerateRequestProps {
  data: any
  onBack: () => void
}

export function GenerateRequest({ data, onBack }: GenerateRequestProps) {
  const [copied, setCopied] = useState(false)
  const paymentLink = `https://advanced-finance.app/pay/${Math.random().toString(36).substring(7)}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Payment Request Created!</h2>
        <p className="mt-2 text-muted-foreground">Share this link with your payers</p>
      </div>

      <Card className="border-border/50 bg-card p-6">
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">Payment Link</h3>
            <div className="flex gap-2">
              <Input value={paymentLink} readOnly className="font-mono text-sm" />
              <Button onClick={copyToClipboard} variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {copied && <p className="mt-2 text-sm text-success">Copied to clipboard!</p>}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1 bg-transparent" variant="outline">
              <QrCode className="mr-2 h-4 w-4" />
              Show QR Code
            </Button>
            <Button className="flex-1 bg-transparent" variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </Card>

      <Card className="border-border/50 bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Payment Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="text-foreground">{data.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount</span>
            <span className="text-foreground">
              {data.amount} {data.token}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Type</span>
            <span className="text-foreground capitalize">{data.type.replace("-", " ")}</span>
          </div>
          {data.frequency && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Frequency</span>
              <span className="text-foreground capitalize">{data.frequency}</span>
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
          <a href="/dashboard">Go to Dashboard</a>
        </Button>
      </div>
    </div>
  )
}
