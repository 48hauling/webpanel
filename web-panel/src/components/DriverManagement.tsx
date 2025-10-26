'use client'

import { useState, useEffect, useCallback } from 'react'
import { devapi } from '@/lib/devapi'
import toast from 'react-hot-toast'
import { User, Car, CheckCircle, XCircle, Plus, Edit, Trash2, Eye } from 'lucide-react'
import type { Driver } from '@/types/api'

export default function DriverManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [filterOnlineOnly, setFilterOnlineOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await devapi.getDrivers()

      if (response.success && response.data) {
        setDrivers(response.data)
      } else {
        toast.error('Failed to fetch drivers')
      }
    } catch (err) {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDrivers()
  }, [fetchDrivers])

  const handleCreateDriver = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const formData = new FormData(e.currentTarget)

      const driverData = {
        email: formData.get('email') as string,
        username: formData.get('username') as string,
        password: formData.get('password') as string,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        driverLicenseNumber: formData.get('driverLicenseNumber') as string,
        vehicleAssigned: formData.get('vehicleAssigned') as string,
      }

      const response = await devapi.createDriver(driverData)
      if (response.success) {
        toast.success('Driver created successfully')
        setShowCreateModal(false)
        fetchDrivers()
      } else {
        toast.error(response.error || 'Failed to create driver')
      }
    } catch (err) {
      console.error('Error creating driver:', err)
      toast.error('An unexpected error occurred. Please try again.')
    }
  }

  const handleUpdateDriver = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedDriver) return

    try {
      const formData = new FormData(e.currentTarget)

      const driverData = {
        email: formData.get('email') as string,
        username: formData.get('username') as string,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        driverLicenseNumber: formData.get('driverLicenseNumber') as string,
        vehicleAssigned: formData.get('vehicleAssigned') as string,
      }

      const response = await devapi.updateDriver(selectedDriver.id, driverData)
      if (response.success) {
        toast.success('Driver updated successfully')
        setShowEditModal(false)
        setSelectedDriver(null)
        fetchDrivers()
      } else {
        toast.error(response.error || 'Failed to update driver')
      }
    } catch (err) {
      console.error('Error updating driver:', err)
      toast.error('An unexpected error occurred. Please try again.')
    }
  }

  const handleDeleteDriver = async (driverId: string) => {
    if (!confirm('Are you sure you want to deactivate this driver?')) return

    try {
      const response = await devapi.deleteDriver(driverId)
      if (response.success) {
        toast.success('Driver deactivated')
        fetchDrivers()
      } else {
        toast.error('Failed to deactivate driver')
      }
    } catch (err) {
      console.error('Error deactivating driver:', err)
      toast.error('An unexpected error occurred. Please try again.')
    }
  }

  const viewDriverDetails = async (driverId: string) => {
    try {
      const response = await devapi.getDriver(driverId)
      if (response.success && response.data) {
        setSelectedDriver(response.data)
        setShowDetailsModal(true)
      } else {
        toast.error('Failed to fetch driver details')
      }
    } catch (err) {
      console.error('Error fetching driver details:', err)
      toast.error('An unexpected error occurred. Please try again.')
    }
  }

  const filteredDrivers = filterOnlineOnly
    ? drivers.filter(d => d.deviceStatus?.isOnline)
    : drivers

  // Pagination logic
  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedDrivers = filteredDrivers.slice(startIndex, endIndex)

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [filterOnlineOnly])

  if (loading) {
    return (
      <div className="p-6 bg-[#0f0f0f] min-h-screen">
        <div className="text-gray-300">Loading drivers...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Driver Management</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setFilterOnlineOnly(!filterOnlineOnly)}
            className={`px-4 py-2 rounded-lg transition ${
              filterOnlineOnly
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {filterOnlineOnly ? 'Showing Online Only' : 'Show All'}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus size={18} />
            Add Driver
          </button>
          <button
            onClick={fetchDrivers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Total Drivers</div>
          <div className="text-2xl font-bold text-white">{drivers.length}</div>
        </div>
        <div className="p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Online Now</div>
          <div className="text-2xl font-bold text-green-500">
            {drivers.filter(d => d.deviceStatus?.isOnline).length}
          </div>
        </div>
        <div className="p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Offline</div>
          <div className="text-2xl font-bold text-gray-500">
            {drivers.filter(d => !d.deviceStatus?.isOnline).length}
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0f0f0f] border-b border-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">Email</th>
              <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">License #</th>
              <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">Vehicle</th>
              <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">Last Seen</th>
              <th className="px-4 py-3 text-left text-gray-300 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDrivers.map(driver => (
              <tr key={driver.id} className="border-b border-gray-800 hover:bg-[#0f0f0f] transition">
                <td className="px-4 py-3">
                  {driver.deviceStatus?.isOnline ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <XCircle className="text-gray-500" size={20} />
                  )}
                </td>
                <td className="px-4 py-3 text-white">
                  {driver.firstName || driver.lastName
                    ? `${driver.firstName || ''} ${driver.lastName || ''}`.trim()
                    : driver.username}
                </td>
                <td className="px-4 py-3 text-gray-300">{driver.email}</td>
                <td className="px-4 py-3 text-gray-300">
                  {driver.profile?.driverLicenseNumber || '-'}
                </td>
                <td className="px-4 py-3 text-gray-300">
                  {driver.profile?.vehicleAssigned || '-'}
                </td>
                <td className="px-4 py-3 text-gray-400 text-sm">
                  {driver.deviceStatus?.lastSeen
                    ? new Date(driver.deviceStatus.lastSeen).toLocaleString()
                    : 'Never'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewDriverDetails(driver.id)}
                      className="p-2 text-blue-500 hover:bg-blue-900/30 rounded transition"
                      title="View Details"
                      aria-label={`View details for ${driver.firstName || ''} ${driver.lastName || driver.username}`}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDriver(driver)
                        setShowEditModal(true)
                      }}
                      className="p-2 text-yellow-500 hover:bg-yellow-900/30 rounded transition"
                      title="Edit"
                      aria-label={`Edit driver ${driver.firstName || ''} ${driver.lastName || driver.username}`}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteDriver(driver.id)}
                      className="p-2 text-red-500 hover:bg-red-900/30 rounded transition"
                      title="Deactivate"
                      aria-label={`Deactivate driver ${driver.firstName || ''} ${driver.lastName || driver.username}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {filteredDrivers.length > itemsPerPage && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-gray-800">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredDrivers.length)} of {filteredDrivers.length} drivers
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

        {filteredDrivers.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            {filterOnlineOnly ? 'No online drivers' : 'No drivers found'}
          </div>
        )}
      </div>

      {/* Create Driver Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Create New Driver</h2>
            <form onSubmit={handleCreateDriver} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Username *</label>
                <input
                  type="text"
                  name="username"
                  required
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Driver License #</label>
                <input
                  type="text"
                  name="driverLicenseNumber"
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Vehicle Assigned</label>
                <input
                  type="text"
                  name="vehicleAssigned"
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Create Driver
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {showEditModal && selectedDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Edit Driver</h2>
            <form onSubmit={handleUpdateDriver} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={selectedDriver.email}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  defaultValue={selectedDriver.username}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    defaultValue={selectedDriver.firstName || ''}
                    className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    defaultValue={selectedDriver.lastName || ''}
                    className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Driver License #</label>
                <input
                  type="text"
                  name="driverLicenseNumber"
                  defaultValue={selectedDriver.profile?.driverLicenseNumber || ''}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Vehicle Assigned</label>
                <input
                  type="text"
                  name="vehicleAssigned"
                  defaultValue={selectedDriver.profile?.vehicleAssigned || ''}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Update Driver
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedDriver(null)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Driver Details Modal */}
      {showDetailsModal && selectedDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Driver Details</h2>

            {/* Basic Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Name</div>
                  <div className="text-white">
                    {selectedDriver.firstName || selectedDriver.lastName
                      ? `${selectedDriver.firstName || ''} ${selectedDriver.lastName || ''}`.trim()
                      : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Username</div>
                  <div className="text-white">{selectedDriver.username}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Email</div>
                  <div className="text-white">{selectedDriver.email}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Status</div>
                  <div className={selectedDriver.deviceStatus?.isOnline ? 'text-green-500' : 'text-gray-500'}>
                    {selectedDriver.deviceStatus?.isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Info */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Driver Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">License Number</div>
                  <div className="text-white">{selectedDriver.profile?.driverLicenseNumber || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Vehicle Assigned</div>
                  <div className="text-white">{selectedDriver.profile?.vehicleAssigned || '-'}</div>
                </div>
              </div>
            </div>

            {/* Stats */}
            {selectedDriver.stats && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Performance Stats</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-[#0f0f0f] rounded border border-gray-800">
                    <div className="text-gray-400 text-sm">Total Jobs</div>
                    <div className="text-2xl font-bold text-white">{selectedDriver.stats.totalJobs}</div>
                  </div>
                  <div className="p-3 bg-[#0f0f0f] rounded border border-gray-800">
                    <div className="text-gray-400 text-sm">Completed</div>
                    <div className="text-2xl font-bold text-green-500">{selectedDriver.stats.completedJobs}</div>
                  </div>
                  <div className="p-3 bg-[#0f0f0f] rounded border border-gray-800">
                    <div className="text-gray-400 text-sm">Active</div>
                    <div className="text-2xl font-bold text-blue-500">{selectedDriver.stats.activeJobs}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Device Status */}
            {selectedDriver.deviceStatus && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Device Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-400 text-sm">App Type</div>
                    <div className="text-white">{selectedDriver.deviceStatus.appType || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">App Version</div>
                    <div className="text-white">{selectedDriver.deviceStatus.appVersion || '-'}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-gray-400 text-sm">Last Seen</div>
                    <div className="text-white">
                      {new Date(selectedDriver.deviceStatus.lastSeen).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                setShowDetailsModal(false)
                setSelectedDriver(null)
              }}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
