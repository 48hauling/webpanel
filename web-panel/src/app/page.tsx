'use client'

import { useState } from 'react'
import { Truck, Users, ClipboardCheck, FileText, MessageSquare, MapPin, TrendingUp } from 'lucide-react'
import LiveStatusTab from '@/components/LiveStatusTab'
import ErrorLogsTab from '@/components/ErrorLogsTab'
import UserIssuesTab from '@/components/UserIssuesTab'
import APIObservabilityDashboard from '@/components/APIObservabilityDashboard'
import DatabaseManagement from '@/components/DatabaseManagement'
import Sidebar from '@/components/Sidebar'
import LoadsManagement from '@/components/LoadsManagement'
import DvirManagement from '@/components/DvirManagement'
import MessagingTab from '@/components/MessagingTab'
import DriverManagement from '@/components/DriverManagement'
import GpsTracking from '@/components/GpsTracking'
import BolViewer from '@/components/BolViewer'
import AuditLogsTab from '@/components/AuditLogsTab'
import AnalyticsTab from '@/components/AnalyticsTab'
import SettingsTab from '@/components/SettingsTab'

type Tab = 'dashboard' | 'loads' | 'drivers' | 'dvirs' | 'bols' | 'messages' | 'gps' | 'audit' | 'observability' | 'live' | 'errors' | 'issues' | 'database' | 'analytics' | 'settings'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')

  return (
    <div className="flex h-screen bg-[#0f0f0f] overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as Tab)} />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 overflow-auto">
        {activeTab === 'dashboard' && <DashboardHome onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'loads' && <LoadsManagement />}
        {activeTab === 'drivers' && <DriverManagement />}
        {activeTab === 'dvirs' && <DvirManagement />}
        {activeTab === 'bols' && <BolViewer />}
        {activeTab === 'messages' && <MessagingTab />}
        {activeTab === 'gps' && <GpsTracking />}
        {activeTab === 'audit' && <AuditLogsTab />}
        {activeTab === 'observability' && <APIObservabilityDashboard />}
        {activeTab === 'live' && <TabWrapper><LiveStatusTab /></TabWrapper>}
        {activeTab === 'errors' && <TabWrapper><ErrorLogsTab /></TabWrapper>}
        {activeTab === 'issues' && <TabWrapper><UserIssuesTab /></TabWrapper>}
        {activeTab === 'database' && <DatabaseManagement />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}

// Wrapper for old tabs to give them proper styling
function TabWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-100">
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

// Simple dashboard home
function DashboardHome({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-100">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to 48 Hauling Dashboard</h1>
          <p className="text-gray-400">Complete logistics and fleet management system</p>
        </div>

        {/* Business Features */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-300">Business Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => onNavigate('loads')}
              className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 hover:border-green-600 transition-colors text-left cursor-pointer"
            >
              <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
                <Truck className="text-green-500" size={24} />
                <span>Loads Management</span>
              </h3>
              <p className="text-sm text-gray-400 mt-2">Create, assign, and track loads with full pickup/delivery details</p>
            </button>

            <button
              onClick={() => onNavigate('drivers')}
              className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 hover:border-green-600 transition-colors text-left cursor-pointer"
            >
              <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
                <Users className="text-blue-500" size={24} />
                <span>Driver Management</span>
              </h3>
              <p className="text-sm text-gray-400 mt-2">Manage drivers, view performance, and track availability</p>
            </button>

            <button
              onClick={() => onNavigate('dvirs')}
              className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 hover:border-green-600 transition-colors text-left cursor-pointer"
            >
              <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
                <ClipboardCheck className="text-purple-500" size={24} />
                <span>DVIR Reports</span>
              </h3>
              <p className="text-sm text-gray-400 mt-2">Review vehicle inspections and manage defects/repairs</p>
            </button>

            <button
              onClick={() => onNavigate('bols')}
              className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 hover:border-green-600 transition-colors text-left cursor-pointer"
            >
              <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
                <FileText className="text-yellow-500" size={24} />
                <span>BOL Documents</span>
              </h3>
              <p className="text-sm text-gray-400 mt-2">View uploaded Bills of Lading and delivery documents</p>
            </button>

            <button
              onClick={() => onNavigate('messages')}
              className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 hover:border-green-600 transition-colors text-left cursor-pointer"
            >
              <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
                <MessageSquare className="text-cyan-500" size={24} />
                <span>Messaging</span>
              </h3>
              <p className="text-sm text-gray-400 mt-2">Chat with drivers in real-time about loads and logistics</p>
            </button>

            <button
              onClick={() => onNavigate('gps')}
              className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 hover:border-green-600 transition-colors text-left cursor-pointer"
            >
              <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
                <MapPin className="text-red-500" size={24} />
                <span>GPS Tracking</span>
              </h3>
              <p className="text-sm text-gray-400 mt-2">Real-time location tracking and route history</p>
            </button>

            <button
              onClick={() => onNavigate('analytics')}
              className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 hover:border-green-600 transition-colors text-left cursor-pointer"
            >
              <h3 className="text-lg font-semibold mb-2 flex items-center space-x-2">
                <TrendingUp className="text-orange-500" size={24} />
                <span>Analytics</span>
              </h3>
              <p className="text-sm text-gray-400 mt-2">View performance metrics, revenue data, and driver statistics</p>
            </button>
          </div>
        </div>

        {/* Technical Features */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-300">Technical & Monitoring</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-2">API Endpoints</h3>
              <p className="text-3xl font-bold text-green-500">24</p>
              <p className="text-sm text-gray-400 mt-2">Active Edge Functions</p>
            </div>

            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-2">API Observability</h3>
              <p className="text-3xl font-bold text-blue-500">Live</p>
              <p className="text-sm text-gray-400 mt-2">Real-time monitoring</p>
            </div>

            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold mb-2">System Status</h3>
              <p className="text-3xl font-bold text-green-500">✓</p>
              <p className="text-sm text-gray-400 mt-2">All systems operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}