'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lead, ConversationMessage, LeadNote } from '@/types/lead'
import { AdminUser } from '@/types/user'
import SetReminderButton from '@/components/admin/SetReminderButton'

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [notes, setNotes] = useState<LeadNote[]>([])
  const [conversation, setConversation] = useState<ConversationMessage[]>([])
  const [agents, setAgents] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [noteType, setNoteType] = useState<'note' | 'call' | 'email' | 'meeting' | 'showing'>('note')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchLead()
    fetchAgents()
  }, [params.id])

  const fetchLead = async () => {
    try {
      const res = await fetch(`/api/leads/${params.id}`)

      if (res.status === 401) {
        window.location.href = '/admin/login'
        return
      }

      if (res.status === 404) {
        router.push('/admin/leads')
        return
      }

      const data = await res.json()
      setLead(data.lead)
      setNotes(data.notes || [])
      setConversation(data.conversation || [])
    } catch (error) {
      console.error('Failed to fetch lead:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/admin/users?isActive=true')
      if (res.ok) {
        const data = await res.json()
        setAgents(data.users || [])
      }
    } catch (error) {
      // Ignore - agents dropdown will just be empty
    }
  }

  const updateStatus = async (status: string) => {
    setIsSaving(true)
    try {
      await fetch(`/api/leads/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      fetchLead()
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updatePriority = async (priority: string) => {
    setIsSaving(true)
    try {
      await fetch(`/api/leads/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      })
      fetchLead()
    } catch (error) {
      console.error('Failed to update priority:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateAssignment = async (assignedTo: string) => {
    setIsSaving(true)
    try {
      await fetch(`/api/leads/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: assignedTo || null }),
      })
      fetchLead()
    } catch (error) {
      console.error('Failed to update assignment:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const addNote = async () => {
    if (!newNote.trim()) return

    setIsSaving(true)
    try {
      await fetch(`/api/leads/${params.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote, noteType }),
      })
      setNewNote('')
      fetchLead()
    } catch (error) {
      console.error('Failed to add note:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700 border-blue-200',
    contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    qualified: 'bg-purple-100 text-purple-700 border-purple-200',
    showing: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    offer: 'bg-orange-100 text-orange-700 border-orange-200',
    closed: 'bg-green-100 text-green-700 border-green-200',
    lost: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  const noteTypeIcons: Record<string, string> = {
    note: '📝',
    call: '📞',
    email: '✉️',
    meeting: '🤝',
    showing: '🏠',
    system: '🤖',
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-gray-500">Loading lead...</p>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-gray-500">Lead not found</p>
      </div>
    )
  }

  const assignedAgent = agents.find((a) => a.id === lead.assignedTo)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/leads" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
          ← Back to all leads
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {lead.name || 'No name'}
            </h1>
            <p className="text-gray-600">{lead.email}</p>
            {lead.phone && <p className="text-gray-500">{lead.phone}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Agent Assignment */}
            <select
              value={lead.assignedTo || ''}
              onChange={(e) => updateAssignment(e.target.value)}
              disabled={isSaving}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name || agent.email}
                </option>
              ))}
            </select>

            <select
              value={lead.priority || 'normal'}
              onChange={(e) => updatePriority(e.target.value)}
              disabled={isSaving}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="low">Low Priority</option>
              <option value="normal">Normal Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
            <select
              value={lead.status || 'new'}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={isSaving}
              className={`px-3 py-2 border rounded-lg text-sm font-medium ${statusColors[lead.status || 'new']}`}
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="showing">Showing</option>
              <option value="offer">Offer</option>
              <option value="closed">Closed</option>
              <option value="lost">Lost</option>
            </select>
            <SetReminderButton leadId={lead.id!} onSuccess={() => fetchLead()} />
          </div>
        </div>

        {/* Assignment badge */}
        {assignedAgent && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium">
              {assignedAgent.name ? assignedAgent.name.charAt(0).toUpperCase() : assignedAgent.email.charAt(0).toUpperCase()}
            </div>
            <span>Assigned to <strong>{assignedAgent.name || assignedAgent.email}</strong></span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Information</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500">Intent</dt>
                <dd className="font-medium capitalize">{(lead.intent || '-').replace(/_/g, ' ')}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Timeline</dt>
                <dd className="font-medium capitalize">{(lead.timeline || '-').replace(/_/g, ' ')}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Budget</dt>
                <dd className="font-medium">{lead.budget || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Pre-Approved</dt>
                <dd className="font-medium">{lead.preApproved ? 'Yes' : 'No'}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Source</dt>
                <dd className="font-medium capitalize">{(lead.source || '').replace(/_/g, ' ')}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Page</dt>
                <dd className="font-medium">{lead.page || '-'}</dd>
              </div>
              {lead.listingAddress && (
                <div className="col-span-2">
                  <dt className="text-sm text-gray-500">Interested In</dt>
                  <dd className="font-medium">{lead.listingAddress}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-gray-500">Created</dt>
                <dd className="font-medium">
                  {new Date(lead.timestamp).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Last Updated</dt>
                <dd className="font-medium">
                  {lead.updatedAt ? new Date(lead.updatedAt).toLocaleString() : '-'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Conversation History */}
          {conversation.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Chat Conversation</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {conversation.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-primary-200' : 'text-gray-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Note */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Note</h2>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {(['note', 'call', 'email', 'meeting', 'showing'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setNoteType(type)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      noteType === type
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {noteTypeIcons[type]} {type}
                  </button>
                ))}
              </div>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this lead..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none"
              />
              <button
                onClick={addNote}
                disabled={isSaving || !newNote.trim()}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Add Note'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Activity Log */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h2>
            {notes.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="border-l-2 border-gray-200 pl-4 py-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span>{noteTypeIcons[note.noteType]}</span>
                      <span className="font-medium capitalize">{note.noteType}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{note.note}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {note.createdBy && `${note.createdBy} • `}
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No activity yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Metadata (collapsible) */}
      <details className="mt-8 bg-white rounded-xl shadow-sm">
        <summary className="px-6 py-4 cursor-pointer text-sm text-gray-500 hover:text-gray-700">
          Technical Details
        </summary>
        <div className="px-6 pb-4">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Lead ID</dt>
              <dd className="font-mono text-xs">{lead.id}</dd>
            </div>
            <div>
              <dt className="text-gray-500">User Agent</dt>
              <dd className="font-mono text-xs truncate">{lead.userAgent || '-'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Referrer</dt>
              <dd className="font-mono text-xs truncate">{lead.referrer || '-'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">UTM Source</dt>
              <dd className="font-mono text-xs">{lead.utmSource || '-'}</dd>
            </div>
          </dl>
        </div>
      </details>
    </div>
  )
}
