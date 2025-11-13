import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import type { ApplicationStatus } from '@prisma/client'
import { db } from '@/lib/db'
import { dateOnlyStringToUTCDate } from '@/lib/utils'
import { ALLOWED_EXTENSIONS, saveUploadedFile } from '@/lib/uploads'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const applications = await db.jobApplication.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        documents: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

const APPLICATION_STATUSES: ApplicationStatus[] = [
  'NOT_APPLIED',
  'APPLIED',
  'INITIAL_CALL',
  'FIRST_INTERVIEW',
  'SECOND_INTERVIEW',
  'THIRD_INTERVIEW',
  'NEGOTIATIONS',
  'NOT_ACCEPTED',
  'LOST'
]
function toApplicationStatus(value: string | null): ApplicationStatus {
  if (value && APPLICATION_STATUSES.includes(value as ApplicationStatus)) {
    return value as ApplicationStatus
  }
  return 'NOT_APPLIED'
}

function parseBoolean(value: FormDataEntryValue | null, fallback = false) {
  if (typeof value !== 'string') {
    return fallback
  }
  const normalized = value.toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'on'
}

function getString(form: FormData, key: string) {
  const value = form.get(key)
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()

      const company = getString(formData, 'company')
      const position = getString(formData, 'position')

      if (!company || !position) {
        return NextResponse.json(
          { error: 'Company and position are required' },
          { status: 400 }
        )
      }

      const status = toApplicationStatus(getString(formData, 'status'))

      const resumeUpload = formData.get('resumeFile')
      if (resumeUpload instanceof File && resumeUpload.size > 0) {
        const extension = path.extname(resumeUpload.name ?? '').toLowerCase()
        if (!ALLOWED_EXTENSIONS.has(extension)) {
          return NextResponse.json(
            { error: 'Unsupported resume file type. Please upload a PDF or Word document.' },
            { status: 400 }
          )
        }
      }

      const coverLetterUpload = formData.get('coverLetterFile')
      if (coverLetterUpload instanceof File && coverLetterUpload.size > 0) {
        const extension = path.extname(coverLetterUpload.name ?? '').toLowerCase()
        if (!ALLOWED_EXTENSIONS.has(extension)) {
          return NextResponse.json(
            { error: 'Unsupported cover letter file type. Please upload a PDF or Word document.' },
            { status: 400 }
          )
        }
      }

      const documentFileEntries = formData.getAll('documentFiles')
      const documentLabelEntries = formData.getAll('documentLabels')
      const additionalUploads: Array<{ file: File; label: string | null }> = []

      for (let index = 0; index < documentFileEntries.length; index++) {
        const entry = documentFileEntries[index]
        if (!(entry instanceof File) || entry.size === 0) {
          continue
        }

        const extension = path.extname(entry.name ?? '').toLowerCase()
        if (!ALLOWED_EXTENSIONS.has(extension)) {
          return NextResponse.json(
            { error: 'Unsupported document file type. Please upload a PDF or Word document.' },
            { status: 400 }
          )
        }

        const labelEntry = documentLabelEntries[index]
        const normalizedLabel = typeof labelEntry === 'string' ? labelEntry.trim() : ''

        additionalUploads.push({
          file: entry,
          label: normalizedLabel.length > 0 ? normalizedLabel : null
        })
      }

      const application = await db.jobApplication.create({
        data: {
          company,
          position,
          pay: getString(formData, 'pay'),
          status,
          appliedDate: dateOnlyStringToUTCDate(getString(formData, 'appliedDate')),
          initialCallDate: dateOnlyStringToUTCDate(getString(formData, 'initialCallDate')),
          initialCallCompleted: parseBoolean(formData.get('initialCallCompleted')),
          firstInterviewDate: dateOnlyStringToUTCDate(getString(formData, 'firstInterviewDate')),
          firstInterviewCompleted: parseBoolean(formData.get('firstInterviewCompleted')),
          secondInterviewDate: dateOnlyStringToUTCDate(getString(formData, 'secondInterviewDate')),
          secondInterviewCompleted: parseBoolean(formData.get('secondInterviewCompleted')),
          thirdInterviewDate: dateOnlyStringToUTCDate(getString(formData, 'thirdInterviewDate')),
          thirdInterviewCompleted: parseBoolean(formData.get('thirdInterviewCompleted')),
          negotiationsDate: dateOnlyStringToUTCDate(getString(formData, 'negotiationsDate')),
          negotiationsCompleted: parseBoolean(formData.get('negotiationsCompleted')),
          notes: getString(formData, 'notes')
        }
      })

      const updates: Record<string, string> = {}
      if (resumeUpload instanceof File && resumeUpload.size > 0) {
        updates.resumeFile = await saveUploadedFile(application.id, resumeUpload, 'resume')
      }
      if (coverLetterUpload instanceof File && coverLetterUpload.size > 0) {
        updates.coverLetterFile = await saveUploadedFile(application.id, coverLetterUpload, 'cover-letter')
      }

      let applicationWithFiles = application

      if (Object.keys(updates).length > 0) {
        applicationWithFiles = await db.jobApplication.update({
          where: { id: application.id },
          data: updates
        })
      }

      if (additionalUploads.length > 0) {
        for (const upload of additionalUploads) {
          try {
            const storedPath = await saveUploadedFile(application.id, upload.file, 'document')
            await db.applicationDocument.create({
              data: {
                applicationId: application.id,
                label: upload.label,
                filePath: storedPath
              }
            })
          } catch (error: any) {
            return NextResponse.json(
              { error: error?.message || 'Failed to upload additional document' },
              { status: 400 }
            )
          }
        }
      }

      const applicationWithDocuments = await db.jobApplication.findUnique({
        where: { id: application.id },
        include: {
          documents: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      })

      if (applicationWithDocuments) {
        return NextResponse.json(applicationWithDocuments, { status: 201 })
      }

      return NextResponse.json({ ...applicationWithFiles, documents: [] }, { status: 201 })
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

    if (!company || !position) {
      return NextResponse.json(
        { error: 'Company and position are required' },
        { status: 400 }
      )
    }

    const application = await db.jobApplication.create({
      data: {
        company,
        position,
        pay: pay || null,
        status: toApplicationStatus(status ?? null),
        appliedDate: dateOnlyStringToUTCDate(appliedDate),
        initialCallDate: dateOnlyStringToUTCDate(initialCallDate),
        initialCallCompleted: initialCallCompleted || false,
        firstInterviewDate: dateOnlyStringToUTCDate(firstInterviewDate),
        firstInterviewCompleted: firstInterviewCompleted || false,
        secondInterviewDate: dateOnlyStringToUTCDate(secondInterviewDate),
        secondInterviewCompleted: secondInterviewCompleted || false,
        thirdInterviewDate: dateOnlyStringToUTCDate(thirdInterviewDate),
        thirdInterviewCompleted: thirdInterviewCompleted || false,
        negotiationsDate: dateOnlyStringToUTCDate(negotiationsDate),
        negotiationsCompleted: negotiationsCompleted || false,
        notes: notes || null,
        resumeFile: resumeFile || null,
        coverLetterFile: coverLetterFile || null
      }
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
}