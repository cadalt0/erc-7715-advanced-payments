"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface DelegationFormProps {
  tokenAddress: string
  tokenName: string
  tokenDecimals: string
  amount: string
  periodDuration: string
  expiryDays: string
  justification: string
  circleAddress: string
  onTokenAddressChange: (value: string) => void
  onTokenNameChange: (value: string) => void
  onTokenDecimalsChange: (value: string) => void
  onAmountChange: (value: string) => void
  onPeriodDurationChange: (value: string) => void
  onExpiryDaysChange: (value: string) => void
  onJustificationChange: (value: string) => void
}

export function DelegationForm({
  tokenAddress,
  tokenName,
  tokenDecimals,
  amount,
  periodDuration,
  expiryDays,
  justification,
  circleAddress,
  onTokenAddressChange,
  onTokenNameChange,
  onTokenDecimalsChange,
  onAmountChange,
  onPeriodDurationChange,
  onExpiryDaysChange,
  onJustificationChange,
}: DelegationFormProps) {
  return (
    <div className="space-y-4">
      {/* Circle Address - Read only */}
      <div className="space-y-2">
        <Label>Circle Address</Label>
        <Input value={circleAddress} disabled className="font-mono" />
      </div>

      {/* Token Address - Editable */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Token Address
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-600 font-medium">Customizable</span>
        </Label>
        <Input
          value={tokenAddress}
          onChange={(e) => onTokenAddressChange(e.target.value)}
          placeholder="0x..."
          className="font-mono"
        />
      </div>

      {/* Token Name - Editable */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Token Name
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-600 font-medium">Customizable</span>
        </Label>
        <Input
          value={tokenName}
          onChange={(e) => onTokenNameChange(e.target.value)}
          placeholder="USDC"
        />
      </div>

      {/* Token Decimals - Editable */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Token Decimals
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-600 font-medium">Customizable</span>
        </Label>
        <Input
          type="number"
          value={tokenDecimals}
          onChange={(e) => onTokenDecimalsChange(e.target.value)}
          placeholder="6"
        />
      </div>

      {/* Amount / Period */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Amount / Period
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-600 font-medium">Customizable</span>
          </Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="100"
          />
        </div>
        <LockedField
          label="Period (seconds)"
          value={periodDuration}
          tooltip="Customization coming soon"
        />
      </div>

      {/* Expiry and Justification */}
      <div className="grid grid-cols-2 gap-4">
        <LockedField
          label="Expiry (days)"
          value={expiryDays}
          tooltip="Customization coming soon"
        />
        <LockedField
          label="Justification"
          value={justification}
          tooltip="Customization coming soon"
        />
      </div>
    </div>
  )
}

interface LockedFieldProps {
  label: string
  value: string
  tooltip: string
}

function LockedField({ label, value, tooltip }: LockedFieldProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="space-y-2 group cursor-not-allowed">
            <div className="flex items-center gap-2">
              <Label className="text-muted-foreground group-hover:text-foreground/70 transition-colors">{label}</Label>
              <Info className="h-3.5 w-3.5 text-muted-foreground/60" />
            </div>
            <Input
              value={value}
              disabled
              placeholder={label}
              className="bg-muted/50 text-muted-foreground cursor-not-allowed opacity-60 group-hover:opacity-70 transition-opacity"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-muted border border-border/60 text-muted-foreground">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
