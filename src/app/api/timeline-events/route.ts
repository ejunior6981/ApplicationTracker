import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      applicationId,
      type,
      title,
      description,
      eventDate,
      isCompleted
    } = body

    // Validate required fields
    if (!applicationId || !type || !title) {
      return NextResponse.json(
        { error: 'Application ID, type, and title are required' },
        { status: 400 }
      )
    }

    const event = await db.timelineEvent.create({
      data: {
        applicationId,
        type,
        title,
        description: description || null,
        eventDate: eventDate ? new Date(eventDate) : new Date(),
        isCompleted: isCompleted || false
      }
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating timeline event:', error)
    return NextResponse.json(
      { error: 'Failed to create timeline event' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const applicationId = searchParams.get('applicationId')

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }

    const events = await db.timelineEvent.findMany({
      where: {
        applicationId: applicationId
      },
      orderBy: {
        eventDate: 'desc'
      }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching timeline events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timeline events' },
      { status: 500 }
    )
  }
}