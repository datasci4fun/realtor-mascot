import { NextRequest, NextResponse } from 'next/server'
import { hasAdminUsers, createAdminUser } from '@/lib/auth'

export async function GET(): Promise<NextResponse> {
  const hasUsers = await hasAdminUsers()

  return NextResponse.json({
    needsSetup: !hasUsers,
  })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Only allow setup if no admin users exist
  if (await hasAdminUsers()) {
    return NextResponse.json(
      { error: 'Setup already completed' },
      { status: 400 }
    )
  }

  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const user = await createAdminUser(email, password, name, 'admin')

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create admin user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
