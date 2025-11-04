import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const applications = await db.jobApplication.findMany({
      orderBy: {
        createdAt: 'desc'
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

export async function POST(request: NextRequest) {
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

    const application = await db.jobApplication.create({
      data: {
        company,
        position,
        pay: pay || null,
        status: status || 'NOT_APPLIED',
        appliedDate: appliedDate ? new Date(appliedDate) : null,
        initialCallDate: initialCallDate ? new Date(initialCallDate) : null,
        initialCallCompleted: initialCallCompleted || false,
        firstInterviewDate: firstInterviewDate ? new Date(firstInterviewDate) : null,
        firstInterviewCompleted: firstInterviewCompleted || false,
        secondInterviewDate: secondInterviewDate ? new Date(secondInterviewDate) : null,
        secondInterviewCompleted: secondInterviewCompleted || false,
        thirdInterviewDate: thirdInterviewDate ? new Date(thirdInterviewDate) : null,
        thirdInterviewCompleted: thirdInterviewCompleted || false,
        negotiationsDate: negotiationsDate ? new Date(negotiationsDate) : null,
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