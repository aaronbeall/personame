import { NextResponse } from 'next/server'
import { ownedQuiz, apiError } from '@/lib/personas'
import { saveArchetypes } from '@/lib/editor-save'
type Context = { params: Promise<{ id: string }> }
export async function GET(_req: Request, { params }: Context) {
  try {
    return NextResponse.json((await ownedQuiz((await params).id)).archetypes)
  } catch (e) {
    return apiError(e)
  }
}
export async function POST(req: Request, { params }: Context) {
  try {
    return NextResponse.json(
      await saveArchetypes((await params).id, await req.json())
    )
  } catch (e) {
    return apiError(e)
  }
}
