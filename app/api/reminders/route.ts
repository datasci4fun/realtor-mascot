import { NextRequest, NextResponse } from 'next/server'
import {
  createReminder,
  getUserReminders,
  getReminderCount,
  getOverdueCount,
  calculateReminderTime,
} from '@/lib/reminders'
import { verifySession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifySession(sessionToken)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    // Return just counts if requested
    if (searchParams.get('counts') === 'true') {
      const [total, overdue] = await Promise.all([
        getReminderCount(user.id),
        getOverdueCount(user.id),
      ])

      return NextResponse.json({ total, overdue })
    }

    const includeCompleted = searchParams.get('includeCompleted') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    const reminders = await getUserReminders(user.id, { includeCompleted, limit })

    return NextResponse.json({ reminders })
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifySession(sessionToken)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 })
    }

    let remindAt: Date

    if (body.preset) {
      // Use preset time
      remindAt = calculateReminderTime(body.preset)
    } else if (body.remindAt) {
      // Use custom time
      remindAt = new Date(body.remindAt)
    } else {
      return NextResponse.json(
        { error: 'Either preset or remindAt is required' },
        { status: 400 }
      )
    }

    // Validate the time is in the future
    if (remindAt <= new Date()) {
      return NextResponse.json({ error: 'Reminder time must be in the future' }, { status: 400 })
    }

    const reminder = await createReminder({
      leadId: body.leadId,
      userId: user.id,
      remindAt,
      message: body.message,
    })

    return NextResponse.json(reminder, { status: 201 })
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 })
  }
}
