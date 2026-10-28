import { NextResponse } from 'next/server'
import { ownedQuiz, apiError } from '@/lib/personas'
import { savePages } from '@/lib/editor-save'
type Context = { params: Promise<{ id: string }> }
export async function GET(_req: Request, { params }: Context) {
  try {
    return NextResponse.json((await ownedQuiz((await params).id)).pages)
  } catch (e) {
    return apiError(e)
  }
}
export async function POST(req: Request, { params }: Context) {
  try {
    return NextResponse.json(
      await savePages((await params).id, await req.json())
    )
  } catch (e) {
    return apiError(e)
  }
}
