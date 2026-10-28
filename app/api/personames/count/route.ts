import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiError } from '@/lib/personas'

export async function GET() {
  try {
    const count = await prisma.persona.count({
      where: { status: 'PUBLISHED', visibility: 'PUBLIC' },
    })
    return NextResponse.json({ count })
  } catch (error) {
    return apiError(error)
  }
}
