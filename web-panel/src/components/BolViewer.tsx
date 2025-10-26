'use client'

import { useState, useEffect, useRef } from 'react'
import { devapi } from '@/lib/devapi'
import toast from 'react-hot-toast'
import { Upload, Download, Trash2, FileText, Image as ImageIcon, X, Eye } from 'lucide-react'
import type { JobAttachment } from '@/types/api'

interface BolViewerProps {
  jobId?: string
  onClose?: () => void
}

export default function BolViewer({ jobId, onClose }: BolViewerProps) {
  const [documents, setDocuments] = useState<JobAttachment[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<JobAttachment | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [signatureMode, setSignatureMode] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    if (jobId) {
      loadDocuments()
    }
  }, [jobId])

  const loadDocuments = async () => {
    if (!jobId) return

    try {
      setLoading(true)
      const response = await devapi.getJobDocuments(jobId)
      if (response.success && response.data) {
        setDocuments(response.data)
      } else {
        toast.error('Failed to load documents')
      }
    } catch (error) {
      toast.error('Error loading documents')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only images (JPEG, PNG, HEIC) and PDFs are allowed')
      return
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    try {
      setUploading(true)
      const response = await devapi.uploadDocument(file, jobId, 'BOL')

      if (response.success) {
        toast.success('Document uploaded successfully')
        loadDocuments()
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        toast.error(response.error || 'Failed to upload document')
      }
    } catch (error) {
      toast.error('Error uploading document')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (documentId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const response = await devapi.deleteDocument(documentId.toString())
      if (response.success) {
        toast.success('Document deleted')
        loadDocuments()
      } else {
        toast.error(response.error || 'Failed to delete document')
      }
    } catch (error) {
      toast.error('Error deleting document')
    }
  }

  const handleDownload = (doc: JobAttachment) => {
    const url = devapi.getDocumentUrl(doc.id.toString())
    const a = document.createElement('a')
    a.href = url
    a.download = doc.fileName
    a.click()
    toast.success('Downloading...')
  }

  const handlePreview = (doc: JobAttachment) => {
    setSelectedDocument(doc)
    setShowPreview(true)
  }

  const getFileIcon = (fileType?: string) => {
    if (fileType && fileType.startsWith('image/')) {
      return <ImageIcon size={20} />
    }
    return <FileText size={20} />
  }

  // Signature canvas handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
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

  const saveSignature = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], 'signature.png', { type: 'image/png' })

      try {
        setUploading(true)
        const response = await devapi.uploadDocument(file, jobId, 'signature')
        if (response.success) {
          toast.success('Signature saved')
          setSignatureMode(false)
          clearSignature()
          loadDocuments()
        } else {
          toast.error('Failed to save signature')
        }
      } catch (error) {
        toast.error('Error saving signature')
      } finally {
        setUploading(false)
      }
    })
  }

  if (loading) {
    return (
      <div className="p-6 bg-[#0f0f0f] min-h-screen flex items-center justify-center">
        <div className="text-gray-300">Loading documents...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#0f0f0f] min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">BOL Documents</h1>
          {jobId && <p className="text-sm text-gray-400 mt-1">Job #{jobId}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleFileSelect}
            disabled={uploading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Upload size={18} />
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
          <button
            onClick={() => setSignatureMode(!signatureMode)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {signatureMode ? 'Cancel Signature' : 'Capture Signature'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/heic,application/pdf"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Signature Canvas */}
      {signatureMode && (
        <div className="mb-6 p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg">
          <h3 className="text-white font-medium mb-3">Customer Signature</h3>
          <div className="bg-white rounded-lg p-2 mb-3">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className="border border-gray-300 cursor-crosshair"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveSignature}
              disabled={uploading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Save Signature
            </button>
            <button
              onClick={clearSignature}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="text-center py-12 bg-[#1a1a1a] border border-gray-800 rounded-lg">
          <FileText size={48} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">No documents uploaded yet</p>
          <p className="text-sm text-gray-500 mt-1">Click Upload Document to add BOL photos or PDFs</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition"
            >
              {/* Document Preview Thumbnail */}
              <div className="mb-3 h-40 bg-[#0f0f0f] rounded flex items-center justify-center">
                {doc.fileType && doc.fileType.startsWith('image/') ? (
                  <img
                    src={devapi.getDocumentUrl(doc.id.toString())}
                    alt={doc.fileName}
                    className="max-h-full max-w-full rounded"
                  />
                ) : (
                  <FileText size={64} className="text-gray-600" />
                )}
              </div>

              {/* Document Info */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  {getFileIcon(doc.fileType)}
                  <h3 className="text-white font-medium text-sm truncate flex-1">
                    {doc.fileName}
                  </h3>
                </div>
                <p className="text-xs text-gray-400">
                  Type: {doc.attachmentType}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handlePreview(doc)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center gap-1 text-sm"
                >
                  <Eye size={16} />
                  View
                </button>
                <button
                  onClick={() => handleDownload(doc)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-1 text-sm"
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  title="Delete"
                  aria-label={`Delete document ${doc.fileName}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedDocument && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-white font-bold">{selectedDocument.fileName}</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {selectedDocument.fileType && selectedDocument.fileType.startsWith('image/') ? (
                <img
                  src={devapi.getDocumentUrl(selectedDocument.id.toString())}
                  alt={selectedDocument.fileName}
                  className="max-w-full mx-auto"
                />
              ) : selectedDocument.fileType === 'application/pdf' ? (
                <iframe
                  src={devapi.getDocumentUrl(selectedDocument.id.toString())}
                  className="w-full h-[70vh]"
                  title={selectedDocument.fileName}
                />
              ) : (
                <div className="text-center py-12 text-gray-400">
                  Preview not available for this file type
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-gray-800">
              <button
                onClick={() => handleDownload(selectedDocument)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
              >
                <Download size={18} />
                Download
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
