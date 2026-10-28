import { NextResponse } from 'next/server'
import { ownedQuizSelect, apiError } from '@/lib/personas'
import { saveArchetypes } from '@/lib/editor-save'
type Context = { params: Promise<{ id: string }> }
export async function GET(_req: Request, { params }: Context) {
  try {
    return NextResponse.json((await ownedQuizSelect((await params).id, { archetypes: { orderBy: { order: 'asc' }, include: { dimensions: true } } })).archetypes)
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
