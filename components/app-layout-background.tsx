import Image from 'next/image'

interface AppLayoutBackgroundProps {
  children: React.ReactNode
}

export function AppLayoutBackground({ children }: AppLayoutBackgroundProps) {
  return (
    <div className="relative min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <Image
          src="/images/scene2.png"
          alt="Background"
          fill
          className="object-cover opacity-5"
          priority={false}
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-primary-50" />
      </div>
      <div className="relative container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
