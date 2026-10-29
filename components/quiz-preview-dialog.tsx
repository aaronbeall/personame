'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Eye, X } from 'lucide-react'
import { Button } from './ui/button'
import { QuizPlayer } from './quiz-player'
import type { publicQuiz } from '@/lib/personas'

export function QuizPreviewDialog({ quiz }: { quiz: ReturnType<typeof publicQuiz> }) {
  return <Dialog.Root><Dialog.Trigger asChild><Button variant="outline"><Eye size={15} />Try the quiz</Button></Dialog.Trigger><Dialog.Portal>
    <Dialog.Overlay className="quiz-preview-overlay" />
    <Dialog.Content className="quiz-preview-dialog" aria-describedby="quiz-preview-description"><header><div><Dialog.Title>Try your quiz</Dialog.Title><Dialog.Description id="quiz-preview-description">Test the participant experience. These answers do not count as completions.</Dialog.Description></div><Dialog.Close className="quiz-preview-close" aria-label="Close preview"><X size={19} /></Dialog.Close></header><QuizPlayer quiz={quiz} preview /></Dialog.Content>
  </Dialog.Portal></Dialog.Root>
}
