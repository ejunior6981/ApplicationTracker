import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const {
      name,
      email,
      phone,
      position,
      department,
      notes,
      isPrimary
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Get the contact to check applicationId
    const existingContact = await db.contact.findUnique({
      where: { id: params.id }
    })

    if (!existingContact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      )
    }

    // If this is marked as primary, unmark other contacts
    if (isPrimary) {
      await db.contact.updateMany({
        where: {
          applicationId: existingContact.applicationId,
          id: { not: params.id }
        },
        data: {
          isPrimary: false
        }
      })
    }

    const contact = await db.contact.update({
      where: {
        id: params.id
      },
      data: {
        name,
        email: email || null,
        phone: phone || null,
        position: position || null,
        department: department || null,
        notes: notes || null,
        isPrimary: isPrimary || false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(contact)
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.contact.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Contact deleted successfully' })
  } catch (error) {
    console.error('Error deleting contact:', error)
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 }
    )
  }
}