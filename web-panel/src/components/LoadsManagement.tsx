'use client'

import { useState, useEffect, useCallback } from 'react'
import { devapi } from '@/lib/devapi'
import toast from 'react-hot-toast'
import type { Job } from '@/types/api'

export default function LoadsManagement() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(25)

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      const response = await devapi.getJobs()

      if (response.success && response.data) {
        setJobs(response.data)
        setError(null)
      } else {
        setError(response.error || 'Failed to fetch jobs')
        toast.error('Failed to fetch jobs')
      }
    } catch (err) {
      setError('An error occurred while fetching jobs')
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleStatusChange = async (jobId: string | number, newStatus: string) => {
    try {
      const response = await devapi.updateJobStatus(jobId.toString(), newStatus)
      if (response.success) {
        toast.success('Job status updated')
        fetchJobs()
      } else {
        toast.error('Failed to update job status')
      }
    } catch (err) {
      console.error('Error updating job status:', err)
      toast.error('An unexpected error occurred. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-900/30 text-green-500'
      case 'in_progress': return 'bg-blue-900/30 text-blue-500'
      case 'assigned': return 'bg-yellow-900/30 text-yellow-500'
      case 'pending': return 'bg-gray-900/30 text-gray-400'
      case 'cancelled': return 'bg-red-900/30 text-red-500'
      default: return 'bg-gray-900/30 text-gray-400'
    }
  }

  const filteredJobs = statusFilter
    ? jobs.filter(job => job.status?.toLowerCase() === statusFilter.toLowerCase())
    : jobs

  // Pagination logic
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex)

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter])

  if (loading) {
    return (
      <div className="p-6 bg-[#0f0f0f] min-h-screen">
        <div className="text-gray-300">Loading jobs...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Loads Management</h1>
        <button onClick={fetchJobs} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Refresh
        </button>
      </div>

      <div className="mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded-lg text-white">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#1a1a1a] border border-gray-800">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="py-2 px-4 text-left text-gray-300">Job ID</th>
              <th className="py-2 px-4 text-left text-gray-300">Status</th>
              <th className="py-2 px-4 text-left text-gray-300">Pickup</th>
              <th className="py-2 px-4 text-left text-gray-300">Delivery</th>
              <th className="py-2 px-4 text-left text-gray-300">Reference</th>
              <th className="py-2 px-4 text-left text-gray-300">Created</th>
              <th className="py-2 px-4 text-left text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedJobs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-4 px-4 text-center text-gray-400">No jobs found</td>
              </tr>
            ) : (
              paginatedJobs.map((job) => (
                <tr key={job.id} className="border-b border-gray-800">
                  <td className="py-2 px-4 text-gray-300">#{job.id}</td>
                  <td className="py-2 px-4">
                    <span className={"inline-block px-2 py-1 rounded text-xs " + getStatusColor(job.status)}>
                      {job.status || 'N/A'}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-gray-300">{job.pickupAddress || 'N/A'}</td>
                  <td className="py-2 px-4 text-gray-300">{job.deliveryAddress || 'N/A'}</td>
                  <td className="py-2 px-4 text-gray-300">{job.reference || 'N/A'}</td>
                  <td className="py-2 px-4 text-gray-300">
                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-2 px-4">
                    <select value={job.status || ''} onChange={(e) => handleStatusChange(job.id, e.target.value)} className="px-2 py-1 bg-[#0f0f0f] border border-gray-800 rounded text-white text-sm">
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredJobs.length > itemsPerPage && (
        <div className="flex items-center justify-between px-4 py-4 mt-4 bg-[#0f0f0f] border border-gray-800 rounded">
          <div className="text-sm text-gray-400">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} jobs
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded transition ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {filteredJobs.length <= itemsPerPage && (
        <div className="mt-4 text-gray-400 text-sm">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </div>
      )}
    </div>
  )
}
