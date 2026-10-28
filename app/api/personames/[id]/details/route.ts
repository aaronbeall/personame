import { NextResponse } from 'next/server'
import { ownedQuizSelect, apiError } from '@/lib/personas'
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    return NextResponse.json(await ownedQuizSelect((await params).id, { title: true, description: true, emoji: true, color: true }))
  } catch (error) { return apiError(error) }
}
