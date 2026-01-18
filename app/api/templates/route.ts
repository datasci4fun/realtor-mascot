import { NextRequest, NextResponse } from 'next/server'
import { getTemplates, createTemplate, CreateTemplateData } from '@/lib/templates'
import { validateSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await validateSession(sessionToken)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined

    const templates = await getTemplates(category)

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await validateSession(sessionToken)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.subject || !body.body || !body.category) {
      return NextResponse.json(
        { error: 'Name, subject, body, and category are required' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['follow_up', 'showing', 'offer', 'closing', 'other']
    if (!validCategories.includes(body.category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
    }

    const templateData: CreateTemplateData = {
      name: body.name,
      subject: body.subject,
      body: body.body,
      category: body.category,
      createdBy: user.id,
      isDefault: body.isDefault || false,
    }

    const template = await createTemplate(templateData)

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
