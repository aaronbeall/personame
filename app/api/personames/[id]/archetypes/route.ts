import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    // TODO: Fetch archetypes from database
    // For now, return empty array
    return NextResponse.json([])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch archetypes' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const { archetypes } = await request.json()

    // TODO: Save archetypes to database
    // For now, just return success
    return NextResponse.json(archetypes)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save archetypes' }, { status: 500 })
  }
}
