'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSiteSettings } from '@/components/providers/SiteSettingsProvider'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  category: 'follow_up' | 'showing' | 'offer' | 'closing' | 'other'
  createdBy: string | null
  createdByName?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'showing', label: 'Showing' },
  { value: 'offer', label: 'Offer' },
  { value: 'closing', label: 'Closing' },
  { value: 'other', label: 'Other' },
]

const categoryLabels: Record<string, string> = {
  follow_up: 'Follow-up',
  showing: 'Showing',
  offer: 'Offer',
  closing: 'Closing',
  other: 'Other',
}

const categoryColors: Record<string, string> = {
  follow_up: 'bg-blue-100 text-blue-700',
  showing: 'bg-purple-100 text-purple-700',
  offer: 'bg-orange-100 text-orange-700',
  closing: 'bg-green-100 text-green-700',
  other: 'bg-gray-100 text-gray-700',
}

// Sample lead data for preview (agent data comes from settings)
const sampleLeadData = {
  name: 'John Smith',
  email: 'john@example.com',
  phone: '(555) 123-4567',
}

function createApplyMergeFields(agentName: string, agentEmail: string, agentPhone: string) {
  return function applyMergeFields(text: string): string {
    let result = text
    result = result.replace(/\{\{lead\.name\}\}/g, sampleLeadData.name)
    result = result.replace(/\{\{lead\.email\}\}/g, sampleLeadData.email)
    result = result.replace(/\{\{lead\.phone\}\}/g, sampleLeadData.phone)
    result = result.replace(/\{\{agent\.name\}\}/g, agentName)
    result = result.replace(/\{\{agent\.email\}\}/g, agentEmail)
    result = result.replace(/\{\{agent\.phone\}\}/g, agentPhone)
    return result
  }
}

export default function TemplatesPage() {
  const { settings } = useSiteSettings()
  const applyMergeFields = createApplyMergeFields(
    settings.realtor_name,
    settings.realtor_email,
    settings.realtor_phone
  )

  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Form state
  const [form, setForm] = useState({
    name: '',
    subject: '',
    body: '',
    category: 'follow_up' as EmailTemplate['category'],
  })

  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [categoryFilter])

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`/api/templates?category=${categoryFilter}`)
      if (res.ok) {
        const data = await res.json()
        setTemplates(data)
      }
    } catch (err) {
      setError('Failed to load templates')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setForm({
      name: '',
      subject: '',
      body: '',
      category: 'follow_up',
    })
    setShowPreview(false)
    setShowModal(true)
  }

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template)
    setForm({
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: template.category,
    })
    setShowPreview(false)
    setShowModal(true)
  }

  const handleDelete = async (template: EmailTemplate) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) return

    try {
      const res = await fetch(`/api/templates/${template.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete template')
      }

      setSuccess('Template deleted successfully')
      setTimeout(() => setSuccess(''), 3000)
      fetchTemplates()
    } catch (err: any) {
      setError(err.message)
      setTimeout(() => setError(''), 5000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const url = editingTemplate ? `/api/templates/${editingTemplate.id}` : '/api/templates'
      const method = editingTemplate ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save template')
      }

      setSuccess(editingTemplate ? 'Template updated successfully' : 'Template created successfully')
      setTimeout(() => setSuccess(''), 3000)
      setShowModal(false)
      fetchTemplates()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = async (template: EmailTemplate) => {
    const text = `Subject: ${applyMergeFields(template.subject)}\n\n${applyMergeFields(template.body)}`
    await navigator.clipboard.writeText(text)
    setSuccess('Template copied to clipboard!')
    setTimeout(() => setSuccess(''), 3000)
  }

  const insertMergeField = (field: string) => {
    const textarea = document.getElementById('template-body') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newBody = form.body.substring(0, start) + field + form.body.substring(end)
      setForm({ ...form, body: newBody })
      // Restore focus and cursor position
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + field.length, start + field.length)
      }, 0)
    }
  }

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading templates...</p>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
        <p className="text-gray-600 mt-1">Manage email templates for lead communication</p>
      </div>

      {/* Settings Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/admin/settings"
          className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50"
        >
          General
        </Link>
        <Link
          href="/admin/settings/templates"
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium"
        >
          Email Templates
        </Link>
        <Link
          href="/admin/settings/audit-log"
          className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50"
        >
          Audit Log
        </Link>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 text-green-600 p-4 rounded-lg">{success}</div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
        >
          + New Template
        </button>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No templates</h3>
          <p className="mt-2 text-gray-500">Get started by creating your first email template.</p>
          <button
            onClick={handleCreate}
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
          >
            Create Template
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[template.category]}`}
                    >
                      {categoryLabels[template.category]}
                    </span>
                    {template.isDefault && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Subject:</span> {template.subject}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-2">{template.body}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => copyToClipboard(template)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Copy to clipboard"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(template)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Merge Fields Reference */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Merge Fields</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Lead Fields</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><code className="bg-gray-100 px-1 rounded">{'{{lead.name}}'}</code> - Lead's name</p>
              <p><code className="bg-gray-100 px-1 rounded">{'{{lead.email}}'}</code> - Lead's email</p>
              <p><code className="bg-gray-100 px-1 rounded">{'{{lead.phone}}'}</code> - Lead's phone</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Agent Fields</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><code className="bg-gray-100 px-1 rounded">{'{{agent.name}}'}</code> - Agent's name</p>
              <p><code className="bg-gray-100 px-1 rounded">{'{{agent.email}}'}</code> - Agent's email</p>
              <p><code className="bg-gray-100 px-1 rounded">{'{{agent.phone}}'}</code> - Agent's phone</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingTemplate ? 'Edit Template' : 'Create Template'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Preview Toggle */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setShowPreview(false)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    !showPreview ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    showPreview ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Preview
                </button>
              </div>

              {showPreview ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <div className="p-4 bg-gray-50 rounded-lg">{applyMergeFields(form.subject)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                    <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap font-mono text-sm">
                      {applyMergeFields(form.body)}
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Template Name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., Initial Follow-up"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) =>
                          setForm({ ...form, category: e.target.value as EmailTemplate['category'] })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="follow_up">Follow-up</option>
                        <option value="showing">Showing</option>
                        <option value="offer">Offer</option>
                        <option value="closing">Closing</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Line *
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g., Thanks for reaching out, {{lead.name}}!"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Email Body *
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Insert:</span>
                        <button
                          type="button"
                          onClick={() => insertMergeField('{{lead.name}}')}
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          Lead Name
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMergeField('{{agent.name}}')}
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          Agent Name
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMergeField('{{agent.phone}}')}
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          Agent Phone
                        </button>
                      </div>
                    </div>
                    <textarea
                      id="template-body"
                      value={form.body}
                      onChange={(e) => setForm({ ...form, body: e.target.value })}
                      rows={12}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                      placeholder="Write your email template here..."
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : editingTemplate ? 'Save Changes' : 'Create Template'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
