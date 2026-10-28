import { redirect } from 'next/navigation'

// Keep existing bookmarks working while /dashboard remains available for a future overview.
export default function LegacyDashboard() {
  redirect('/quizzes')
}
