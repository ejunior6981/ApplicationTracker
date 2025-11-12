import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const application = await db.jobApplication.findUnique({
      where: {
        id: resolvedParams.id
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
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
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
      initialCallNotes,
      firstInterviewDate,
      firstInterviewCompleted,
      firstInterviewNotes,
      secondInterviewDate,
      secondInterviewCompleted,
      secondInterviewNotes,
      thirdInterviewDate,
      thirdInterviewCompleted,
      thirdInterviewNotes,
      negotiationsDate,
      negotiationsCompleted,
      negotiationsNotes,
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

    // Update interview notes if provided
    if (initialCallNotes !== undefined) {
      updateData.initialCallNotes = initialCallNotes
    }
    if (firstInterviewNotes !== undefined) {
      updateData.firstInterviewNotes = firstInterviewNotes
    }
    if (secondInterviewNotes !== undefined) {
      updateData.secondInterviewNotes = secondInterviewNotes
    }
    if (thirdInterviewNotes !== undefined) {
      updateData.thirdInterviewNotes = thirdInterviewNotes
    }
    if (negotiationsNotes !== undefined) {
      updateData.negotiationsNotes = negotiationsNotes
    }

    // Get the old application to check if status changed
    const oldApplication = await db.jobApplication.findUnique({
      where: { id: resolvedParams.id }
    })

    const application = await db.jobApplication.update({
      where: {
        id: resolvedParams.id
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

    // Create timeline events for date changes
    if (oldApplication) {
      // Check for new interview dates being set
      if (!oldApplication.firstInterviewDate && application.firstInterviewDate) {
        await db.timelineEvent.create({
          data: {
            applicationId: resolvedParams.id,
            type: 'FIRST_INTERVIEW_SCHEDULED',
            title: 'First Interview Scheduled',
            description: 'First interview has been scheduled',
            eventDate: new Date(application.firstInterviewDate),
            isCompleted: false
          }
        })
      }
      if (!oldApplication.secondInterviewDate && application.secondInterviewDate) {
        await db.timelineEvent.create({
          data: {
            applicationId: resolvedParams.id,
            type: 'SECOND_INTERVIEW_SCHEDULED',
            title: 'Second Interview Scheduled',
            description: 'Second interview has been scheduled',
            eventDate: new Date(application.secondInterviewDate),
            isCompleted: false
          }
        })
      }
      if (!oldApplication.thirdInterviewDate && application.thirdInterviewDate) {
        await db.timelineEvent.create({
          data: {
            applicationId: resolvedParams.id,
            type: 'THIRD_INTERVIEW_SCHEDULED',
            title: 'Third Interview Scheduled',
            description: 'Third interview has been scheduled',
            eventDate: new Date(application.thirdInterviewDate),
            isCompleted: false
          }
        })
      }
      if (!oldApplication.initialCallDate && application.initialCallDate) {
        await db.timelineEvent.create({
          data: {
            applicationId: resolvedParams.id,
            type: 'INITIAL_CALL_SCHEDULED',
            title: 'Initial Call Scheduled',
            description: 'Initial call has been scheduled',
            eventDate: new Date(application.initialCallDate),
            isCompleted: false
          }
        })
      }
      if (!oldApplication.negotiationsDate && application.negotiationsDate) {
        await db.timelineEvent.create({
          data: {
            applicationId: resolvedParams.id,
            type: 'NEGOTIATIONS_STARTED',
            title: 'Negotiations Started',
            description: 'Salary negotiations have been scheduled',
            eventDate: new Date(application.negotiationsDate),
            isCompleted: false
          }
        })
      }

      // Check for completion status changes with notes
      if (!oldApplication.firstInterviewCompleted && application.firstInterviewCompleted) {
        const description = firstInterviewNotes 
          ? `First interview completed with notes: ${firstInterviewNotes}`
          : 'First interview has been completed';
        
        await db.timelineEvent.create({
          data: {
            applicationId: resolvedParams.id,
            type: 'FIRST_INTERVIEW_COMPLETED',
            title: 'First Interview Completed',
            description,
            eventDate: new Date(application.firstInterviewDate!),
            isCompleted: true
          }
        })
      }
      if (!oldApplication.secondInterviewCompleted && application.secondInterviewCompleted) {
        const description = secondInterviewNotes 
          ? `Second interview completed with notes: ${secondInterviewNotes}`
          : 'Second interview has been completed';
        
        await db.timelineEvent.create({
          data: {
            applicationId: resolvedParams.id,
            type: 'SECOND_INTERVIEW_COMPLETED',
            title: 'Second Interview Completed',
            description,
            eventDate: new Date(application.secondInterviewDate!),
            isCompleted: true
          }
        })
      }
      if (!oldApplication.thirdInterviewCompleted && application.thirdInterviewCompleted) {
        const description = thirdInterviewNotes 
          ? `Third interview completed with notes: ${thirdInterviewNotes}`
          : 'Third interview has been completed';
        
        await db.timelineEvent.create({
          data: {
            applicationId: resolvedParams.id,
            type: 'THIRD_INTERVIEW_COMPLETED',
            title: 'Third Interview Completed',
            description,
            eventDate: new Date(application.thirdInterviewDate!),
            isCompleted: true
          }
        })
      }
      if (!oldApplication.initialCallCompleted && application.initialCallCompleted) {
        const description = initialCallNotes 
          ? `Initial call completed with notes: ${initialCallNotes}`
          : 'Initial call has been completed';
        
        await db.timelineEvent.create({
          data: {
            applicationId: resolvedParams.id,
            type: 'INITIAL_CALL_COMPLETED',
            title: 'Initial Call Completed',
            description,
            eventDate: new Date(application.initialCallDate!),
            isCompleted: true
          }
        })
      }
      if (!oldApplication.negotiationsCompleted && application.negotiationsCompleted) {
        const description = negotiationsNotes 
          ? `Negotiations completed with notes: ${negotiationsNotes}`
          : 'Salary negotiations have been completed';
        
        await db.timelineEvent.create({
          data: {
            applicationId: resolvedParams.id,
            type: 'NEGOTIATIONS_COMPLETED',
            title: 'Negotiations Completed',
            description,
            eventDate: new Date(application.negotiationsDate!),
            isCompleted: true
          }
        })
      }
    }

    // Create timeline event if status changed
    if (status && oldApplication && oldApplication.status !== status) {
      await db.timelineEvent.create({
        data: {
          applicationId: resolvedParams.id,
          type: 'STATUS_CHANGED',
          title: 'Status Changed',
          description: `Application status changed from ${oldApplication.status.replace(/_/g, ' ')} to ${status.replace(/_/g, ' ')}`,
          eventDate: new Date(),
          isCompleted: false
        }
      })
    }

    // Re-fetch the application to include the new timeline event
    const updatedApplication = await db.jobApplication.findUnique({
      where: {
        id: resolvedParams.id
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

    return NextResponse.json(updatedApplication)
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
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    await db.jobApplication.delete({
      where: {
        id: resolvedParams.id
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
