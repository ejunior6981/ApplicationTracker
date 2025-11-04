import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      applicationId,
      name,
      email,
      phone,
      position,
      department,
      notes,
      isPrimary
    } = body

    // Validate required fields
    if (!applicationId || !name) {
      return NextResponse.json(
        { error: 'Application ID and name are required' },
        { status: 400 }
      )
    }

    // If this is marked as primary, unmark other contacts
    if (isPrimary) {
      await db.contact.updateMany({
        where: {
          applicationId: applicationId
        },
        data: {
          isPrimary: false
        }
      })
    }

    const contact = await db.contact.create({
      data: {
        applicationId,
        name,
        email: email || null,
        phone: phone || null,
        position: position || null,
        department: department || null,
        notes: notes || null,
        isPrimary: isPrimary || false
      }
    })

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json(
      { error: 'Failed to create contact' },
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

    const contacts = await db.contact.findMany({
      where: {
        applicationId: applicationId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}