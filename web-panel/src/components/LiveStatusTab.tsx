'use client'

import { useState, useEffect } from 'react'
import { devapi } from '@/lib/devapi'
import toast from 'react-hot-toast'
import {
  Wifi, WifiOff, Smartphone, Battery, MapPin, Clock,
  RefreshCw, Filter, User, Monitor, Activity
} from 'lucide-react'

interface DeviceStatus {
  userId: string
  driverId?: string
  isOnline: boolean
  lastSeen: string
  appType?: string
  appVersion?: string
  deviceInfo?: {
    platform?: string
    osVersion?: string
    model?: string
    manufacturer?: string
  }
  latitude?: number
  longitude?: number
  batteryLevel?: number
  driver?: {
    id: string
    firstName?: string
    lastName?: string
    username: string
    email?: string
  }
}

export default function LiveStatusTab() {
  const [devices, setDevices] = useState<DeviceStatus[]>([])
  const [filteredDevices, setFilteredDevices] = useState<DeviceStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchDeviceStatus = async () => {
    try {
      const response = await devapi.getOnlineDevices()

      if (response.success && response.data) {
        // Process device data
        const processedDevices = response.data.map((device: any) => {
          const isOnline = new Date(device.lastSeen || device.last_seen).getTime() >= Date.now() - 10 * 60 * 1000

          return {
            userId: device.userId || device.user_id || device.driver_id,
            driverId: device.driverId || device.driver_id,
            isOnline,
            lastSeen: device.lastSeen || device.last_seen,
            appType: device.appType || device.app_type,
            appVersion: device.appVersion || device.app_version,
            deviceInfo: device.deviceInfo || device.device_info || {},
            latitude: device.latitude,
            longitude: device.longitude,
            batteryLevel: device.batteryLevel || device.battery_level,
            driver: device.driver || device.profiles
          }
        })

        setDevices(processedDevices)
        setLastRefresh(new Date())
      } else {
        toast.error(response.error || 'Failed to fetch device status')
      }
    } catch (error) {
      toast.error('Error fetching device status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeviceStatus()

    if (!autoRefresh) return

    const interval = setInterval(fetchDeviceStatus, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [autoRefresh, fetchDeviceStatus])

  useEffect(() => {
    // Apply filter
    let filtered = devices
    if (filter === 'online') {
      filtered = devices.filter(d => d.isOnline)
    } else if (filter === 'offline') {
      filtered = devices.filter(d => !d.isOnline)
    }
    setFilteredDevices(filtered)
  }, [devices, filter])

  const getDriverName = (driver: any) => {
    if (!driver) return 'Unknown Driver'
    if (driver.firstName || driver.lastName) {
      return `${driver.firstName || ''} ${driver.lastName || ''}`.trim()
    }
    return driver.username || driver.email || 'Unknown Driver'
  }

  const getTimeSinceLastSeen = (lastSeen: string) => {
    const diff = Date.now() - new Date(lastSeen).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-gray-400'
    if (level > 50) return 'text-green-500'
    if (level > 20) return 'text-yellow-500'
    return 'text-red-500'
  }

  const onlineCount = devices.filter(d => d.isOnline).length
  const offlineCount = devices.filter(d => !d.isOnline).length

  if (loading) {
    return (
      <div className="p-6 bg-[#0f0f0f] min-h-screen flex items-center justify-center">
        <div className="text-gray-300">Loading device status...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Live Device Status</h1>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded text-sm ${
              autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => fetchDeviceStatus()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Devices</p>
              <p className="text-3xl font-bold text-white">{devices.length}</p>
            </div>
            <Monitor size={32} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Online</p>
              <p className="text-3xl font-bold text-green-500">{onlineCount}</p>
            </div>
            <Wifi size={32} className="text-green-500" />
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Offline</p>
              <p className="text-3xl font-bold text-red-500">{offlineCount}</p>
            </div>
            <WifiOff size={32} className="text-red-500" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:border-gray-700'
          }`}
        >
          All ({devices.length})
        </button>
        <button
          onClick={() => setFilter('online')}
          className={`px-4 py-2 rounded flex items-center gap-2 ${
            filter === 'online'
              ? 'bg-green-600 text-white'
              : 'bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:border-gray-700'
          }`}
        >
          <Wifi size={16} />
          Online ({onlineCount})
        </button>
        <button
          onClick={() => setFilter('offline')}
          className={`px-4 py-2 rounded flex items-center gap-2 ${
            filter === 'offline'
              ? 'bg-red-600 text-white'
              : 'bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:border-gray-700'
          }`}
        >
          <WifiOff size={16} />
          Offline ({offlineCount})
        </button>
      </div>

      {/* Device Grid */}
      {filteredDevices.length === 0 ? (
        <div className="text-center py-12 bg-[#1a1a1a] border border-gray-800 rounded-lg">
          <Activity size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">No devices found</p>
          <p className="text-sm text-gray-500 mt-1">
            {filter === 'online' ? 'No devices are currently online' :
             filter === 'offline' ? 'No devices are currently offline' :
             'No device status data available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDevices.map((device) => (
            <div
              key={device.userId}
              className={`p-4 rounded-lg border transition ${
                device.isOnline
                  ? 'bg-[#1a1a1a] border-green-800/50 hover:border-green-700'
                  : 'bg-[#1a1a1a] border-gray-800 hover:border-gray-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <User size={20} className="text-gray-400" />
                  <h3 className="text-white font-medium">
                    {getDriverName(device.driver)}
                  </h3>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                  device.isOnline
                    ? 'bg-green-900/30 text-green-500'
                    : 'bg-red-900/30 text-red-500'
                }`}>
                  {device.isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
                  {device.isOnline ? 'ONLINE' : 'OFFLINE'}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                {/* App Info */}
                {device.appType && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Smartphone size={14} />
                    <span>{device.appType}</span>
                    {device.appVersion && (
                      <span className="text-gray-500">v{device.appVersion}</span>
                    )}
                  </div>
                )}

                {/* Device Info */}
                {device.deviceInfo?.platform && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Monitor size={14} />
                    <span>
                      {device.deviceInfo.platform}
                      {device.deviceInfo.osVersion && ` ${device.deviceInfo.osVersion}`}
                    </span>
                  </div>
                )}

                {device.deviceInfo?.model && (
                  <div className="text-gray-500 text-xs pl-6">
                    {device.deviceInfo.manufacturer && `${device.deviceInfo.manufacturer} `}
                    {device.deviceInfo.model}
                  </div>
                )}

                {/* Last Seen */}
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock size={14} />
                  <span>Last seen: {getTimeSinceLastSeen(device.lastSeen)}</span>
                </div>

                {/* Location */}
                {device.latitude && device.longitude && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={14} />
                    <span>
                      {device.latitude.toFixed(4)}, {device.longitude.toFixed(4)}
                    </span>
                  </div>
                )}

                {/* Battery */}
                {device.batteryLevel !== undefined && (
                  <div className="flex items-center gap-2">
                    <Battery size={14} className={getBatteryColor(device.batteryLevel)} />
                    <span className={getBatteryColor(device.batteryLevel)}>
                      {device.batteryLevel}%
                    </span>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div className="mt-3 pt-3 border-t border-gray-800">
                <p className="text-xs text-gray-500">
                  {new Date(device.lastSeen).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
