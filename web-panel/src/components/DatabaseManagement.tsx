'use client'

import { useState, useEffect } from 'react'
import { devapi } from '@/lib/devapi'
import toast from 'react-hot-toast'
import {
  Database, Table, Code, Play, Download, ChevronRight,
  ChevronDown, FileText, RefreshCw, Search
} from 'lucide-react'

export default function DatabaseManagement() {
  const [view, setView] = useState<'query' | 'browser'>('query')
  const [tables, setTables] = useState<any[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableSchema, setTableSchema] = useState<any[]>([])
  const [tableRows, setTableRows] = useState<any[]>([])
  const [tableStats, setTableStats] = useState<any>(null)
  const [query, setQuery] = useState('SELECT * FROM jobs LIMIT 10;')
  const [queryResult, setQueryResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(0)
  const [limit] = useState(50)
  const [expandedTable, setExpandedTable] = useState<string | null>(null)

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    try {
      const response = await devapi.getDatabaseTables()
      if (response.success && response.data) {
        setTables(response.data)
      }
    } catch (error) {
      toast.error('Failed to load tables')
    }
  }

  const loadTableData = async (tableName: string) => {
    setSelectedTable(tableName)
    setLoading(true)

    try {
      const [schemaRes, rowsRes, statsRes] = await Promise.all([
        devapi.getTableSchema(tableName),
        devapi.getTableRows(tableName, { limit, offset: page * limit }),
        devapi.getTableStats(tableName)
      ])

      if (schemaRes.success) setTableSchema(schemaRes.data || [])
      if (rowsRes.success) setTableRows(rowsRes.data?.rows || [])
      if (statsRes.success) setTableStats(statsRes.data)
    } catch (error) {
      toast.error('Failed to load table data')
    } finally {
      setLoading(false)
    }
  }

  const executeQuery = async () => {
    if (!query.trim()) {
      toast.error('Please enter a query')
      return
    }

    setLoading(true)
    try {
      const response = await devapi.executeQuery(query)
      if (response.success) {
        setQueryResult(response.data)
        toast.success(`Query executed successfully (${response.data?.rowCount || 0} rows)`)
      } else {
        toast.error(response.error || 'Query failed')
        setQueryResult({ error: response.error })
      }
    } catch (error) {
      toast.error('Error executing query')
      setQueryResult({ error: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error('No data to export')
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header]
          if (value === null || value === undefined) return ''
          if (typeof value === 'object') return JSON.stringify(value).replace(/,/g, ';')
          return String(value).replace(/,/g, ';')
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    a.click()
    toast.success('Data exported to CSV')
  }

  const toggleTableExpand = (tableName: string) => {
    if (expandedTable === tableName) {
      setExpandedTable(null)
    } else {
      setExpandedTable(tableName)
      loadTableData(tableName)
    }
  }

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Database Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('query')}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              view === 'query' ? 'bg-blue-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-gray-800'
            }`}
          >
            <Code size={18} />
            Query Executor
          </button>
          <button
            onClick={() => setView('browser')}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              view === 'browser' ? 'bg-blue-600 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-gray-800'
            }`}
          >
            <Table size={18} />
            Table Browser
          </button>
        </div>
      </div>

      {view === 'query' ? (
        <div className="space-y-4">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
            <h2 className="text-white font-medium mb-3">SQL Query Executor</h2>
            <p className="text-sm text-gray-400 mb-3">
              Execute read-only SELECT queries on the hauling48 database
            </p>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white font-mono text-sm"
              placeholder="SELECT * FROM table_name LIMIT 10;"
            />
            <div className="flex justify-between items-center mt-3">
              <p className="text-xs text-gray-500">
                Only SELECT queries are allowed for safety
              </p>
              <button
                onClick={executeQuery}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Play size={16} />
                {loading ? 'Executing...' : 'Execute Query'}
              </button>
            </div>
          </div>

          {queryResult && (
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-white font-medium">Query Results</h3>
                {queryResult.rows && (
                  <button
                    onClick={() => exportToCSV(queryResult.rows, 'query-results')}
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 text-sm"
                  >
                    <Download size={14} />
                    Export CSV
                  </button>
                )}
              </div>

              {queryResult.error ? (
                <div className="p-3 bg-red-900/20 border border-red-700 rounded text-red-400">
                  {queryResult.error}
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-400 mb-3">
                    {queryResult.rowCount} rows returned
                  </p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-800">
                      <thead>
                        <tr className="bg-[#0f0f0f]">
                          {queryResult.rows?.[0] && Object.keys(queryResult.rows[0]).map((key) => (
                            <th key={key} className="px-3 py-2 text-left text-xs text-gray-400 border-b border-gray-800">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.rows?.map((row: any, idx: number) => (
                          <tr key={idx} className="border-b border-gray-800 hover:bg-[#0f0f0f]">
                            {Object.values(row).map((value: any, i: number) => (
                              <td key={i} className="px-3 py-2 text-sm text-gray-300">
                                {value === null ? <span className="text-gray-600">NULL</span> :
                                 typeof value === 'object' ? JSON.stringify(value) :
                                 String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white font-medium">Database Tables</h2>
              <button
                onClick={loadTables}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>

            <div className="space-y-2">
              {tables.map((table) => (
                <div key={table.table_name} className="border border-gray-800 rounded">
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-[#0f0f0f]"
                    onClick={() => toggleTableExpand(table.table_name)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedTable === table.table_name ? (
                        <ChevronDown size={16} className="text-gray-400" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-400" />
                      )}
                      <Database size={16} className="text-blue-500" />
                      <span className="text-white font-mono">{table.table_name}</span>
                    </div>
                    {tableStats && expandedTable === table.table_name && (
                      <span className="text-sm text-gray-400">
                        {tableStats.rowCount} rows • {tableStats.size}
                      </span>
                    )}
                  </div>

                  {expandedTable === table.table_name && (
                    <div className="border-t border-gray-800 p-4 bg-[#0f0f0f]">
                      {loading ? (
                        <div className="text-gray-400 text-center py-4">Loading...</div>
                      ) : (
                        <>
                          {/* Schema */}
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-white mb-2">Schema</h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-xs">
                                <thead>
                                  <tr className="border-b border-gray-800">
                                    <th className="px-2 py-1 text-left text-gray-400">Column</th>
                                    <th className="px-2 py-1 text-left text-gray-400">Type</th>
                                    <th className="px-2 py-1 text-left text-gray-400">Nullable</th>
                                    <th className="px-2 py-1 text-left text-gray-400">Default</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tableSchema.map((col, idx) => (
                                    <tr key={idx} className="border-b border-gray-800">
                                      <td className="px-2 py-1 text-blue-400 font-mono">{col.column_name}</td>
                                      <td className="px-2 py-1 text-gray-300">{col.data_type}</td>
                                      <td className="px-2 py-1 text-gray-300">{col.is_nullable}</td>
                                      <td className="px-2 py-1 text-gray-500">{col.column_default || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Data */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-sm font-medium text-white">
                                Data (showing {tableRows.length} rows)
                              </h4>
                              <button
                                onClick={() => exportToCSV(tableRows, table.table_name)}
                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs flex items-center gap-1"
                              >
                                <Download size={12} />
                                Export
                              </button>
                            </div>
                            <div className="overflow-x-auto max-h-96">
                              <table className="min-w-full text-xs">
                                <thead className="sticky top-0 bg-[#0f0f0f]">
                                  <tr className="border-b border-gray-800">
                                    {tableSchema.map((col) => (
                                      <th key={col.column_name} className="px-2 py-1 text-left text-gray-400">
                                        {col.column_name}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {tableRows.map((row, idx) => (
                                    <tr key={idx} className="border-b border-gray-800 hover:bg-[#1a1a1a]">
                                      {tableSchema.map((col) => (
                                        <td key={col.column_name} className="px-2 py-1 text-gray-300">
                                          {row[col.column_name] === null ? (
                                            <span className="text-gray-600">NULL</span>
                                          ) : typeof row[col.column_name] === 'object' ? (
                                            JSON.stringify(row[col.column_name])
                                          ) : (
                                            String(row[col.column_name])
                                          )}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
