'use client'
import { useCallback, useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Check, Copy, X, ArrowUpRight, Share2 } from 'lucide-react'
import Link from 'next/link'
import { QuizCoverMark } from './quiz-cover-mark'
import { ArtConfettiBurst } from './art-confetti-burst'
import { Button } from './ui/button'
export function PublishCelebration({open,onOpenChange,title,slug,emoji,color}:{open:boolean;onOpenChange:(open:boolean)=>void;title:string;slug:string;emoji:string|null;color:string|null}) {
  const anchor = useRef<HTMLDivElement>(null)
  const [burst,setBurst] = useState(true)
  const [copied,setCopied] = useState(false)
  const [message,setMessage] = useState('')
  const url = typeof window === 'undefined' ? '' : `${window.location.origin}/quiz/${slug}`
  const complete = useCallback(() => setBurst(false),[])
  return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className="publish-celebration-overlay" /><Dialog.Content ref={anchor} className="publish-celebration" aria-describedby="publish-celebration-description"><Dialog.Close className="quiz-preview-close" aria-label="Close celebration"><X size={20} /></Dialog.Close><span className="quiz-kicker">A LITTLE WORLD, READY TO SHARE</span><QuizCoverMark emoji={emoji} color={color} /><Dialog.Title>Your quiz is out in the world!</Dialog.Title><Dialog.Description id="publish-celebration-description">{title} is live. Invite your people to discover a new side of themselves.</Dialog.Description><div className="celebration-copy"><input aria-label="Published quiz link" readOnly value={url} onFocus={event=>event.target.select()} /><Button variant="outline" onClick={async()=>{try{await navigator.clipboard.writeText(url);setCopied(true)}catch{setMessage('Select and copy the link above.')}}}>{copied?<Check size={16}/>:<Copy size={16}/>} {copied?'Copied':'Copy link'}</Button></div><nav className="celebration-share" aria-label="Share your quiz"><a href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`}>Email ↗</a><button onClick={async()=>{try{if(navigator.share) await navigator.share({title,url});else{await navigator.clipboard.writeText(url);setCopied(true)}}catch{setMessage('Sharing cancelled. Your quiz link is ready above.')}}}><Share2 size={14}/>More</button></nav><Link className="button-link" href={`/quiz/${slug}`} target="_blank">Open quiz<ArrowUpRight size={16}/></Link><Dialog.Close asChild><Button variant="ghost">Back to studio</Button></Dialog.Close>{message&&<p role="status">{message}</p>}</Dialog.Content></Dialog.Portal>{open&&burst&&<ArtConfettiBurst anchorRef={anchor} onComplete={complete} fullscreen/>}</Dialog.Root>
}
