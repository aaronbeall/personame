import Image from 'next/image'

export function ArtActionIcon({ kind }: { kind: 'create' | 'explore' }) {
  return (
    <Image
      src={`/images/cta/${kind}.png`}
      width={40}
      height={40}
      alt=""
      className="art-action-icon"
      data-art-action={kind}
      aria-hidden="true"
    />
  )
}
