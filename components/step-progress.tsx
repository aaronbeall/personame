import { cn } from '@/lib/utils'
import React, { Fragment } from 'react'

interface Step {
  number: number
  label: string
  active?: boolean
  completed?: boolean
}

interface StepProgressProps {
  steps: Step[]
  title: string
  description: string
}


export function StepProgress({ steps, title, description }: StepProgressProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        {steps.map((step, index) => (
          <Fragment key={step.number}>
            <div key={step.number} className="flex items-center gap-2">
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center font-semibold',
                  step.active && 'bg-primary-600 text-white',
                  step.completed && !step.active && 'bg-primary-100 text-primary-600',
                  !step.active && !step.completed && 'bg-muted-300 text-muted-700'
                )}
              >
                {step.number}
              </div>
              <span
                className={cn(
                  step.active && 'font-semibold text-primary-900',
                  step.completed && !step.active && 'font-semibold text-primary-700',
                  !step.active && !step.completed && 'text-muted-600'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="h-px flex-1 bg-muted-300" />
            )}
          </Fragment>
        ))}
      </div>
      <h1 className="text-4xl font-bold mb-2 text-primary-900">{title}</h1>
      <p className="text-muted-700">{description}</p>
    </div>
  )
}
