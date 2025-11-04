import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const application = await db.jobApplication.findUnique({
      where: {
        id: params.id
      },
      include: {
        contacts: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        timelineEvents: {
          orderBy: {
            eventDate: 'desc'
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const {
      company,
      position,
      pay,
      status,
      appliedDate,
      initialCallDate,
      initialCallCompleted,
      firstInterviewDate,
      firstInterviewCompleted,
      secondInterviewDate,
      secondInterviewCompleted,
      thirdInterviewDate,
      thirdInterviewCompleted,
      negotiationsDate,
      negotiationsCompleted,
      notes,
      resumeFile,
      coverLetterFile
    } = body

    // Validate required fields
    if (!company || !position) {
      return NextResponse.json(
        { error: 'Company and position are required' },
        { status: 400 }
      )
    }

    // Auto-update completion status based on dates
    const updateData: any = {
      company,
      position,
      pay: pay || null,
      status: status || 'NOT_APPLIED',
      appliedDate: appliedDate ? new Date(appliedDate) : null,
      initialCallDate: initialCallDate ? new Date(initialCallDate) : null,
      firstInterviewDate: firstInterviewDate ? new Date(firstInterviewDate) : null,
      secondInterviewDate: secondInterviewDate ? new Date(secondInterviewDate) : null,
      thirdInterviewDate: thirdInterviewDate ? new Date(thirdInterviewDate) : null,
      negotiationsDate: negotiationsDate ? new Date(negotiationsDate) : null,
      notes: notes || null,
      resumeFile: resumeFile || null,
      coverLetterFile: coverLetterFile || null,
      updatedAt: new Date()
    }

    // Only update completion flags if explicitly provided
    if (initialCallCompleted !== undefined) {
      updateData.initialCallCompleted = initialCallCompleted
    }
    if (firstInterviewCompleted !== undefined) {
      updateData.firstInterviewCompleted = firstInterviewCompleted
    }
    if (secondInterviewCompleted !== undefined) {
      updateData.secondInterviewCompleted = secondInterviewCompleted
    }
    if (thirdInterviewCompleted !== undefined) {
      updateData.thirdInterviewCompleted = thirdInterviewCompleted
    }
    if (negotiationsCompleted !== undefined) {
      updateData.negotiationsCompleted = negotiationsCompleted
    }

    const application = await db.jobApplication.update({
      where: {
        id: params.id
      },
      data: updateData,
      include: {
        contacts: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        timelineEvents: {
          orderBy: {
            eventDate: 'desc'
          }
        }
      }
    })

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.jobApplication.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Application deleted successfully' })
  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    )
  }
}