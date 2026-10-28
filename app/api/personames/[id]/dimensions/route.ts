import { NextResponse } from 'next/server'
import { ownedQuizSelect, apiError } from '@/lib/personas'
import { saveDimensions } from '@/lib/editor-save'
type Context = { params: Promise<{ id: string }> }
export async function GET(_req: Request, { params }: Context) {
  try {
    return NextResponse.json((await ownedQuizSelect((await params).id, { dimensions: { orderBy: { order: 'asc' } } })).dimensions)
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
