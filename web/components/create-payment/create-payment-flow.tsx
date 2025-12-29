"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { StepIndicator } from "./step-indicator"
import { SelectPaymentType } from "./steps/select-payment-type"
import { PaymentDetails } from "./steps/payment-details"
import { PermissionPreview } from "./steps/permission-preview"
import { GenerateRequest } from "./steps/generate-request"

const steps = [
  { id: 1, name: "Payment Type" },
  { id: 2, name: "Details" },
  { id: 3, name: "Permission" },
  { id: 4, name: "Generate" },
]

export function CreatePaymentFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [paymentData, setPaymentData] = useState({
    type: "",
    name: "",
    description: "",
    token: "USDC",
    amount: "",
    frequency: "",
    duration: "",
    startDate: "",
    recipients: [] as Array<{ address: string; percentage: number }>,
  })

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  return (
    <div className="space-y-8 animate-fade-in">
      <StepIndicator steps={steps} currentStep={currentStep} />

      <Card className="border-border/50 bg-card p-8">
        {currentStep === 1 && (
          <SelectPaymentType
            value={paymentData.type}
            onChange={(type) => setPaymentData({ ...paymentData, type })}
            onNext={nextStep}
          />
        )}
        {currentStep === 2 && (
          <PaymentDetails data={paymentData} onChange={setPaymentData} onNext={nextStep} onBack={prevStep} />
        )}
        {currentStep === 3 && <PermissionPreview data={paymentData} onNext={nextStep} onBack={prevStep} />}
        {currentStep === 4 && <GenerateRequest data={paymentData} onBack={prevStep} />}
      </Card>
    </div>
  )
}
