'use client'

import { useState, useEffect } from 'react'
import { devapi } from '@/lib/devapi'
import toast from 'react-hot-toast'
import {
  AlertTriangle, AlertCircle, Info, XCircle, CheckCircle,
  Eye, Code, Smartphone, X, Calendar, RefreshCw
} from 'lucide-react'
import type { ErrorLog } from '@/types/api'

export default function ErrorLogsTab() {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [severityFilter, setSeverityFilter] = useState<string>('')
  const [resolvedFilter, setResolvedFilter] = useState<string>('unresolved')
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchErrorLogs()
  }, [severityFilter, resolvedFilter])

  const fetchErrorLogs = async () => {
    setLoading(true)
    try {
      const params: any = { limit: 100 }
      if (severityFilter) params.severity = severityFilter
      if (resolvedFilter === 'resolved') params.resolved = true
      else if (resolvedFilter === 'unresolved') params.resolved = false

      const response = await devapi.getErrorLogs(params)

      if (response.success && response.data) {
        setLogs(response.data)
      } else {
        toast.error('Failed to fetch error logs')
      }
    } catch (err) {
      console.error('Error fetching error logs:', err)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (errorId: number) => {
    try {
      const response = await devapi.resolveError(errorId.toString())

      if (response.success) {
        toast.success('Error marked as resolved')
        fetchErrorLogs()
        if (selectedError?.id === errorId) {
          setShowModal(false)
          setSelectedError(null)
        }
      } else {
        toast.error('Failed to resolve error')
      }
    } catch (err) {
      console.error('Error resolving error log:', err)
      toast.error('An unexpected error occurred. Please try again.')
    }
  }

  const viewErrorDetail = (error: ErrorLog) => {
    setSelectedError(error)
    setShowModal(true)
  }

  const getSeverityIcon = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return <XCircle size={18} className="text-red-500" />
      case 'high':
        return <AlertCircle size={18} className="text-orange-500" />
      case 'medium':
        return <AlertTriangle size={18} className="text-yellow-500" />
      case 'low':
        return <Info size={18} className="text-blue-500" />
      default:
        return <Info size={18} className="text-gray-500" />
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-900/30 text-red-500 border-red-700'
      case 'high':
        return 'bg-orange-900/30 text-orange-500 border-orange-700'
      case 'medium':
        return 'bg-yellow-900/30 text-yellow-500 border-yellow-700'
      case 'low':
        return 'bg-blue-900/30 text-blue-500 border-blue-700'
      default:
        return 'bg-gray-900/30 text-gray-500 border-gray-700'
    }
  }

  const groupedErrors = logs.reduce((acc, log) => {
    const key = log.errorMessage.substring(0, 100) // Group by first 100 chars
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(log)
    return acc
  }, {} as Record<string, ErrorLog[]>)

  const unresolvedCount = logs.filter(l => !l.resolved).length
  const resolvedCount = logs.filter(l => l.resolved).length
  const criticalCount = logs.filter(l => l.severity?.toLowerCase() === 'critical' && !l.resolved).length

  if (loading) {
    return (
      <div className="p-6 bg-[#0f0f0f] min-h-screen flex items-center justify-center">
        <div className="text-gray-300">Loading error logs...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Error Logs</h1>
        <button
          onClick={() => fetchErrorLogs()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1a1a1a] border border-yellow-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Unresolved</p>
              <p className="text-3xl font-bold text-yellow-500">{unresolvedCount}</p>
            </div>
            <AlertTriangle size={32} className="text-yellow-500" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Critical</p>
              <p className="text-3xl font-bold text-red-500">{criticalCount}</p>
            </div>
            <XCircle size={32} className="text-red-500" />
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
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 bg-[#1a1a1a] border border-gray-800 rounded text-white"
        >
          <option value="">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <select
          value={resolvedFilter}
          onChange={(e) => setResolvedFilter(e.target.value)}
          className="px-3 py-2 bg-[#1a1a1a] border border-gray-800 rounded text-white"
        >
          <option value="">All Status</option>
          <option value="unresolved">Unresolved Only</option>
          <option value="resolved">Resolved Only</option>
        </select>
      </div>

      {/* Error List */}
      {logs.length === 0 ? (
        <div className="text-center py-12 bg-[#1a1a1a] border border-gray-800 rounded-lg">
          <CheckCircle size={48} className="mx-auto text-green-600 mb-3" />
          <p className="text-gray-400">No errors found</p>
          <p className="text-sm text-gray-500 mt-1">
            {resolvedFilter === 'unresolved' ? 'No unresolved errors' : 'No error logs available'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedErrors).map(([key, errors]) => {
            const latestError = errors[0]
            const count = errors.length

            return (
              <div
                key={key}
                className={`p-4 rounded-lg border ${getSeverityColor(latestError.severity)} cursor-pointer hover:opacity-80`}
                onClick={() => viewErrorDetail(latestError)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getSeverityIcon(latestError.severity)}
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        latestError.resolved
                          ? 'bg-green-900/30 text-green-500'
                          : 'bg-yellow-900/30 text-yellow-500'
                      }`}>
                        {latestError.resolved ? 'RESOLVED' : 'UNRESOLVED'}
                      </span>
                      {count > 1 && (
                        <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-900/30 text-blue-500">
                          {count}x occurrences
                        </span>
                      )}
                    </div>

                    <p className="text-white font-medium mb-2">{latestError.errorMessage}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(latestError.createdAt).toLocaleString()}</span>
                      </div>
                      {latestError.appVersion && (
                        <div className="flex items-center gap-1">
                          <Code size={14} />
                          <span>v{latestError.appVersion}</span>
                        </div>
                      )}
                      {latestError.deviceInfo && (
                        <div className="flex items-center gap-1">
                          <Smartphone size={14} />
                          <span>{latestError.deviceInfo.platform || 'Mobile'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      viewErrorDetail(latestError)
                    }}
                    className="ml-4 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Eye size={16} />
                    View
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Error Detail Modal */}
      {showModal && selectedError && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-white font-bold flex items-center gap-2">
                {getSeverityIcon(selectedError.severity)}
                Error Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Error Message */}
              <div>
                <h3 className="text-white font-medium mb-2">Error Message</h3>
                <p className="text-gray-300 bg-[#0f0f0f] p-3 rounded border border-gray-800">
                  {selectedError.errorMessage}
                </p>
              </div>

              {/* Stack Trace */}
              {selectedError.stackTrace && (
                <div>
                  <h3 className="text-white font-medium mb-2">Stack Trace</h3>
                  <pre className="text-gray-300 bg-[#0f0f0f] p-3 rounded border border-gray-800 overflow-x-auto text-xs">
                    {selectedError.stackTrace}
                  </pre>
                </div>
              )}

              {/* Device Info */}
              {selectedError.deviceInfo && (
                <div>
                  <h3 className="text-white font-medium mb-2">Device Information</h3>
                  <div className="bg-[#0f0f0f] p-3 rounded border border-gray-800">
                    <pre className="text-gray-300 text-xs">
                      {JSON.stringify(selectedError.deviceInfo, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Severity</p>
                  <p className="text-white flex items-center gap-2">
                    {getSeverityIcon(selectedError.severity)}
                    {selectedError.severity || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">App Version</p>
                  <p className="text-white">{selectedError.appVersion || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Timestamp</p>
                  <p className="text-white">{new Date(selectedError.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">User ID</p>
                  <p className="text-white">{selectedError.userId}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-gray-800">
              {!selectedError.resolved && (
                <button
                  onClick={() => handleResolve(selectedError.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  Mark as Resolved
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
