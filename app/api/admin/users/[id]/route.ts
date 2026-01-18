import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getUserById, updateUser, deactivateUser, reactivateUser } from '@/lib/users'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Agents can only view their own profile
  if (currentUser.role !== 'admin' && currentUser.id !== params.id) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const user = await getUserById(params.id)

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ user })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Agents can only update their own profile (limited fields)
  const isSelf = currentUser.id === params.id
  const isAdmin = currentUser.role === 'admin'

  if (!isAdmin && !isSelf) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  try {
    const body = await request.json()

    // Non-admins can only update limited fields
    if (!isAdmin) {
      const allowedFields = ['name', 'phone', 'password']
      const requestedFields = Object.keys(body)
      const hasDisallowedFields = requestedFields.some(
        (f) => !allowedFields.includes(f)
      )

      if (hasDisallowedFields) {
        return NextResponse.json(
          { error: 'You can only update your name, phone, and password' },
          { status: 403 }
        )
      }
    }

    // Prevent last admin from being demoted
    if (body.role === 'agent' && params.id === currentUser.id) {
      return NextResponse.json(
        { error: 'You cannot demote yourself' },
        { status: 400 }
      )
    }

    const updatedUser = await updateUser(params.id, body)

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only admins can deactivate users
  if (currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  // Prevent self-deactivation
  if (currentUser.id === params.id) {
    return NextResponse.json(
      { error: 'You cannot deactivate yourself' },
      { status: 400 }
    )
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action === 'reactivate') {
    const success = await reactivateUser(params.id)
    if (!success) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'User reactivated' })
  }

  const success = await deactivateUser(params.id)

  if (!success) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, message: 'User deactivated' })
}
