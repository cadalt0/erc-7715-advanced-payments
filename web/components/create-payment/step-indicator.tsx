import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: number
  name: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex flex-1 items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                currentStep > step.id
                  ? "border-primary bg-primary text-white"
                  : currentStep === step.id
                    ? "border-primary bg-background text-primary"
                    : "border-muted bg-background text-muted-foreground",
              )}
            >
              {currentStep > step.id ? (
                <Check className="h-5 w-5" />
              ) : (
                <span className="text-sm font-semibold">{step.id}</span>
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-xs font-medium",
                currentStep >= step.id ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {step.name}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={cn("h-0.5 flex-1 transition-colors", currentStep > step.id ? "bg-primary" : "bg-muted")} />
          )}
        </div>
      ))}
    </div>
  )
}
