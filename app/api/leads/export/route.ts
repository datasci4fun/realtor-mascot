import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
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
    const fields = searchParams.get('fields')?.split(',') || [
      'name',
      'email',
      'phone',
      'intent',
      'status',
      'source',
      'createdAt',
    ]
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const search = searchParams.get('search')
    const assignedTo = searchParams.get('assignedTo')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build query
    let query = `
      SELECT
        l.id,
        l.name,
        l.email,
        l.phone,
        l.intent,
        l.status,
        l.source,
        l.timeline,
        l.budget,
        l.message,
        l.priority,
        l.created_at,
        l.updated_at,
        au.name as assigned_to_name
      FROM leads l
      LEFT JOIN admin_users au ON l.assigned_to = au.id
      WHERE 1=1
    `
    const params: (string | Date)[] = []
    let paramIndex = 1

    if (status && status !== 'all') {
      query += ` AND l.status = $${paramIndex++}`
      params.push(status)
    }

    if (source && source !== 'all') {
      query += ` AND l.source = $${paramIndex++}`
      params.push(source)
    }

    if (assignedTo) {
      if (assignedTo === 'unassigned') {
        query += ` AND l.assigned_to IS NULL`
      } else {
        query += ` AND l.assigned_to = $${paramIndex++}`
        params.push(assignedTo)
      }
    }

    if (search) {
      query += ` AND (l.name ILIKE $${paramIndex} OR l.email ILIKE $${paramIndex} OR l.phone ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (startDate) {
      query += ` AND l.created_at >= $${paramIndex++}`
      params.push(new Date(startDate))
    }

    if (endDate) {
      query += ` AND l.created_at <= $${paramIndex++}`
      params.push(new Date(endDate + 'T23:59:59'))
    }

    query += ` ORDER BY l.created_at DESC`

    const result = await pool.query(query, params)

    // Map database fields to export fields
    const fieldMapping: Record<string, string> = {
      name: 'name',
      email: 'email',
      phone: 'phone',
      intent: 'intent',
      status: 'status',
      source: 'source',
      timeline: 'timeline',
      budget: 'budget',
      priority: 'priority',
      message: 'message',
      assignedToName: 'assigned_to_name',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }

    // Build CSV header
    const headers = fields.map((field) => {
      const labelMap: Record<string, string> = {
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        intent: 'Intent',
        status: 'Status',
        source: 'Source',
        timeline: 'Timeline',
        budget: 'Budget',
        priority: 'Priority',
        message: 'Message',
        assignedToName: 'Assigned To',
        createdAt: 'Created Date',
        updatedAt: 'Last Updated',
      }
      return labelMap[field] || field
    })

    // Build CSV rows
    const rows = result.rows.map((row) => {
      return fields.map((field) => {
        const dbField = fieldMapping[field]
        let value = row[dbField]

        // Format dates
        if (field === 'createdAt' || field === 'updatedAt') {
          value = value ? new Date(value).toISOString().split('T')[0] : ''
        }

        // Handle nulls
        if (value === null || value === undefined) {
          value = ''
        }

        // Escape CSV special characters
        value = String(value)
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value.replace(/"/g, '""')}"`
        }

        return value
      })
    })

    // Build CSV content
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

    // Return as downloadable CSV
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting leads:', error)
    return NextResponse.json({ error: 'Failed to export leads' }, { status: 500 })
  }
}
