import { NextRequest, NextResponse } from 'next/server'
import { importLeads, parseCSV, mapHeaders, ImportRow } from '@/lib/import'
import { validateSession } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import { cookies } from 'next/headers'

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

    // Validate request
    if (!body.csvContent && !body.rows) {
      return NextResponse.json({ error: 'CSV content or rows required' }, { status: 400 })
    }

    let rows: ImportRow[]

    if (body.csvContent) {
      // Parse CSV content
      const parsed = parseCSV(body.csvContent)

      if (parsed.rows.length === 0) {
        return NextResponse.json({ error: 'No data rows found in CSV' }, { status: 400 })
      }

      // Map headers
      const headerMapping = body.headerMapping || mapHeaders(parsed.headers)

      // Transform rows using header mapping
      rows = parsed.rows.map((row) => {
        const importRow: ImportRow = {}

        for (const [originalHeader, field] of Object.entries(headerMapping)) {
          if (field && row[originalHeader]) {
            ;(importRow as any)[field] = row[originalHeader]
          }
        }

        return importRow
      })
    } else {
      // Use pre-mapped rows
      rows = body.rows
    }

    // Import leads
    const result = await importLeads(rows, {
      skipDuplicates: body.skipDuplicates ?? true,
      defaultSource: body.defaultSource || 'other',
      importedBy: user.id,
    })

    // Log the import action
    await logAudit({
      userId: user.id,
      action: 'import',
      entityType: 'leads',
      newValues: {
        imported: result.imported,
        skipped: result.skipped,
        duplicates: result.duplicates,
        errors: result.errors.length,
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error importing leads:', error)
    return NextResponse.json({ error: 'Failed to import leads' }, { status: 500 })
  }
}

// Preview endpoint for validating CSV before import
export async function PUT(request: NextRequest) {
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

    if (!body.csvContent) {
      return NextResponse.json({ error: 'CSV content required' }, { status: 400 })
    }

    // Parse CSV content
    const parsed = parseCSV(body.csvContent)

    if (parsed.rows.length === 0) {
      return NextResponse.json({ error: 'No data rows found in CSV' }, { status: 400 })
    }

    // Auto-detect header mapping
    const suggestedMapping = mapHeaders(parsed.headers)

    // Return preview data
    return NextResponse.json({
      headers: parsed.headers,
      suggestedMapping,
      rowCount: parsed.rows.length,
      preview: parsed.rows.slice(0, 5), // First 5 rows for preview
    })
  } catch (error) {
    console.error('Error previewing CSV:', error)
    return NextResponse.json({ error: 'Failed to parse CSV' }, { status: 500 })
  }
}
