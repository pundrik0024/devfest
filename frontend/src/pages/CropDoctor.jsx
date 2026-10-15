import { useState, useEffect, useRef } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Share2, Camera, Upload, Loader2, AlertTriangle, ShoppingCart, Phone, ChevronRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { SampleDataLabel, AIDisclaimer, SampleDataBanner } from '../components/ui/SampleDataLabel'
import ProductCard from '../components/ui/ProductCard'
import { useLang } from '../context/LangContext'
import { apiFetch } from '../lib/api'

const CONFIDENCE_CONFIG = {
  high:   { cls: 'badge-green',  label: 'High Confidence', icon: '✅' },
  medium: { cls: 'badge-amber',  label: 'Medium Confidence', icon: '⚡' },
  low:    { cls: 'badge-red',    label: 'Low Confidence',  icon: '⚠️' },
}
const SEVERITY_CONFIG = {
  mild:     { cls: 'badge-green',  label: 'Mild Severity' },
  moderate: { cls: 'badge-amber',  label: 'Moderate Severity' },
  severe:   { cls: 'badge-red',    label: 'Severe — Act Now' },
}
const STEP_COLORS = ['bg-blue-50 border-blue-200', 'bg-amber-50 border-amber-200', 'bg-green-50 border-green-200']

export default function CropDoctor() {
  const { t } = useLang()
  const location = useLocation()
  const { addItem } = useCart()
  const fileRef = useRef(null)

  const [result, setResult] = useState(location.state?.result || null)
  const [imageUrl, setImageUrl] = useState(null)
  const [scanFile, setScanFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shareMsg, setShareMsg] = useState('')

  const diagnosis = result?.diagnosis
  const products  = result?.recommended_products || []
  const scanId    = result?.scan_id || 'ARV-DEMO'

  const handleFile = (file) => {
    if (!file) return
    setScanFile(file)
    setImageUrl(URL.createObjectURL(file))
    setResult(null)
  }

  const handleScan = async () => {
    if (!scanFile) return
    setLoading(true)
    setError('')
    const form = new FormData()
    form.append('image', scanFile)
    try {
      const res = await apiFetch('/api/crop-doctor', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Scan failed')
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const text = `Crop Doctor Result — ${diagnosis?.disease || ''} on ${diagnosis?.crop || ''}. Scan ID: ${scanId}`
    if (navigator.share) {
      await navigator.share({ title: 'Sentri Crop Doctor', text })
    } else {
      navigator.clipboard.writeText(text)
      setShareMsg('Copied to clipboard!')
      setTimeout(() => setShareMsg(''), 2000)
    }
  }

  return (
    <div className="max-w-container mx-auto px-3 md:px-6 py-4 md:py-6">

      {/* Breadcrumb */}
      <nav className="text-xs text-text-muted mb-4 flex items-center gap-1 flex-wrap">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-text-primary font-medium">Crop Doctor</span>
        {result && <><ChevronRight className="w-3 h-3" /><span className="text-text-primary">Scan Result #{scanId}</span></>}
      </nav>

      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary">{t('cropDoctor.title')}</h1>
          {result && (
            <p className="text-xs text-text-muted mt-0.5">
              Scanned today · Scan ID: {scanId}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {result && (
            <>
              <button onClick={handleShare} className="btn-outline text-xs">
                <Share2 className="w-4 h-4" />
                {shareMsg || t('cropDoctor.shareBtn')}
              </button>
              <button onClick={() => { setResult(null); setScanFile(null); setImageUrl(null) }} className="btn-green text-xs">
                <Camera className="w-4 h-4" />
                {t('cropDoctor.newScan')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Upload state (no result yet) ── */}
      {!result && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="card text-center">
            <h2 className="font-semibold text-text-primary mb-4">Upload a Leaf Photo</h2>
            <label className="border-2 border-dashed border-primary-300 rounded-lg p-8 flex flex-col items-center gap-3 cursor-pointer hover:bg-primary-50 transition-colors block">
              {imageUrl ? (
                <img src={imageUrl} alt="Leaf preview" className="max-h-56 rounded-lg object-contain" />
              ) : (
                <>
                  <Upload className="w-10 h-10 text-primary-400" />
                  <span className="text-sm text-text-muted">Drag & drop or tap to choose a leaf image</span>
                  <span className="text-xxs text-text-muted">JPEG, PNG or WebP · max 5 MB</span>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                className="sr-only" onChange={e => handleFile(e.target.files[0])} />
            </label>

            <label className="btn-outline w-full mt-3 cursor-pointer flex items-center justify-center gap-2 min-touch">
              <Camera className="w-4 h-4" /> Capture with Camera
              <input type="file" accept="image/*" capture="environment" className="sr-only"
                onChange={e => handleFile(e.target.files[0])} />
            </label>

            {scanFile && (
              <button onClick={handleScan} disabled={loading} className="btn-green w-full mt-3">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '🔬'}
                {loading ? 'Analysing with Gemini AI…' : 'Analyse Leaf Disease'}
              </button>
            )}

            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Diagnosis result ── */}
      {result && diagnosis && (
        <div className="space-y-6">

          {/* ── Expert block (low confidence) ── */}
          {result.show_expert_block && (
            <div className="card bg-amber-50 border-amber-300">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800">{t('cropDoctor.expertHelp')}</h3>
                  <p className="text-xs text-amber-700 mt-1">
                    The image was unclear or confidence is low. Please consult a local agriculture expert for a reliable diagnosis.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <a href="tel:[Helpline number]" className="btn-primary text-xs">
                      <Phone className="w-3.5 h-3.5" /> Call [Helpline number]
                    </a>
                    <button className="btn-outline text-xs">Request Mewari / Hindi Callback</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Main report ── */}
          <div className="card">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xxs font-semibold text-text-muted uppercase tracking-wide">Clinical AI-Pathology Report</span>
              <span className="badge-gray text-xxs">Fungal Infection</span>
            </div>
            <p className="text-xs text-text-muted mb-4 italic">Diagnostic Specimen: {diagnosis.crop} Leaf Sample</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image */}
              <div>
                {imageUrl && (
                  <img src={imageUrl} alt="Scanned leaf" className="w-full rounded-lg object-cover max-h-64" />
                )}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {[
                    { label: 'Area Infected', value: diagnosis.severity === 'severe' ? '38%+' : diagnosis.severity === 'moderate' ? '18%' : '8%' },
                    { label: 'Time Elapsed', value: 'Diminishing' },
                    { label: 'Growth Rate', value: 'Rapid (2d)' },
                    { label: 'Spread Risk', value: diagnosis.severity === 'severe' ? 'High' : 'Moderate' },
                  ].map(m => (
                    <div key={m.label} className="bg-gray-50 rounded-lg p-2 text-center">
                      <p className="text-xxs text-text-muted">{m.label}</p>
                      <p className="font-semibold text-sm text-text-primary">{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnosis details */}
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="badge-red text-xs">Fungal Infection</span>
                  <span className={`${CONFIDENCE_CONFIG[diagnosis.confidence]?.cls || 'badge-gray'} text-xs`}>
                    {CONFIDENCE_CONFIG[diagnosis.confidence]?.icon} {CONFIDENCE_CONFIG[diagnosis.confidence]?.label || diagnosis.confidence}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-text-primary mb-1">{diagnosis.disease}</h2>
                <p className="text-xs text-text-muted mb-4 italic">on {diagnosis.crop}</p>

                {/* Symptoms */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-text-primary mb-2 flex items-center gap-1">
                    🔴 Symptoms Confirmed
                  </p>
                  <ul className="space-y-1">
                    {(diagnosis.symptoms || []).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-text-muted">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Severity */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xxs font-semibold text-text-muted mb-1 uppercase">Pathogen Severity Index</p>
                  <div className="flex items-center gap-2">
                    <span className={`${SEVERITY_CONFIG[diagnosis.severity]?.cls || 'badge-gray'}`}>
                      {SEVERITY_CONFIG[diagnosis.severity]?.label || diagnosis.severity}
                    </span>
                    <span className="text-xs text-text-muted">Stage 2</span>
                    <span className="badge-red text-xxs ml-auto">Action required</span>
                  </div>
                  <p className="text-xxs text-text-muted mt-2">
                    Intervene immediately before fungal-mycotoxin penetration into stem collets and flower clusters.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── 3-Step Action Protocol ── */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-text-primary">{t('cropDoctor.3step')}</h3>
              <span className="text-xxs text-text-muted">Based on IPM Schedule</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(diagnosis.action_protocol || []).map((step, i) => (
                <div key={step.step} className={`rounded-card border p-4 ${STEP_COLORS[i] || 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 bg-white rounded-full flex items-center justify-center font-bold text-sm border">
                      {String(step.step).padStart(2, '0')}
                    </span>
                    {i === 0 && <span className="badge-red text-xxs">Immediate · Day 1</span>}
                    {i === 1 && <span className="badge-amber text-xxs">Chemical Control</span>}
                    {i === 2 && <span className="badge-green text-xxs">Prevention First</span>}
                  </div>
                  <h4 className="font-semibold text-sm text-text-primary mb-1">{step.title}</h4>
                  <p className="text-xs text-text-muted leading-relaxed">{step.detail}</p>
                  {step.timing && (
                    <p className="text-xxs text-text-muted mt-2 italic">{step.timing}</p>
                  )}
                </div>
              ))}
            </div>
            <AIDisclaimer className="mt-3" />
          </div>

          {/* ── Recommended products ── */}
          {products.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-text-primary">{t('cropDoctor.recommended')} for {diagnosis.disease}</h3>
                <span className="text-xxs text-text-muted">Express Delivery: Tomorrow by 11 AM</span>
              </div>
              <SampleDataBanner />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}

          {/* ── Expert help block (always shown below result) ── */}
          <div className="card bg-primary-50 border-primary-200">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-lg">👨‍🌾</span>
                </div>
                <div>
                  <p className="text-xxs text-text-muted mb-0.5">[Expert name] · [Organisation]</p>
                  <h3 className="font-bold text-text-primary">{t('cropDoctor.expertHelp')}</h3>
                  <p className="text-xs text-text-muted mt-1">
                    Connect with a local agronomist for field inspection, dosage calculation for your specific soil pH, or Mewari voice advisory.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                <a href="tel:[Helpline number]" className="btn-primary text-xs">
                  <Phone className="w-3.5 h-3.5" /> Call Now ([Helpline number])
                </a>
                <button className="btn-outline text-xs">Request Hindi / Mewari Callback</button>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
