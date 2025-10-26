'use client'

import { useState, useEffect } from 'react'
import { devapi } from '@/lib/devapi'
import toast from 'react-hot-toast'
import {
  FileText, User, Calendar, Filter, RefreshCw, TrendingUp,
  Shield, Eye, Database, Trash2, Activity
} from 'lucide-react'
import type { AuditLog as BaseAuditLog } from '@/types/api'

interface AuditLog extends BaseAuditLog {
  user?: {
    username: string
    email: string
    role: string
  }
}

export default function AuditLogsTab() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState<string>('')
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('')
  const [period, setPeriod] = useState(30)
  const [showCleanupModal, setShowCleanupModal] = useState(false)
  const [cleanupDays, setCleanupDays] = useState(90)

  useEffect(() => {
    fetchAuditLogs()
    fetchAuditStats()
  }, [actionFilter, entityTypeFilter, period])

  const fetchAuditLogs = async () => {
    setLoading(true)
    try {
      const params: any = { limit: 100 }
      if (actionFilter) params.action = actionFilter
      if (entityTypeFilter) params.entityType = entityTypeFilter

      const response = await devapi.getAuditLogs(params)

      if (response.success && response.data) {
        setLogs(response.data.logs || [])
      } else {
        toast.error('Failed to fetch audit logs')
      }
    } catch (error) {
      toast.error('Error loading audit logs')
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditStats = async () => {
    try {
      const response = await devapi.getAuditStats(period)

      if (response.success && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Error loading audit stats:', error)
    }
  }

  const handleCleanup = async () => {
    try {
      const response = await devapi.cleanupAuditLogs(cleanupDays)

      if (response.success) {
        toast.success(response.message || 'Audit logs cleaned up successfully')
        setShowCleanupModal(false)
        fetchAuditLogs()
        fetchAuditStats()
      } else {
        toast.error('Failed to cleanup audit logs')
      }
    } catch (error) {
      toast.error('Error cleaning up audit logs')
    }
  }

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return <TrendingUp size={16} className="text-green-500" />
      case 'update':
        return <RefreshCw size={16} className="text-blue-500" />
      case 'delete':
        return <Trash2 size={16} className="text-red-500" />
      case 'view':
        return <Eye size={16} className="text-gray-500" />
      case 'login':
        return <Shield size={16} className="text-purple-500" />
      default:
        return <Activity size={16} className="text-gray-400" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'bg-green-900/30 text-green-500 border-green-700'
      case 'update':
        return 'bg-blue-900/30 text-blue-500 border-blue-700'
      case 'delete':
        return 'bg-red-900/30 text-red-500 border-red-700'
      case 'view':
        return 'bg-gray-900/30 text-gray-400 border-gray-700'
      case 'login':
        return 'bg-purple-900/30 text-purple-500 border-purple-700'
      default:
        return 'bg-gray-900/30 text-gray-400 border-gray-700'
    }
  }

  if (loading && logs.length === 0) {
    return (
      <div className="p-6 bg-[#0f0f0f] min-h-screen flex items-center justify-center">
        <div className="text-gray-300">Loading audit logs...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCleanupModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 size={16} />
            Cleanup Old Logs
          </button>
          <button
            onClick={() => {
              fetchAuditLogs()
              fetchAuditStats()
            }}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Logs</p>
                <p className="text-3xl font-bold text-blue-500">{stats.totalLogs || 0}</p>
              </div>
              <FileText size={32} className="text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Last {period} days</p>
          </div>

          <div className="bg-[#1a1a1a] border border-green-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Create Actions</p>
                <p className="text-3xl font-bold text-green-500">{stats.actionStats?.CREATE || 0}</p>
              </div>
              <TrendingUp size={32} className="text-green-500" />
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Update Actions</p>
                <p className="text-3xl font-bold text-blue-500">{stats.actionStats?.UPDATE || 0}</p>
              </div>
              <RefreshCw size={32} className="text-blue-500" />
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-red-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Delete Actions</p>
                <p className="text-3xl font-bold text-red-500">{stats.actionStats?.DELETE || 0}</p>
              </div>
              <Trash2 size={32} className="text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-[#1a1a1a] border border-gray-800 rounded text-white"
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="VIEW">View</option>
            <option value="LOGIN">Login</option>
          </select>
        </div>

        <select
          value={entityTypeFilter}
          onChange={(e) => setEntityTypeFilter(e.target.value)}
          className="px-3 py-2 bg-[#1a1a1a] border border-gray-800 rounded text-white"
        >
          <option value="">All Entity Types</option>
          <option value="JOB">Job</option>
          <option value="DRIVER">Driver</option>
          <option value="DOCUMENT">Document</option>
          <option value="SETTINGS">Settings</option>
          <option value="USER">User</option>
        </select>

        <select
          value={period}
          onChange={(e) => setPeriod(parseInt(e.target.value))}
          className="px-3 py-2 bg-[#1a1a1a] border border-gray-800 rounded text-white"
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
          <option value={365}>Last Year</option>
        </select>
      </div>

      {/* Audit Logs List */}
      {logs.length === 0 ? (
        <div className="text-center py-12 bg-[#1a1a1a] border border-gray-800 rounded-lg">
          <FileText size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">No audit logs found</p>
          <p className="text-sm text-gray-500 mt-1">No activity has been logged yet</p>
        </div>
      ) : (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-[#0f0f0f]">
                  <th className="px-4 py-3 text-left text-sm text-gray-400">Action</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-400">Entity</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-400">User</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-400">Timestamp</th>
                  <th className="px-4 py-3 text-left text-sm text-gray-400">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={idx} className="border-b border-gray-800 hover:bg-[#0f0f0f]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className={`px-2 py-1 text-xs font-semibold rounded border ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Database size={14} className="text-gray-500" />
                        <span>{log.entityType}</span>
                        {log.entityId && (
                          <span className="text-xs text-gray-500">#{log.entityId.substring(0, 8)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-500" />
                        <div>
                          <p className="text-white text-sm">{log.user?.username || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{log.user?.role || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar size={14} />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {log.changes && Object.keys(log.changes).length > 0 ? (
                        <details className="cursor-pointer">
                          <summary className="text-xs text-blue-500 hover:text-blue-400">
                            View Changes
                          </summary>
                          <pre className="text-xs text-gray-400 mt-2 p-2 bg-[#0f0f0f] rounded max-w-xs overflow-auto">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-xs text-gray-600">No changes</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cleanup Modal */}
      {showCleanupModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-white font-bold">Cleanup Old Audit Logs</h2>
              <button
                onClick={() => setShowCleanupModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-300 mb-4">
                This will permanently delete audit logs older than the specified number of days.
              </p>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Days to Keep</label>
                <input
                  type="number"
                  value={cleanupDays}
                  onChange={(e) => setCleanupDays(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                  min="7"
                  max="365"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Logs older than {cleanupDays} days will be deleted
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-gray-800">
              <button
                onClick={() => setShowCleanupModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCleanup}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Cleanup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
