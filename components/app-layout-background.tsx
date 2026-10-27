import type { ReactNode } from 'react'
export function AppLayoutBackground({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`workspace ${className}`}>
      <div className="workspace-landscape" aria-hidden="true" />
      <div className="workspace-inner">{children}</div>
    </div>
  )
}
