'use client'

import { useState, useEffect } from 'react'
import { devapi } from '@/lib/devapi'
import toast from 'react-hot-toast'
import {
  TrendingUp, DollarSign, Users, Briefcase, Activity,
  Calendar, RefreshCw, ChevronDown, ChevronUp, Award
} from 'lucide-react'

export default function AnalyticsTab() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(30)
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any>(null)
  const [driverMetrics, setDriverMetrics] = useState<any[]>([])
  const [jobsTimeline, setJobsTimeline] = useState<any[]>([])
  const [expandedSection, setExpandedSection] = useState<string>('overview')

  useEffect(() => {
    fetchAllAnalytics()
  }, [period])

  const fetchAllAnalytics = async () => {
    setLoading(true)
    try {
      const [stats, revenue, drivers, timeline] = await Promise.all([
        devapi.getDashboardStats(),
        devapi.getRevenueAnalytics(period),
        devapi.getDriverAnalytics(period),
        devapi.getJobsTimeline(period)
      ])

      if (stats.success) setDashboardStats(stats.data)
      if (revenue.success) setRevenueData(revenue.data)
      if (drivers.success && drivers.data) setDriverMetrics(drivers.data)
      if (timeline.success && timeline.data) setJobsTimeline(timeline.data)
    } catch (error) {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section)
  }

  if (loading && !dashboardStats) {
    return (
      <div className="p-6 bg-[#0f0f0f] min-h-screen flex items-center justify-center">
        <div className="text-gray-300">Loading analytics...</div>
      </div>
    )
  }

  const maxRevenue = revenueData?.chartData?.reduce((max: number, day: any) =>
    Math.max(max, day.revenue), 0) || 1

  const maxJobs = jobsTimeline?.reduce((max: number, day: any) =>
    Math.max(max, day.total), 0) || 1

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Analytics & Reporting</h1>
        <div className="flex gap-3 items-center">
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
          <button
            onClick={() => fetchAllAnalytics()}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="mb-6">
        <div
          className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-gray-800 rounded-t-lg cursor-pointer hover:bg-[#1a1a1a]/80"
          onClick={() => toggleSection('overview')}
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity size={20} className="text-blue-500" />
            Overview
          </h2>
          {expandedSection === 'overview' ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
        {expandedSection === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-[#1a1a1a] border border-t-0 border-gray-800 rounded-b-lg">
            <div className="bg-[#0f0f0f] border border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Jobs</p>
                  <p className="text-3xl font-bold text-blue-500">{dashboardStats?.jobs?.total || 0}</p>
                </div>
                <Briefcase size={32} className="text-blue-500" />
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Pending: {dashboardStats?.jobs?.pending || 0} | In Progress: {dashboardStats?.jobs?.inProgress || 0}
              </div>
            </div>

            <div className="bg-[#0f0f0f] border border-green-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Completed</p>
                  <p className="text-3xl font-bold text-green-500">{dashboardStats?.jobs?.completed || 0}</p>
                </div>
                <TrendingUp size={32} className="text-green-500" />
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {dashboardStats?.jobs?.total > 0
                  ? `${((dashboardStats.jobs.completed / dashboardStats.jobs.total) * 100).toFixed(1)}% completion rate`
                  : 'No jobs yet'}
              </div>
            </div>

            <div className="bg-[#0f0f0f] border border-purple-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active Drivers</p>
                  <p className="text-3xl font-bold text-purple-500">{dashboardStats?.activeDrivers || 0}</p>
                </div>
                <Users size={32} className="text-purple-500" />
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Online in last 5 minutes
              </div>
            </div>

            <div className="bg-[#0f0f0f] border border-yellow-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Open Issues</p>
                  <p className="text-3xl font-bold text-yellow-500">{dashboardStats?.openIssues || 0}</p>
                </div>
                <Activity size={32} className="text-yellow-500" />
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Unresolved Errors: {dashboardStats?.unresolvedErrors || 0}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Analytics */}
      <div className="mb-6">
        <div
          className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-gray-800 rounded-t-lg cursor-pointer hover:bg-[#1a1a1a]/80"
          onClick={() => toggleSection('revenue')}
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <DollarSign size={20} className="text-green-500" />
            Revenue Analytics
          </h2>
          {expandedSection === 'revenue' ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
        {expandedSection === 'revenue' && revenueData && (
          <div className="p-4 bg-[#1a1a1a] border border-t-0 border-gray-800 rounded-b-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-green-500">${revenueData.totalRevenue}</p>
              </div>
              <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400">Average Job Value</p>
                <p className="text-2xl font-bold text-blue-500">${revenueData.averageJobValue}</p>
              </div>
              <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-400">Completed Jobs</p>
                <p className="text-2xl font-bold text-purple-500">{revenueData.totalJobs}</p>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-4">
              <h3 className="text-white font-medium mb-4">Revenue Over Time</h3>
              {revenueData.chartData?.length > 0 ? (
                <div className="space-y-2">
                  {revenueData.chartData.map((day: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-20 text-xs text-gray-400 flex-shrink-0">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex-1 h-8 bg-[#1a1a1a] rounded overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-end px-2"
                          style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                        >
                          <span className="text-xs text-white font-medium">
                            ${day.revenue.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="w-12 text-xs text-gray-400 text-right">
                        {day.jobs} jobs
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No revenue data available for this period</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Driver Performance */}
      <div className="mb-6">
        <div
          className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-gray-800 rounded-t-lg cursor-pointer hover:bg-[#1a1a1a]/80"
          onClick={() => toggleSection('drivers')}
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Award size={20} className="text-purple-500" />
            Driver Performance
          </h2>
          {expandedSection === 'drivers' ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
        {expandedSection === 'drivers' && (
          <div className="p-4 bg-[#1a1a1a] border border-t-0 border-gray-800 rounded-b-lg">
            {driverMetrics.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="px-4 py-3 text-left text-sm text-gray-400">Driver</th>
                      <th className="px-4 py-3 text-right text-sm text-gray-400">Total Jobs</th>
                      <th className="px-4 py-3 text-right text-sm text-gray-400">Completed</th>
                      <th className="px-4 py-3 text-right text-sm text-gray-400">In Progress</th>
                      <th className="px-4 py-3 text-right text-sm text-gray-400">Revenue</th>
                      <th className="px-4 py-3 text-right text-sm text-gray-400">Completion %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverMetrics.map((driver, idx) => (
                      <tr key={idx} className="border-b border-gray-800 hover:bg-[#0f0f0f]">
                        <td className="px-4 py-3 text-white">{driver.driverName}</td>
                        <td className="px-4 py-3 text-right text-gray-300">{driver.totalJobs}</td>
                        <td className="px-4 py-3 text-right text-green-500">{driver.completedJobs}</td>
                        <td className="px-4 py-3 text-right text-yellow-500">{driver.inProgressJobs}</td>
                        <td className="px-4 py-3 text-right text-blue-500">${driver.revenue}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-medium ${
                            parseFloat(driver.completionRate) >= 80 ? 'text-green-500' :
                            parseFloat(driver.completionRate) >= 50 ? 'text-yellow-500' :
                            'text-red-500'
                          }`}>
                            {driver.completionRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No driver performance data available</p>
            )}
          </div>
        )}
      </div>

      {/* Jobs Timeline */}
      <div className="mb-6">
        <div
          className="flex items-center justify-between p-4 bg-[#1a1a1a] border border-gray-800 rounded-t-lg cursor-pointer hover:bg-[#1a1a1a]/80"
          onClick={() => toggleSection('timeline')}
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            Jobs Timeline
          </h2>
          {expandedSection === 'timeline' ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
        {expandedSection === 'timeline' && (
          <div className="p-4 bg-[#1a1a1a] border border-t-0 border-gray-800 rounded-b-lg">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-4 mb-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span className="text-gray-400">Total</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span className="text-gray-400">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-600 rounded"></div>
                  <span className="text-gray-400">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-600 rounded"></div>
                  <span className="text-gray-400">Pending</span>
                </div>
              </div>

              {jobsTimeline?.length > 0 ? (
                <div className="space-y-2">
                  {jobsTimeline.map((day: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-20 text-xs text-gray-400 flex-shrink-0">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex-1 h-6 bg-[#1a1a1a] rounded overflow-hidden relative flex">
                        <div
                          className="h-full bg-green-600"
                          style={{ width: `${(day.completed / maxJobs) * 100}%` }}
                          title={`Completed: ${day.completed}`}
                        ></div>
                        <div
                          className="h-full bg-yellow-600"
                          style={{ width: `${(day.in_progress / maxJobs) * 100}%` }}
                          title={`In Progress: ${day.in_progress}`}
                        ></div>
                        <div
                          className="h-full bg-gray-600"
                          style={{ width: `${(day.pending / maxJobs) * 100}%` }}
                          title={`Pending: ${day.pending}`}
                        ></div>
                      </div>
                      <div className="w-12 text-xs text-gray-400 text-right">
                        {day.total}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No timeline data available for this period</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
