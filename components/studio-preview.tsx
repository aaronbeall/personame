'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as Dialog from '@radix-ui/react-dialog'
import { Eye, X } from 'lucide-react'
import { Button } from './ui/button'
import { QuizPlayer } from './quiz-player'
import { requestJson } from '@/lib/client-api'
import type { FullQuiz } from '@/lib/personas'
export function StudioPreview({id,dirty}:{id:string;dirty:boolean}) {
  const [open,setOpen] = useState(false)
  const query = useQuery({queryKey:['studio-preview',id],queryFn:()=>requestJson<FullQuiz>(`/api/personames/${id}`),enabled:open,staleTime:0})
  const quiz = query.data
  return <Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Trigger asChild><Button variant="outline" disabled={dirty} title={dirty?'Save changes to preview your latest quiz':'Try the saved quiz'}><Eye size={16}/>Try the quiz</Button></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="quiz-preview-overlay"/><Dialog.Content className="quiz-preview-dialog" aria-describedby="studio-preview-description"><header><div><Dialog.Title>Try your quiz</Dialog.Title><Dialog.Description id="studio-preview-description">Test the saved participant experience. These answers do not count as completions.</Dialog.Description></div><Dialog.Close className="quiz-preview-close" aria-label="Close preview"><X size={19}/></Dialog.Close></header>{query.isFetching?<p role="status">Loading your saved quiz…</p>:query.error?<p role="alert">{query.error.message}</p>:quiz&&<QuizPlayer key={quiz.updatedAt.toString()} quiz={{...quiz,revision:new Date(quiz.updatedAt).toISOString(),pages:quiz.pages.filter(p=>!p.hidden)}} preview/>}</Dialog.Content></Dialog.Portal></Dialog.Root>
}
