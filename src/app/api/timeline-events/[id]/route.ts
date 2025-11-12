import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    await db.timelineEvent.delete({
      where: {
        id: resolvedParams.id
      }
    })

    return NextResponse.json({ message: 'Timeline event deleted successfully' })
 } catch (error) {
    console.error('Error deleting timeline event:', error)
    return NextResponse.json(
      { error: 'Failed to delete timeline event' },
      { status: 500 }
    )
  }
}
