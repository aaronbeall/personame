import Image from 'next/image'
import type { ReactNode } from 'react'
export function PageIntro({
  title,
  description,
  art = 'creation',
  eyebrow,
  actions,
  identity,
}: {
  title: string
  description: string
  art?: string
  eyebrow?: string
  identity?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="page-intro" data-page-art={art}>
      <Image
        src={`/images/decor/${art}.webp`}
        width={640}
        height={512}
        alt=""
        className="page-intro-art"
        priority
      />
      <div className="page-intro-copy">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {identity ? (
          <div className="page-intro-heading">
            {identity}
            <h1>{title}</h1>
          </div>
        ) : (
          <h1>{title}</h1>
        )}
        <p>{description}</p>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </header>
  )
}
