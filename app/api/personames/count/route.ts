import { NextResponse } from 'next/server'
import { publishedCount } from '@/lib/public-cache'
import { apiError } from '@/lib/personas'

export async function GET() {
  try {
    const count = await publishedCount()
    return NextResponse.json({ count })
  } catch (error) {
    return apiError(error)
  }
}
