import { NextResponse } from 'next/server'
import { currentUser, apiError } from '@/lib/personas'
import { discoveryPage } from '@/lib/discoveries'
import { listParameters } from '@/lib/pagination'
export async function GET(request: Request) {
  try {
    const { page, limit, skip, search } = listParameters(request)
    const user = await currentUser()
    const result = await discoveryPage(user.id, search, skip, limit)
    return NextResponse.json({ ...result, page, hasMore: skip + result.items.length < result.total })
  } catch (error) { return apiError(error) }
}
