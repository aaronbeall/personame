import { AppLayoutBackground } from '@/components/app-layout-background'
import { LoadingState } from '@/components/ui/loading'

export default function LoadingPage() {
  return (
    <AppLayoutBackground>
      <div className="max-w-4xl mx-auto">
        <LoadingState label="Getting things ready…" />
      </div>
    </AppLayoutBackground>
  )
}
