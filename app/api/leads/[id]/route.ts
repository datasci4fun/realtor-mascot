import { NextRequest, NextResponse } from 'next/server'
import { getLeadById, updateLead, deleteLead, getLeadNotes, addLeadNote, getConversationHistory } from '@/lib/leads'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const lead = await getLeadById(params.id)

  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  const notes = await getLeadNotes(params.id)
  const conversation = await getConversationHistory(params.id)

  return NextResponse.json({
    lead,
    notes,
    conversation,
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const updates = await request.json()

  const success = await updateLead(params.id, updates)

  if (!success) {
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 400 })
  }

  // If status changed, add a system note
  if (updates.status) {
    await addLeadNote(params.id, `Status changed to ${updates.status}`, 'system', user.email)
  }

  const lead = await getLeadById(params.id)

  return NextResponse.json({ success: true, lead })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const success = await deleteLead(params.id)

  if (!success) {
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
