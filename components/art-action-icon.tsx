import Image from 'next/image'

export function ArtActionIcon({ kind }: { kind: 'create' | 'explore' }) {
  return (
    <Image
      src={
        kind === 'create'
          ? '/images/cta/create-curvy.png'
          : '/images/cta/explore.png'
      }
      width={40}
      height={40}
      alt=""
      className="art-action-icon"
      data-art-action={kind}
      aria-hidden="true"
    />
  )
}
