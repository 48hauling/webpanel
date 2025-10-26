'use client'

import { useState, useEffect } from 'react'
import { devapi } from '@/lib/devapi'
import toast from 'react-hot-toast'
import {
  Settings, Bell, Moon, Globe, Save, RefreshCw,
  ChevronDown, ChevronUp, Key, Database, Shield
} from 'lucide-react'

export default function SettingsTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<any>({})
  const [userPreferences, setUserPreferences] = useState<any>({})
  const [expandedSection, setExpandedSection] = useState<string>('general')
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Default settings structure
  const defaultSettings = {
    // General
    appName: '48 Hauling',
    companyName: '48 Hauling',
    supportEmail: 'support@48hauling.com',

    // Notifications
    enableEmailNotifications: true,
    enablePushNotifications: true,
    notifyOnNewJob: true,
    notifyOnJobComplete: true,
    notifyOnDriverOnline: false,

    // System
    sessionTimeout: '30',
    autoRefreshInterval: '60',
    maxUploadSize: '10',
    enableDebugMode: false,

    // Integration
    gpsUpdateInterval: '30',
    minBatteryLevel: '20',
    locationAccuracyThreshold: '50'
  }

  useEffect(() => {
    const user = devapi.getUser()
    setCurrentUser(user)
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const [settingsRes, prefsRes] = await Promise.all([
        devapi.getSettings(),
        devapi.getUserPreferences(devapi.getUser()?.userId || '')
      ])

      if (settingsRes.success) {
        // Merge with defaults
        setSettings({ ...defaultSettings, ...settingsRes.data })
      } else {
        setSettings(defaultSettings)
      }

      if (prefsRes.success) {
        setUserPreferences(prefsRes.data)
      }
    } catch (error) {
      toast.error('Failed to load settings')
      setSettings(defaultSettings)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const response = await devapi.bulkUpdateSettings(settings)

      if (response.success) {
        toast.success('Settings saved successfully')
      } else {
        toast.error('Failed to save settings')
      }
    } catch (error) {
      toast.error('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePreferences = async () => {
    setSaving(true)
    try {
      const response = await devapi.updateUserPreferences(currentUser?.userId, userPreferences)

      if (response.success) {
        toast.success('Preferences saved successfully')
      } else {
        toast.error('Failed to save preferences')
      }
    } catch (error) {
      toast.error('Error saving preferences')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  const updatePreference = (key: string, value: any) => {
    setUserPreferences({ ...userPreferences, [key]: value })
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section)
  }

  if (loading) {
    return (
      <div className="p-6 bg-[#0f0f0f] min-h-screen flex items-center justify-center">
        <div className="text-gray-300">Loading settings...</div>
      </div>
    )
  }

  const isAdmin = currentUser?.role === 'ADMIN'

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Settings & Configuration</h1>
        <button
          onClick={() => fetchSettings()}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* User Preferences */}
      <div className="mb-6">
        <div
          className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-gray-800 rounded-t-lg cursor-pointer hover:bg-[#1a1a1a]/80"
          onClick={() => toggleSection('preferences')}
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings size={20} className="text-blue-500" />
            My Preferences
          </h2>
          {expandedSection === 'preferences' ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
        {expandedSection === 'preferences' && (
          <div className="p-6 bg-[#1a1a1a] border border-t-0 border-gray-800 rounded-b-lg space-y-4">
            <div>
              <label className="flex items-center gap-3 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={userPreferences.notificationsEnabled || false}
                  onChange={(e) => updatePreference('notificationsEnabled', e.target.checked)}
                  className="w-5 h-5 bg-[#0f0f0f] border-gray-800 rounded"
                />
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-yellow-500" />
                  <span>Enable Notifications</span>
                </div>
              </label>
              <p className="text-sm text-gray-400 ml-8 mt-1">
                Receive push notifications and alerts
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Moon size={18} className="text-purple-500" />
                  <span>Theme</span>
                </div>
              </label>
              <select
                value={userPreferences.theme || 'dark'}
                onChange={(e) => updatePreference('theme', e.target.value)}
                className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Globe size={18} className="text-green-500" />
                  <span>Language</span>
                </div>
              </label>
              <select
                value={userPreferences.language || 'en'}
                onChange={(e) => updatePreference('language', e.target.value)}
                className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* General Settings (Admin Only) */}
      {isAdmin && (
        <div className="mb-6">
          <div
            className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-gray-800 rounded-t-lg cursor-pointer hover:bg-[#1a1a1a]/80"
            onClick={() => toggleSection('general')}
          >
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Database size={20} className="text-green-500" />
              General Settings
            </h2>
            {expandedSection === 'general' ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>
          {expandedSection === 'general' && (
            <div className="p-6 bg-[#1a1a1a] border border-t-0 border-gray-800 rounded-b-lg space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Application Name</label>
                <input
                  type="text"
                  value={settings.appName || ''}
                  onChange={(e) => updateSetting('appName', e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Company Name</label>
                <input
                  type="text"
                  value={settings.companyName || ''}
                  onChange={(e) => updateSetting('companyName', e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail || ''}
                  onChange={(e) => updateSetting('supportEmail', e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notification Settings (Admin Only) */}
      {isAdmin && (
        <div className="mb-6">
          <div
            className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-gray-800 rounded-t-lg cursor-pointer hover:bg-[#1a1a1a]/80"
            onClick={() => toggleSection('notifications')}
          >
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bell size={20} className="text-yellow-500" />
              Notification Settings
            </h2>
            {expandedSection === 'notifications' ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>
          {expandedSection === 'notifications' && (
            <div className="p-6 bg-[#1a1a1a] border border-t-0 border-gray-800 rounded-b-lg space-y-4">
              <div>
                <label className="flex items-center gap-3 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableEmailNotifications || false}
                    onChange={(e) => updateSetting('enableEmailNotifications', e.target.checked)}
                    className="w-5 h-5 bg-[#0f0f0f] border-gray-800 rounded"
                  />
                  <span>Enable Email Notifications</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-3 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enablePushNotifications || false}
                    onChange={(e) => updateSetting('enablePushNotifications', e.target.checked)}
                    className="w-5 h-5 bg-[#0f0f0f] border-gray-800 rounded"
                  />
                  <span>Enable Push Notifications</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-3 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnNewJob || false}
                    onChange={(e) => updateSetting('notifyOnNewJob', e.target.checked)}
                    className="w-5 h-5 bg-[#0f0f0f] border-gray-800 rounded"
                  />
                  <span>Notify on New Job</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-3 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnJobComplete || false}
                    onChange={(e) => updateSetting('notifyOnJobComplete', e.target.checked)}
                    className="w-5 h-5 bg-[#0f0f0f] border-gray-800 rounded"
                  />
                  <span>Notify on Job Completion</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-3 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifyOnDriverOnline || false}
                    onChange={(e) => updateSetting('notifyOnDriverOnline', e.target.checked)}
                    className="w-5 h-5 bg-[#0f0f0f] border-gray-800 rounded"
                  />
                  <span>Notify when Driver comes Online</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* System Settings (Admin Only) */}
      {isAdmin && (
        <div className="mb-6">
          <div
            className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-gray-800 rounded-t-lg cursor-pointer hover:bg-[#1a1a1a]/80"
            onClick={() => toggleSection('system')}
          >
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield size={20} className="text-red-500" />
              System Configuration
            </h2>
            {expandedSection === 'system' ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>
          {expandedSection === 'system' && (
            <div className="p-6 bg-[#1a1a1a] border border-t-0 border-gray-800 rounded-b-lg space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.sessionTimeout || '30'}
                  onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                  min="5"
                  max="1440"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Auto Refresh Interval (seconds)</label>
                <input
                  type="number"
                  value={settings.autoRefreshInterval || '60'}
                  onChange={(e) => updateSetting('autoRefreshInterval', e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                  min="10"
                  max="300"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Max Upload Size (MB)</label>
                <input
                  type="number"
                  value={settings.maxUploadSize || '10'}
                  onChange={(e) => updateSetting('maxUploadSize', e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                  min="1"
                  max="100"
                />
              </div>

              <div>
                <label className="flex items-center gap-3 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableDebugMode || false}
                    onChange={(e) => updateSetting('enableDebugMode', e.target.checked)}
                    className="w-5 h-5 bg-[#0f0f0f] border-gray-800 rounded"
                  />
                  <span>Enable Debug Mode</span>
                </label>
                <p className="text-sm text-gray-400 ml-8 mt-1">
                  Show detailed error messages and logs
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Integration Settings (Admin Only) */}
      {isAdmin && (
        <div className="mb-6">
          <div
            className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-gray-800 rounded-t-lg cursor-pointer hover:bg-[#1a1a1a]/80"
            onClick={() => toggleSection('integration')}
          >
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Key size={20} className="text-purple-500" />
              Integration Settings
            </h2>
            {expandedSection === 'integration' ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>
          {expandedSection === 'integration' && (
            <div className="p-6 bg-[#1a1a1a] border border-t-0 border-gray-800 rounded-b-lg space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">GPS Update Interval (seconds)</label>
                <input
                  type="number"
                  value={settings.gpsUpdateInterval || '30'}
                  onChange={(e) => updateSetting('gpsUpdateInterval', e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                  min="5"
                  max="300"
                />
                <p className="text-sm text-gray-400 mt-1">
                  How often mobile apps send location updates
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Minimum Battery Level (%)</label>
                <input
                  type="number"
                  value={settings.minBatteryLevel || '20'}
                  onChange={(e) => updateSetting('minBatteryLevel', e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                  min="5"
                  max="50"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Alert when device battery drops below this level
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Location Accuracy Threshold (meters)</label>
                <input
                  type="number"
                  value={settings.locationAccuracyThreshold || '50'}
                  onChange={(e) => updateSetting('locationAccuracyThreshold', e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                  min="10"
                  max="500"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Minimum acceptable GPS accuracy for location tracking
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Save Button (Admin Only) */}
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      )}
    </div>
  )
}
