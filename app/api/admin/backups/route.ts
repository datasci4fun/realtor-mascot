import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { verifySession } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
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

    // Only admins can download backups
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

    // Get all data
    const [
      leadsResult,
      notesResult,
      conversationsResult,
      tasksResult,
      templatesResult,
      usersResult,
    ] = await Promise.all([
      pool.query(`SELECT * FROM leads ORDER BY created_at DESC`),
      pool.query(`SELECT * FROM lead_notes ORDER BY created_at DESC`),
      pool.query(`SELECT * FROM lead_conversations ORDER BY created_at DESC`),
      pool.query(`SELECT * FROM tasks ORDER BY created_at DESC`),
      pool.query(`SELECT * FROM email_templates ORDER BY created_at DESC`),
      pool.query(`SELECT id, email, name, role, phone, is_active, created_at, last_login FROM admin_users ORDER BY created_at DESC`),
    ])

    const backup = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      createdBy: user.email,
      tables: {
        leads: {
          count: leadsResult.rows.length,
          data: leadsResult.rows,
        },
        lead_notes: {
          count: notesResult.rows.length,
          data: notesResult.rows,
        },
        lead_conversations: {
          count: conversationsResult.rows.length,
          data: conversationsResult.rows,
        },
        tasks: {
          count: tasksResult.rows.length,
          data: tasksResult.rows,
        },
        email_templates: {
          count: templatesResult.rows.length,
          data: templatesResult.rows,
        },
        admin_users: {
          count: usersResult.rows.length,
          data: usersResult.rows,
        },
      },
      summary: {
        totalLeads: leadsResult.rows.length,
        totalNotes: notesResult.rows.length,
        totalConversations: conversationsResult.rows.length,
        totalTasks: tasksResult.rows.length,
        totalTemplates: templatesResult.rows.length,
        totalUsers: usersResult.rows.length,
      },
    }

    // Log the backup action
    await logAudit({
      userId: user.id,
      action: 'export',
      entityType: 'backup',
      newValues: backup.summary,
    })

    const filename = `backup-${new Date().toISOString().split('T')[0]}`

    if (format === 'json') {
      return new NextResponse(JSON.stringify(backup, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}.json"`,
        },
      })
    } else {
      // Simple SQL-like format (for reference)
      let sqlContent = `-- Database Backup\n-- Created: ${backup.createdAt}\n-- Created by: ${backup.createdBy}\n\n`

      // Leads
      sqlContent += `-- LEADS (${leadsResult.rows.length} rows)\n`
      for (const lead of leadsResult.rows) {
        sqlContent += `INSERT INTO leads (id, name, email, phone, intent, timeline, budget, message, source, status, priority, assigned_to, created_at, updated_at) VALUES ('${lead.id}', '${(lead.name || '').replace(/'/g, "''")}', '${lead.email}', '${lead.phone || ''}', '${lead.intent || ''}', '${lead.timeline || ''}', '${lead.budget || ''}', '${(lead.message || '').replace(/'/g, "''")}', '${lead.source || ''}', '${lead.status || 'new'}', '${lead.priority || 'normal'}', ${lead.assigned_to ? `'${lead.assigned_to}'` : 'NULL'}, '${lead.created_at}', '${lead.updated_at}');\n`
      }

      sqlContent += `\n-- TASKS (${tasksResult.rows.length} rows)\n`
      for (const task of tasksResult.rows) {
        sqlContent += `INSERT INTO tasks (id, title, description, lead_id, assigned_to, created_by, due_date, priority, status, completed_at, created_at, updated_at) VALUES ('${task.id}', '${(task.title || '').replace(/'/g, "''")}', '${(task.description || '').replace(/'/g, "''")}', ${task.lead_id ? `'${task.lead_id}'` : 'NULL'}, '${task.assigned_to}', '${task.created_by}', ${task.due_date ? `'${task.due_date}'` : 'NULL'}, '${task.priority || 'normal'}', '${task.status || 'pending'}', ${task.completed_at ? `'${task.completed_at}'` : 'NULL'}, '${task.created_at}', '${task.updated_at}');\n`
      }

      return new NextResponse(sqlContent, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${filename}.sql"`,
        },
      })
    }
  } catch (error) {
    console.error('Error creating backup:', error)
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 })
  }
}

// Get backup statistics
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

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // Get statistics
    const [leads, notes, conversations, tasks, templates, users] = await Promise.all([
      pool.query(`SELECT COUNT(*) as count FROM leads`),
      pool.query(`SELECT COUNT(*) as count FROM lead_notes`),
      pool.query(`SELECT COUNT(*) as count FROM lead_conversations`),
      pool.query(`SELECT COUNT(*) as count FROM tasks`),
      pool.query(`SELECT COUNT(*) as count FROM email_templates`),
      pool.query(`SELECT COUNT(*) as count FROM admin_users`),
    ])

    // Estimate size (rough calculation)
    const estimatedSize =
      parseInt(leads.rows[0].count) * 500 +
      parseInt(notes.rows[0].count) * 200 +
      parseInt(conversations.rows[0].count) * 300 +
      parseInt(tasks.rows[0].count) * 300 +
      parseInt(templates.rows[0].count) * 1000 +
      parseInt(users.rows[0].count) * 200

    return NextResponse.json({
      statistics: {
        leads: parseInt(leads.rows[0].count),
        notes: parseInt(notes.rows[0].count),
        conversations: parseInt(conversations.rows[0].count),
        tasks: parseInt(tasks.rows[0].count),
        templates: parseInt(templates.rows[0].count),
        users: parseInt(users.rows[0].count),
      },
      estimatedSize: formatBytes(estimatedSize),
    })
  } catch (error) {
    console.error('Error getting backup stats:', error)
    return NextResponse.json({ error: 'Failed to get backup statistics' }, { status: 500 })
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
