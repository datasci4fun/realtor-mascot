import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getTasks, createTask, getTaskStats } from '@/lib/tasks'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)

  const filters = {
    status: searchParams.get('status') || undefined,
    priority: searchParams.get('priority') || undefined,
    assignedTo: searchParams.get('assignedTo') || undefined,
    leadId: searchParams.get('leadId') || undefined,
    dueDate: (searchParams.get('dueDate') as 'overdue' | 'today' | 'week' | 'all') || undefined,
    search: searchParams.get('search') || undefined,
  }

  // If not admin, only show own tasks
  if (user.role !== 'admin' && !filters.assignedTo) {
    filters.assignedTo = user.id
  }

  const tasks = await getTasks(filters)
  const stats = await getTaskStats(user.role === 'admin' ? undefined : user.id)

  return NextResponse.json({ tasks, stats })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    if (!body.title || !body.assignedTo) {
      return NextResponse.json(
        { error: 'Title and assignee are required' },
        { status: 400 }
      )
    }

    const task = await createTask(
      {
        title: body.title,
        description: body.description,
        leadId: body.leadId,
        assignedTo: body.assignedTo,
        dueDate: body.dueDate,
        priority: body.priority,
      },
      user.id
    )

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Failed to create task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
