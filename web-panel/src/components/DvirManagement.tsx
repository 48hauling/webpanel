'use client'

import { useState, useEffect, useRef } from 'react'
import { devapi } from '@/lib/devapi'
import toast from 'react-hot-toast'
import {
  Plus, Eye, CheckCircle, XCircle, AlertTriangle,
  FileText, Calendar, User, Truck, X
} from 'lucide-react'
import type { Dvir, Driver } from '@/types/api'

type DvirReport = Dvir

const CHECKLIST_ITEMS = {
  'Brakes': false,
  'Tires (Condition & Pressure)': false,
  'Lights (Headlights, Taillights, Turn Signals)': false,
  'Mirrors': false,
  'Horn': false,
  'Windshield Wipers': false,
  'Fluid Levels (Oil, Coolant, Brake Fluid)': false,
  'Seat Belts': false,
  'Emergency Equipment (Triangle, Fire Extinguisher)': false,
  'Exhaust System': false,
  'Steering': false,
  'Suspension': false,
  'Fuel System': false,
  'Coupling Devices': false,
  'Cargo Securement': false,
}

export default function DvirManagement() {
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list')
  const [dvirs, setDvirs] = useState<DvirReport[]>([])
  const [pendingDvirs, setPendingDvirs] = useState<DvirReport[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [selectedDvir, setSelectedDvir] = useState<DvirReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [userRole, setUserRole] = useState<string>('')

  // Form state
  const [selectedDriver, setSelectedDriver] = useState('')
  const [vehicleId, setVehicleId] = useState('')
  const [inspectionType, setInspectionType] = useState<'PRE_TRIP' | 'POST_TRIP'>('PRE_TRIP')
  const [odometer, setOdometer] = useState('')
  const [checklist, setChecklist] = useState(CHECKLIST_ITEMS)
  const [defectsFound, setDefectsFound] = useState(false)
  const [defectDescription, setDefectDescription] = useState('')
  const [safeToOperate, setSafeToOperate] = useState(true)
  const [mechanicNotes, setMechanicNotes] = useState('')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    const user = devapi.getUser()
    if (user) {
      setUserRole(user.role)
    }
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Load drivers
      const driversResponse = await devapi.getDrivers()
      if (driversResponse.success && driversResponse.data) {
        setDrivers(driversResponse.data)
      }

      // Load pending DVIRs (admin only)
      const user = devapi.getUser()
      if (user?.role === 'ADMIN') {
        const pendingResponse = await devapi.getPendingDvirs()
        if (pendingResponse.success && pendingResponse.data) {
          setPendingDvirs(pendingResponse.data)
        }
      }
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const loadDriverDvirs = async (driverId: string) => {
    try {
      const response = await devapi.getDriverDvirs(driverId)
      if (response.success && response.data) {
        setDvirs(response.data)
      }
    } catch (error) {
      toast.error('Failed to load DVIRs')
    }
  }

  const handleSubmitDvir = async () => {
    if (!selectedDriver) {
      toast.error('Please select a driver')
      return
    }

    const canvas = canvasRef.current
    let signature = ''
    if (canvas) {
      signature = canvas.toDataURL()
    }

    try {
      setLoading(true)
      const response = await devapi.submitDvir({
        vehicleId: vehicleId || undefined,
        inspectionType,
        odometer: odometer ? parseInt(odometer) : undefined,
        checklistItems: checklist,
        defectsFound,
        defectDescription: defectDescription || undefined,
        safeToOperate,
        driverSignature: signature,
      })

      if (response.success) {
        toast.success('DVIR submitted successfully')
        resetForm()
        setView('list')
        loadData()
      } else {
        toast.error(response.error || 'Failed to submit DVIR')
      }
    } catch (error) {
      toast.error('Error submitting DVIR')
    } finally {
      setLoading(false)
    }
  }

  const handleMechanicSignOff = async () => {
    if (!selectedDvir) return

    try {
      setLoading(true)
      const response = await devapi.updateDvir(selectedDvir.id.toString(), {
        mechanicNotes,
        status: 'COMPLETED'
      })

      if (response.success) {
        toast.success('DVIR signed off successfully')
        setView('list')
        loadData()
      } else {
        toast.error(response.error || 'Failed to sign off DVIR')
      }
    } catch (error) {
      toast.error('Error signing off DVIR')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedDriver('')
    setVehicleId('')
    setInspectionType('PRE_TRIP')
    setOdometer('')
    setChecklist(CHECKLIST_ITEMS)
    setDefectsFound(false)
    setDefectDescription('')
    setSafeToOperate(true)
    clearSignature()
  }

  const handleChecklistChange = (item: string, checked: boolean) => {
    setChecklist(prev => ({ ...prev, [item]: checked }))
  }

  // Signature canvas handlers (mouse and touch support)
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0]
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      }
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const coords = getCoordinates(e, canvas)
    ctx.beginPath()
    ctx.moveTo(coords.x, coords.y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const coords = getCoordinates(e, canvas)
    ctx.lineTo(coords.x, coords.y)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const getDriverName = (driver: Driver) => {
    if (driver.firstName || driver.lastName) {
      return `${driver.firstName || ''} ${driver.lastName || ''}`.trim()
    }
    return driver.username
  }

  const viewDvirDetail = async (dvir: DvirReport) => {
    setSelectedDvir(dvir)
    setMechanicNotes(dvir.mechanicNotes || '')
    setView('detail')
  }

  if (loading && view === 'list') {
    return (
      <div className="p-6 bg-[#0f0f0f] min-h-screen flex items-center justify-center">
        <div className="text-gray-300">Loading DVIR data...</div>
      </div>
    )
  }

  // CREATE VIEW
  if (view === 'create') {
    return (
      <div className="p-6 bg-[#0f0f0f] min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">New DVIR</h1>
            <button
              onClick={() => setView('list')}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Driver *</label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                >
                  <option value="">Select Driver</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {getDriverName(driver)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Inspection Type *</label>
                <select
                  value={inspectionType}
                  onChange={(e) => setInspectionType(e.target.value as 'PRE_TRIP' | 'POST_TRIP')}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                >
                  <option value="PRE_TRIP">Pre-Trip</option>
                  <option value="POST_TRIP">Post-Trip</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Vehicle ID</label>
                <input
                  type="text"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  placeholder="e.g., TRUCK-001"
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Odometer</label>
                <input
                  type="number"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  placeholder="Current mileage"
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                />
              </div>
            </div>

            {/* Checklist */}
            <div>
              <h3 className="text-white font-medium mb-3">Inspection Checklist</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(checklist).map((item) => (
                  <label key={item} className="flex items-center gap-2 text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist[item as keyof typeof checklist]}
                      onChange={(e) => handleChecklistChange(item, e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Defects */}
            <div>
              <label className="flex items-center gap-2 text-white cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={defectsFound}
                  onChange={(e) => setDefectsFound(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="font-medium">Defects Found</span>
              </label>

              {defectsFound && (
                <textarea
                  value={defectDescription}
                  onChange={(e) => setDefectDescription(e.target.value)}
                  placeholder="Describe defects in detail..."
                  rows={4}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white"
                />
              )}
            </div>

            {/* Safe to Operate */}
            <div>
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={safeToOperate}
                  onChange={(e) => setSafeToOperate(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="font-medium">Vehicle is Safe to Operate</span>
              </label>
            </div>

            {/* Signature */}
            <div>
              <h3 className="text-white font-medium mb-3">Driver Signature</h3>
              <div className="bg-white rounded p-2 mb-2">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="border border-gray-300 cursor-crosshair"
                />
              </div>
              <button
                onClick={clearSignature}
                className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Clear Signature
              </button>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmitDvir}
              disabled={loading}
              className="w-full px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Submitting...' : 'Submit DVIR'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // DETAIL VIEW
  if (view === 'detail' && selectedDvir) {
    return (
      <div className="p-6 bg-[#0f0f0f] min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">DVIR Details</h1>
            <button
              onClick={() => setView('list')}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Back to List
            </button>
          </div>

          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-3 gap-4 pb-6 border-b border-gray-800">
              <div>
                <p className="text-sm text-gray-400">Type</p>
                <p className="text-white font-medium">{selectedDvir.inspectionType.replace('_', '-')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className={`font-medium ${
                  selectedDvir.status === 'COMPLETED' ? 'text-green-500' :
                  'text-yellow-500'
                }`}>
                  {selectedDvir.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Date</p>
                <p className="text-white">{new Date(selectedDvir.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Checklist Results */}
            <div>
              <h3 className="text-white font-medium mb-3">Checklist Results</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selectedDvir.checklistItems).map(([item, passed]) => (
                  <div key={item} className="flex items-center gap-2">
                    {passed ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <XCircle size={16} className="text-red-500" />
                    )}
                    <span className="text-sm text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Defects */}
            {selectedDvir.defectsFound && (
              <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={20} className="text-yellow-500" />
                  <h3 className="text-white font-medium">Defects Found</h3>
                </div>
                <p className="text-gray-300 text-sm">{selectedDvir.defectDescription}</p>
                <p className="text-sm mt-2">
                  <span className="text-gray-400">Safe to Operate: </span>
                  <span className={selectedDvir.safeToOperate ? 'text-green-500' : 'text-red-500'}>
                    {selectedDvir.safeToOperate ? 'Yes' : 'No'}
                  </span>
                </p>
              </div>
            )}

            {/* Driver Signature */}
            {selectedDvir.driverSignature && (
              <div>
                <h3 className="text-white font-medium mb-2">Driver Signature</h3>
                <img src={selectedDvir.driverSignature} alt="Signature" className="border border-gray-700 rounded bg-white" />
              </div>
            )}

            {/* Mechanic Sign-Off (Admin Only) */}
            {userRole === 'ADMIN' && selectedDvir.status === 'pending' && (
              <div className="pt-6 border-t border-gray-800">
                <h3 className="text-white font-medium mb-3">Mechanic Sign-Off</h3>
                <textarea
                  value={mechanicNotes}
                  onChange={(e) => setMechanicNotes(e.target.value)}
                  placeholder="Add mechanic notes..."
                  rows={4}
                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-gray-800 rounded text-white mb-3"
                />
                <button
                  onClick={handleMechanicSignOff}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Signing Off...' : 'Complete Sign-Off'}
                </button>
              </div>
            )}

            {/* Mechanic Notes (If Signed) */}
            {selectedDvir.mechanicNotes && (
              <div className="pt-6 border-t border-gray-800">
                <h3 className="text-white font-medium mb-2">Mechanic Notes</h3>
                <p className="text-gray-300 text-sm">{selectedDvir.mechanicNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // LIST VIEW (DEFAULT)
  return (
    <div className="p-6 bg-[#0f0f0f] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">DVIR Management</h1>
        <button
          onClick={() => setView('create')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
        >
          <Plus size={18} />
          New DVIR
        </button>
      </div>

      {/* Pending DVIRs (Admin Only) */}
      {userRole === 'ADMIN' && pendingDvirs.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-3">Pending Review</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingDvirs.map((dvir) => (
              <div
                key={dvir.id}
                className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 cursor-pointer hover:bg-yellow-900/30"
                onClick={() => viewDvirDetail(dvir)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-medium">{dvir.inspectionType.replace('_', '-')}</h3>
                  <span className="px-2 py-1 bg-yellow-700 text-yellow-200 text-xs rounded">
                    Pending
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  {new Date(dvir.createdAt).toLocaleDateString()}
                </p>
                {dvir.defectsFound && (
                  <div className="flex items-center gap-1 text-yellow-500 text-sm">
                    <AlertTriangle size={14} />
                    <span>Defects Found</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Driver Selector */}
      <div className="mb-6">
        <label className="block text-sm text-gray-400 mb-2">View DVIRs for Driver:</label>
        <select
          onChange={(e) => e.target.value && loadDriverDvirs(e.target.value)}
          className="w-64 px-3 py-2 bg-[#1a1a1a] border border-gray-800 rounded text-white"
        >
          <option value="">Select a driver...</option>
          {drivers.map(driver => (
            <option key={driver.id} value={driver.id}>
              {getDriverName(driver)}
            </option>
          ))}
        </select>
      </div>

      {/* DVIR List */}
      {dvirs.length === 0 ? (
        <div className="text-center py-12 bg-[#1a1a1a] border border-gray-800 rounded-lg">
          <FileText size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">No DVIRs found</p>
          <p className="text-sm text-gray-500 mt-1">Select a driver to view their inspection reports</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dvirs.map((dvir) => (
            <div
              key={dvir.id}
              className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 cursor-pointer hover:border-gray-700"
              onClick={() => viewDvirDetail(dvir)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-white font-medium">{dvir.inspectionType.replace('_', '-')}</h3>
                <span className={`px-2 py-1 text-xs rounded ${
                  dvir.status === 'COMPLETED' ? 'bg-green-700 text-green-200' :
                  'bg-yellow-700 text-yellow-200'
                }`}>
                  {dvir.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={14} />
                  <span>{new Date(dvir.createdAt).toLocaleDateString()}</span>
                </div>
                {dvir.vehicleId && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Truck size={14} />
                    <span>{dvir.vehicleId}</span>
                  </div>
                )}
                {dvir.defectsFound && (
                  <div className="flex items-center gap-2 text-yellow-500">
                    <AlertTriangle size={14} />
                    <span>Defects Found</span>
                  </div>
                )}
              </div>

              <button
                className="mt-3 w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-1"
              >
                <Eye size={16} />
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
