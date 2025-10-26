'use client'

import { useState, useEffect } from 'react'
import { devapi } from '@/lib/devapi'
import toast from 'react-hot-toast'
import {
  AlertCircle, CheckCircle, Clock, Eye, X,
  MessageSquare, User, Calendar, Tag, Flag, RefreshCw
} from 'lucide-react'
import type { ReportedIssue } from '@/types/api'

export default function UserIssuesTab() {
  const [issues, setIssues] = useState<ReportedIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [selectedIssue, setSelectedIssue] = useState<ReportedIssue | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    const user = devapi.getUser()
    if (user) {
      setUserRole(user.role)
    }
    fetchIssues()
  }, [statusFilter, categoryFilter, priorityFilter])

  const fetchIssues = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (statusFilter) params.status = statusFilter
      if (categoryFilter) params.category = categoryFilter
      if (priorityFilter) params.priority = priorityFilter

      const response = await devapi.getIssues(params)

      if (response.success && response.data) {
        setIssues(response.data)
      } else {
        toast.error('Failed to fetch issues')
      }
    } catch (err) {
      console.error('Error fetching issues:', err)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const viewIssueDetail = (issue: ReportedIssue) => {
    setSelectedIssue(issue)
    setAdminNotes(issue.adminNotes || '')
    setAssignedTo(issue.assignedTo || '')
    setShowModal(true)
  }

  const handleUpdateIssue = async (status?: string) => {
    if (!selectedIssue) return

    try {
      const updateData: any = {}
      if (status) updateData.status = status
      if (adminNotes) updateData.adminNotes = adminNotes
      if (assignedTo) updateData.assignedTo = assignedTo

      const response = await devapi.updateIssue(selectedIssue.id.toString(), updateData)

      if (response.success) {
        toast.success('Issue updated successfully')
        setShowModal(false)
        fetchIssues()
      } else {
        toast.error('Failed to update issue')
      }
    } catch (err) {
      console.error('Error updating issue:', err)
      toast.error('An unexpected error occurred. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'bg-green-900/30 text-green-500 border-green-700'
      case 'in_progress':
        return 'bg-yellow-900/30 text-yellow-500 border-yellow-700'
      default:
        return 'bg-gray-900/30 text-gray-400 border-gray-700'
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'text-red-500'
      case 'high':
        return 'text-orange-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-blue-500'
      default:
        return 'text-gray-500'
    }
  }

  const newCount = issues.filter(i => i.status === 'new').length
  const inProgressCount = issues.filter(i => i.status === 'in_progress').length
  const resolvedCount = issues.filter(i => i.status === 'resolved').length

  if (loading) {
    return (
      <div className="p-6 bg-[#0f0f0f] min-h-screen flex items-center justify-center">
        <div className="text-gray-300">Loading issues...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">User Reported Issues</h1>
        <button
          onClick={() => fetchIssues()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">New</p>
              <p className="text-3xl font-bold text-gray-400">{newCount}</p>
            </div>
            <AlertCircle size={32} className="text-gray-400" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-yellow-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">In Progress</p>
              <p className="text-3xl font-bold text-yellow-500">{inProgressCount}</p>
            </div>
            <Clock size={32} className="text-yellow-500" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Resolved</p>
              <p className="text-3xl font-bold text-green-500">{resolvedCount}</p>
            </div>
            <CheckCircle size={32} className="text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-[#1a1a1a] border border-gray-800 rounded text-white"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-[#1a1a1a] border border-gray-800 rounded text-white"
        >
          <option value="">All Categories</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature Request</option>
          <option value="support">Support</option>
          <option value="other">Other</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 bg-[#1a1a1a] border border-gray-800 rounded text-white"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Issue List */}
      {issues.length === 0 ? (
        <div className="text-center py-12 bg-[#1a1a1a] border border-gray-800 rounded-lg">
          <CheckCircle size={48} className="mx-auto text-green-600 mb-3" />
          <p className="text-gray-400">No issues found</p>
          <p className="text-sm text-gray-500 mt-1">All reported issues have been addressed</p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className={`p-4 rounded-lg border ${getStatusColor(issue.status)} cursor-pointer hover:opacity-80`}
              onClick={() => viewIssueDetail(issue)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded border ${getStatusColor(issue.status)}`}>
                      {issue.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {issue.category && (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-900/30 text-blue-500">
                        {issue.category}
                      </span>
                    )}
                    {issue.priority && (
                      <div className={`flex items-center gap-1 ${getPriorityColor(issue.priority)}`}>
                        <Flag size={14} />
                        <span className="text-xs font-semibold">{issue.priority.toUpperCase()}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-white font-medium mb-2">{issue.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{new Date(issue.reportedAt).toLocaleString()}</span>
                    </div>
                    {issue.assignedTo && (
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>Assigned to: {issue.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    viewIssueDetail(issue)
                  }}
                  className="ml-4 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                >
                  <Eye size={16} />
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Issue Detail Modal */}
      {showModal && selectedIssue && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-white font-bold">Issue #{selectedIssue.id}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Description */}
              <div>
                <h3 className="text-white font-medium mb-2">Description</h3>
                <p className="text-gray-300 bg-[#0f0f0f] p-3 rounded border border-gray-800">
                  {selectedIssue.description}
                </p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <p className="text-white">{selectedIssue.status.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Category</p>
                  <p className="text-white">{selectedIssue.category || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Priority</p>
                  <p className={`font-medium ${getPriorityColor(selectedIssue.priority)}`}>
                    {selectedIssue.priority?.toUpperCase() || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Reported At</p>
                  <p className="text-white">{new Date(selectedIssue.reportedAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Admin Section (Admin Only) */}
              {userRole === 'ADMIN' && (
                <>
                  <div className="pt-4 border-t border-gray-800">
                    <h3 className="text-white font-medium mb-3">Admin Actions</h3>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Assign To</label>
                        <input
                          type="text"
                          value={assignedTo}
                          onChange={(e) => setAssignedTo(e.target.value)}
                          placeholder="Staff member name"
                          className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Admin Notes</label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="Add internal notes..."
                          rows={3}
                          className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {selectedIssue.adminNotes && selectedIssue.adminNotes !== adminNotes && (
                    <div>
                      <h3 className="text-white font-medium mb-2">Previous Notes</h3>
                      <p className="text-gray-300 bg-[#0f0f0f] p-3 rounded border border-gray-800 text-sm">
                        {selectedIssue.adminNotes}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            {userRole === 'ADMIN' && (
              <div className="flex justify-end gap-2 p-4 border-t border-gray-800">
                {selectedIssue.status !== 'in_progress' && (
                  <button
                    onClick={() => handleUpdateIssue('in_progress')}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 flex items-center gap-2"
                  >
                    <Clock size={18} />
                    Mark In Progress
                  </button>
                )}
                {selectedIssue.status !== 'resolved' && (
                  <button
                    onClick={() => handleUpdateIssue('resolved')}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Mark Resolved
                  </button>
                )}
                <button
                  onClick={() => handleUpdateIssue()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Notes
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
