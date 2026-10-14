import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Upload, Loader2, AlertCircle, X, ScanLine } from 'lucide-react'
import { useLang } from '../../../context/LangContext'
import { apiFetch } from '../../../lib/api'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

/**
 * LeafScanUpload
 * Compact "Identify Leaf Disease in 5 Seconds" panel shown on the Home page
 * right-side AI assistant section.
 *
 * Props:
 *   onScanComplete(result) — called after a successful /api/crop-doctor response
 */
export default function LeafScanUpload({ onScanComplete }) {
  const { t } = useLang()
  const navigate = useNavigate()

  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [sizeWarning, setSizeWarning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const dropZoneRef = useRef(null)

  // ─── helpers ────────────────────────────────────────────────────────────────

  function resetState() {
    setSelectedFile(null)
    setPreview(null)
    setSizeWarning(false)
    setError(null)
  }

  function applyFile(file) {
    if (!file) return

    setError(null)

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSizeWarning(true)
    } else {
      setSizeWarning(false)
    }

    setSelectedFile(file)
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
  }

  // ─── file-input handlers ─────────────────────────────────────────────────────

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) applyFile(file)
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  // ─── drag-and-drop handlers ──────────────────────────────────────────────────

  function handleDragOver(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    e.stopPropagation()
    // Only clear when leaving the drop zone itself, not a child element
    if (!dropZoneRef.current?.contains(e.relatedTarget)) {
      setIsDragging(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      applyFile(file)
    } else if (file) {
      setError(t('leafscan.errorNotImage') || 'Please drop an image file.')
    }
  }

  // ─── scan ────────────────────────────────────────────────────────────────────

  async function handleScan() {
    if (!selectedFile) return
    if (sizeWarning) {
      setError(t('leafscan.errorTooLarge') || 'Image exceeds 5 MB limit. Please choose a smaller file.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await apiFetch('/api/crop-doctor', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errJson = await response.json().catch(() => null)
        throw new Error(
          errJson?.detail ||
            errJson?.message ||
            `Server error: ${response.status}`
        )
      }

      const result = await response.json()

      if (typeof onScanComplete === 'function') {
        onScanComplete(result)
      }

      navigate('/crop-doctor', { state: { scanResult: result } })
    } catch (err) {
      console.error('[LeafScan] scan error:', err)
      setError(
        err.message ||
          t('leafscan.errorGeneric') ||
          'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ─── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="card p-4 flex flex-col gap-3 w-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ScanLine className="w-5 h-5 text-primary shrink-0" />
        <h3 className="text-sm font-semibold text-gray-800 leading-tight">
          {t('leafscan.title') || 'Identify Leaf Disease'}
          <span className="ml-1 text-xxs font-normal text-gray-400 whitespace-nowrap">
            {t('leafscan.subtitle') || 'in 5 seconds'}
          </span>
        </h3>
      </div>

      {/* Drop zone */}
      {!preview ? (
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label={t('leafscan.dropzoneAriaLabel') || 'Drop or click to upload a leaf image'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
          className={[
            'relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed',
            'cursor-pointer select-none transition-colors duration-200 min-h-[120px] p-4',
            isDragging
              ? 'border-primary bg-green-50'
              : 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-green-50',
          ].join(' ')}
        >
          <Upload
            className={[
              'w-8 h-8 transition-colors',
              isDragging ? 'text-primary' : 'text-gray-400',
            ].join(' ')}
          />
          <p className="text-xs text-center text-gray-500 leading-snug">
            <span className="font-medium text-primary">
              {t('leafscan.clickToUpload') || 'Click to upload'}
            </span>
            {' '}
            {t('leafscan.orDrag') || 'or drag & drop'}
          </p>
          <p className="text-xxs text-gray-400">
            JPG, PNG, WEBP · max 5 MB
          </p>

          {/* Hidden gallery file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
            aria-hidden="true"
          />
        </div>
      ) : (
        /* Preview thumbnail */
        <div className="relative w-full flex justify-center">
          <div className="relative inline-block">
            <img
              src={preview}
              alt={t('leafscan.previewAlt') || 'Selected leaf image'}
              className="rounded-xl object-cover border border-gray-200 shadow-sm"
              style={{ maxHeight: '200px', maxWidth: '100%' }}
            />
            {/* Remove button */}
            <button
              type="button"
              onClick={resetState}
              aria-label={t('leafscan.removeImage') || 'Remove image'}
              className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-0.5 shadow hover:bg-red-50 hover:border-red-300 transition-colors min-touch"
            >
              <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
            </button>
          </div>
        </div>
      )}

      {/* Size warning */}
      {sizeWarning && (
        <div className="flex items-start gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
          <AlertCircle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
          <p className="text-xxs text-amber-700 leading-snug">
            {t('leafscan.warnLargeFile') ||
              'Image is larger than 5 MB. Scan may be slower or fail. Consider using a smaller image.'}
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-2"
        >
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xxs text-red-700 leading-snug">{error}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {/* Camera capture — native camera on mobile */}
        <button
          type="button"
          aria-label={t('leafscan.openCamera') || 'Open camera'}
          onClick={() => cameraInputRef.current?.click()}
          disabled={loading}
          className="btn-outline flex items-center justify-center gap-1.5 flex-1 text-xs py-2 min-touch disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="w-4 h-4 shrink-0" />
          <span className="hidden xs:inline">{t('leafscan.camera') || 'Camera'}</span>
        </button>

        {/* Hidden camera input */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={handleFileChange}
          aria-hidden="true"
        />

        {/* Scan Now */}
        <button
          type="button"
          onClick={handleScan}
          disabled={!selectedFile || loading}
          className="btn-primary flex items-center justify-center gap-1.5 flex-[2] text-xs py-2 min-touch disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              {t('leafscan.scanning') || 'Scanning\u2026'}
            </>
          ) : (
            <>
              <ScanLine className="w-4 h-4 shrink-0" />
              {t('leafscan.scanNow') || 'Scan Now'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
