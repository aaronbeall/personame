import type { ReactNode } from 'react'

export function BuilderFooter({
  back,
  note,
  children,
}: {
  back: ReactNode
  note: string
  children: ReactNode
}) {
  return (
    <footer className="builder-footer">
      <div className="builder-footer-back">{back}</div>
      <p>{note}</p>
      <div className="builder-footer-next">{children}</div>
    </footer>
  )
}
