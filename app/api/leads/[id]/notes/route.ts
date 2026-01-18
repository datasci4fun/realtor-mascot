import { NextRequest, NextResponse } from 'next/server'
import { addLeadNote, getLeadNotes } from '@/lib/leads'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const notes = await getLeadNotes(params.id)

  return NextResponse.json({ notes })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { note, noteType } = await request.json()

  if (!note) {
    return NextResponse.json({ error: 'Note content is required' }, { status: 400 })
  }

  const noteId = await addLeadNote(params.id, note, noteType || 'note', user.email)

  return NextResponse.json({
    success: true,
    noteId,
  })
}
