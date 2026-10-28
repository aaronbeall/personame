import { NextResponse } from 'next/server'
import { ownedQuiz, apiError } from '@/lib/personas'
import { saveDimensions } from '@/lib/editor-save'
type Context = { params: Promise<{ id: string }> }
export async function GET(_req: Request, { params }: Context) {
  try {
    return NextResponse.json((await ownedQuiz((await params).id)).dimensions)
  } catch (e) {
    return apiError(e)
  }
}
export async function POST(req: Request, { params }: Context) {
  try {
    return NextResponse.json(
      await saveDimensions((await params).id, await req.json())
    )
  } catch (e) {
    return apiError(e)
  }
}
