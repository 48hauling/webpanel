'use client'

import { useState, useEffect, useCallback } from 'react'
import { devapi } from '@/lib/devapi'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'
import { Play, Pause, RotateCcw, Download, Filter, MapPin } from 'lucide-react'
import type { Driver, LocationHistory } from '@/types/api'

// Dynamically import map component (client-side only)
const MapComponent = dynamic(() => import('./MapView'), { ssr: false })

interface DriverLocation {
  driver: Driver
  location: LocationHistory
  isOnline: boolean
}

export default function GpsTracking() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [locations, setLocations] = useState<DriverLocation[]>([])
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null)
  const [locationHistory, setLocationHistory] = useState<LocationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [playbackIndex, setPlaybackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filterJobId, setFilterJobId] = useState('')

  const fetchDriversAndLocations = useCallback(async () => {
    try {
      setLoading(true)

      // Fetch all drivers
      const driversResponse = await devapi.getDrivers()
      if (driversResponse.success && driversResponse.data) {
        setDrivers(driversResponse.data)

        // Fetch current location for each driver
        const locationPromises = driversResponse.data.map(async (driver: Driver) => {
          const locResponse = await devapi.getDriverLocation(driver.id)
          if (locResponse.success && locResponse.data) {
            return {
              driver,
              location: locResponse.data,
              isOnline: driver.deviceStatus?.isOnline || false
            }
          }
          return null
        })

        const locationResults = await Promise.all(locationPromises)
        const validLocations = locationResults.filter(loc => loc !== null) as DriverLocation[]
        setLocations(validLocations)
      }
    } catch (err) {
      toast.error('Failed to fetch GPS data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDriversAndLocations()
    const interval = setInterval(fetchDriversAndLocations, 30000) // Auto-refresh every 30s
    return () => clearInterval(interval)
  }, [fetchDriversAndLocations])

  const loadLocationHistory = async (driverId: string) => {
    setSelectedDriver(driverId)
    setShowHistory(true)
    setPlaybackIndex(0)
    setIsPlaying(false)

    try {
      const params: any = {}
      if (filterJobId) params.jobId = filterJobId
      if (startDate) params.startTime = new Date(startDate).toISOString()
      if (endDate) params.endTime = new Date(endDate).toISOString()

      const response = await devapi.getLocationHistory(driverId, params)
      if (response.success && response.data) {
        setLocationHistory(response.data)
        if (response.data.length === 0) {
          toast('No location history found for this driver')
        }
      } else {
        toast.error('Failed to load location history')
      }
    } catch (err) {
      console.error('Error loading location history:', err)
      toast.error('An unexpected error occurred. Please try again.')
    }
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const resetPlayback = () => {
    setPlaybackIndex(0)
    setIsPlaying(false)
  }

  useEffect(() => {
    if (isPlaying && playbackIndex < locationHistory.length - 1) {
      const timer = setTimeout(() => {
        setPlaybackIndex(playbackIndex + 1)
      }, 1000) // 1 second per point
      return () => clearTimeout(timer)
    } else if (playbackIndex >= locationHistory.length - 1) {
      setIsPlaying(false)
    }
  }, [isPlaying, playbackIndex, locationHistory.length])

  const exportToCSV = () => {
    if (locationHistory.length === 0) {
      toast.error('No data to export')
      return
    }

    const csvHeader = 'Timestamp,Latitude,Longitude,Speed,Accuracy,Job ID\n'
    const csvRows = locationHistory.map(loc =>
      `${loc.createdAt},${loc.latitude},${loc.longitude},${loc.speed || 0},${loc.accuracy || 0},${loc.jobId || 'N/A'}`
    ).join('\n')

    const csv = csvHeader + csvRows
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `location-history-${selectedDriver}-${Date.now()}.csv`
    a.click()
    toast.success('Location history exported')
  }

  const getDriverName = (driver: Driver) => {
    if (driver.firstName || driver.lastName) {
      return `${driver.firstName || ''} ${driver.lastName || ''}`.trim()
    }
    return driver.username
  }

  if (loading) {
    return (
      <div className="p-6 bg-[#0f0f0f] min-h-screen flex items-center justify-center">
        <div className="text-gray-300">Loading GPS tracking...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#0f0f0f]">
      {/* Main Map Area */}
      <div className="flex-1 relative">
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">GPS Tracking</h1>
            <div className="flex gap-2">
              <span className="px-3 py-2 bg-black/50 text-white rounded-lg text-sm">
                {locations.filter(l => l.isOnline).length} Online
              </span>
              <span className="px-3 py-2 bg-black/50 text-gray-400 rounded-lg text-sm">
                {locations.filter(l => !l.isOnline).length} Offline
              </span>
              <button
                onClick={fetchDriversAndLocations}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        <MapComponent
          locations={locations}
          locationHistory={showHistory ? locationHistory.slice(0, playbackIndex + 1) : []}
          selectedDriver={selectedDriver}
        />

        {/* Playback Controls */}
        {showHistory && locationHistory.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlayback}
                  className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button
                  onClick={resetPlayback}
                  className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  <RotateCcw size={20} />
                </button>

                <input
                  type="range"
                  min="0"
                  max={locationHistory.length - 1}
                  value={playbackIndex}
                  onChange={(e) => setPlaybackIndex(parseInt(e.target.value))}
                  className="flex-1"
                />

                <span className="text-white text-sm">
                  {playbackIndex + 1} / {locationHistory.length}
                </span>

                <button
                  onClick={exportToCSV}
                  className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  title="Export to CSV"
                >
                  <Download size={20} />
                </button>
              </div>

              {locationHistory[playbackIndex] && (
                <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Time:</span>
                    <span className="text-white ml-2">
                      {new Date(locationHistory[playbackIndex].createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Speed:</span>
                    <span className="text-white ml-2">
                      {((locationHistory[playbackIndex].speed || 0) * 2.237).toFixed(1)} mph
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Accuracy:</span>
                    <span className="text-white ml-2">
                      {(locationHistory[playbackIndex].accuracy || 0).toFixed(1)}m
                    </span>
                  </div>
                  {locationHistory[playbackIndex].jobId && (
                    <div>
                      <span className="text-gray-400">Job:</span>
                      <span className="text-white ml-2">
                        #{locationHistory[playbackIndex].jobId}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-[#1a1a1a] border-l border-gray-800 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-bold text-white mb-4">Drivers</h2>

          {/* Filters */}
          <div className="mb-4 space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Start Date</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">End Date</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Job ID</label>
              <input
                type="text"
                value={filterJobId}
                onChange={(e) => setFilterJobId(e.target.value)}
                placeholder="Filter by Job ID"
                className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white text-sm"
              />
            </div>
          </div>

          {/* Driver List */}
          <div className="space-y-2">
            {locations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No drivers with location data
              </div>
            ) : (
              locations.map(({ driver, location, isOnline }) => (
                <div
                  key={driver.id}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    selectedDriver === driver.id
                      ? 'bg-green-900/30 border-green-500'
                      : 'bg-[#0f0f0f] border-gray-800 hover:border-gray-700'
                  }`}
                  onClick={() => loadLocationHistory(driver.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{getDriverName(driver)}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOnline ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                    />
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-1 text-gray-400">
                      <MapPin size={12} />
                      <span>
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </span>
                    </div>
                    {location.speed !== undefined && location.speed > 0 && (
                      <div className="text-gray-400">
                        Speed: {(location.speed * 2.237).toFixed(1)} mph
                      </div>
                    )}
                    <div className="text-gray-500">
                      {new Date(location.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
