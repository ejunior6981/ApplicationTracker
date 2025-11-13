import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { dateOnlyStringToUTCDate, toDateOnlyString } from '@/lib/utils'
import { saveUploadedFile, deleteUploadedFile } from '@/lib/uploads'

const applicationInclude = {
  contacts: {
    orderBy: {
      createdAt: 'desc'
    }
  },
  timelineEvents: {
    orderBy: {
      eventDate: 'desc'
    }
  },
  documents: {
    orderBy: {
      createdAt: 'desc'
    }
  }
} as const

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
      include: applicationInclude
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
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      return await handleMultipartUpdate(request, resolvedParams.id)
    }

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
      updatedAt: new Date()
    }

    if (pay !== undefined) {
      updateData.pay = pay || null
    }

    if (status !== undefined) {
      updateData.status = status || 'NOT_APPLIED'
    }

    const assignDateField = (key: string, value: unknown) => {
      if (value === undefined) {
        return
      }
      if (!value) {
        updateData[key] = null
        return
      }
      if (value instanceof Date) {
        updateData[key] = dateOnlyStringToUTCDate(toDateOnlyString(value))
        return
      }
      updateData[key] = dateOnlyStringToUTCDate(value as string)
    }

    assignDateField('appliedDate', appliedDate)
    assignDateField('initialCallDate', initialCallDate)
    assignDateField('firstInterviewDate', firstInterviewDate)
    assignDateField('secondInterviewDate', secondInterviewDate)
    assignDateField('thirdInterviewDate', thirdInterviewDate)
    assignDateField('negotiationsDate', negotiationsDate)

    if (notes !== undefined) {
      updateData.notes = notes || null
    }

    if (resumeFile !== undefined) {
      updateData.resumeFile = resumeFile || null
    }

    if (coverLetterFile !== undefined) {
      updateData.coverLetterFile = coverLetterFile || null
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
      include: applicationInclude
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
      include: applicationInclude
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

async function handleMultipartUpdate(request: NextRequest, applicationId: string) {
  try {
    const formData = await request.formData()
    const actionRaw = formData.get('action')
    const action = typeof actionRaw === 'string' ? actionRaw.trim().toLowerCase() : null

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 })
    }

    const application = await db.jobApplication.findUnique({
      where: { id: applicationId },
      include: applicationInclude
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const getString = (key: string) => {
      const value = formData.get(key)
      if (typeof value !== 'string') {
        return null
      }
      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : null
    }

    const company = getString('company') ?? application.company
    const position = getString('position') ?? application.position

    const withRequiredFields = (data: Record<string, unknown> = {}) => ({
      ...data,
      company,
      position
    })

    const includeUpdatedApplication = async () =>
      db.jobApplication.findUnique({
        where: { id: applicationId },
        include: applicationInclude
      })

    if (action === 'uploadresume') {
      const file = formData.get('resumeFile')
      if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json({ error: 'Resume file is required' }, { status: 400 })
      }

      try {
        const storedPath = await saveUploadedFile(applicationId, file, 'resume')
        await deleteUploadedFile(application.resumeFile)

        const updated = await db.jobApplication.update({
          where: { id: applicationId },
          data: withRequiredFields({ resumeFile: storedPath }),
          include: applicationInclude
        })

        return NextResponse.json(updated)
      } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to upload resume' }, { status: 400 })
      }
    }

    if (action === 'removeresume') {
      await deleteUploadedFile(application.resumeFile)
      const updated = await db.jobApplication.update({
        where: { id: applicationId },
        data: withRequiredFields({ resumeFile: null }),
        include: applicationInclude
      })

      return NextResponse.json(updated)
    }

    if (action === 'uploadcoverletter') {
      const file = formData.get('coverLetterFile')
      if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json({ error: 'Cover letter file is required' }, { status: 400 })
      }

      try {
        const storedPath = await saveUploadedFile(applicationId, file, 'cover-letter')
        await deleteUploadedFile(application.coverLetterFile)

        const updated = await db.jobApplication.update({
          where: { id: applicationId },
          data: withRequiredFields({ coverLetterFile: storedPath }),
          include: applicationInclude
        })

        return NextResponse.json(updated)
      } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to upload cover letter' }, { status: 400 })
      }
    }

    if (action === 'removecoverletter') {
      await deleteUploadedFile(application.coverLetterFile)
      const updated = await db.jobApplication.update({
        where: { id: applicationId },
        data: withRequiredFields({ coverLetterFile: null }),
        include: applicationInclude
      })

      return NextResponse.json(updated)
    }

    if (action === 'uploadadditional') {
      const file = formData.get('documentFile')
      if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json({ error: 'Document file is required' }, { status: 400 })
      }

      const label = getString('label')

      try {
        const storedPath = await saveUploadedFile(applicationId, file, 'document')
        await db.applicationDocument.create({
          data: {
            applicationId,
            label,
            filePath: storedPath
          }
        })

        const updated = await includeUpdatedApplication()
        return NextResponse.json(updated)
      } catch (error: any) {
        return NextResponse.json({ error: error?.message || 'Failed to upload document' }, { status: 400 })
      }
    }

    if (action === 'deletedocument') {
      const documentId = getString('documentId')
      if (!documentId) {
        return NextResponse.json({ error: 'Document id is required' }, { status: 400 })
      }

      const document = await db.applicationDocument.findUnique({ where: { id: documentId } })
      if (!document || document.applicationId !== applicationId) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }

      await deleteUploadedFile(document.filePath)
      await db.applicationDocument.delete({ where: { id: documentId } })

      const updated = await includeUpdatedApplication()
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  } catch (error) {
    console.error('Error handling multipart update:', error)
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
