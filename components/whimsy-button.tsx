'use client'

import { useArtConfetti } from '@/hooks/use-art-confetti'
import { ArtConfettiBurst } from './art-confetti-burst'
import { Button, type ButtonProps } from './ui/button'

export function WhimsyButton({ children, className = '', disabled, loading, onPointerEnter, onFocus, ...props }: ButtonProps) {
  const { anchor, burst, complete, celebrate } = useArtConfetti<HTMLButtonElement>()
  return <Button {...props} ref={anchor} disabled={disabled} loading={loading} className={`whimsy-button ${className}`}
    onPointerEnter={event => { onPointerEnter?.(event); if (!disabled && !loading && event.pointerType === 'mouse') celebrate() }}
    onFocus={event => { onFocus?.(event); if (!disabled && !loading && event.currentTarget.matches(':focus-visible')) celebrate() }}>
    {children}{burst && <ArtConfettiBurst anchorRef={anchor} onComplete={complete} />}
  </Button>
}
