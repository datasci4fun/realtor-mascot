import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getTaskById, updateTask, deleteTask } from '@/lib/tasks'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const task = await getTaskById(params.id)

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  // Agents can only view their own tasks
  if (user.role !== 'admin' && task.assignedTo !== user.id) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  return NextResponse.json({ task })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existingTask = await getTaskById(params.id)

  if (!existingTask) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  // Agents can only update their own tasks
  if (user.role !== 'admin' && existingTask.assignedTo !== user.id) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const task = await updateTask(params.id, {
      title: body.title,
      description: body.description,
      assignedTo: body.assignedTo,
      dueDate: body.dueDate,
      priority: body.priority,
      status: body.status,
    })

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Failed to update task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existingTask = await getTaskById(params.id)

  if (!existingTask) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  // Agents can only delete their own tasks
  if (user.role !== 'admin' && existingTask.assignedTo !== user.id) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const success = await deleteTask(params.id)

  if (!success) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
