import { useState, useEffect } from 'react'
import { Loader2, AlertTriangle, Download, Satellite } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { SampleDataLabel, SampleDataBanner, AIDisclaimer } from '../components/ui/SampleDataLabel'
import { useLang } from '../context/LangContext'

const RISK_CONFIG = {
  Low:      { cls: 'badge-green',  color: 'text-green-700',  bg: 'bg-green-100'  },
  Medium:   { cls: 'badge-amber',  color: 'text-amber-700',  bg: 'bg-amber-100'  },
  High:     { cls: 'badge-orange', color: 'text-orange-700', bg: 'bg-orange-100' },
  Critical: { cls: 'badge-red',    color: 'text-red-700',    bg: 'bg-red-100'    },
}

const STATUS_CHIP = {
  'Dry (Fair — 22–35%)': 'badge-amber',
  'Low (Benchmark: >0.5%)': 'badge-red',
  'Normal / Safe': 'badge-green',
  'Safe Calcareous': 'badge-green',
  'Moderate Risk (Risk)': 'badge-amber',
}

const STEP_COLORS = ['border-blue-200 bg-blue-50','border-amber-200 bg-amber-50','border-green-200 bg-green-50']

export default function SoilPlan() {
  const { t } = useLang()
  const { addItem } = useCart()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')
  const [kitAdded, setKitAdded] = useState(false)

  useEffect(() => {
    fetch('/api/soil-plan')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setError('Could not load soil plan data'))
      .finally(() => setLoading(false))
  }, [])

  const handleAddKit = () => {
    if (data?.recommended_kit) {
      addItem(data.recommended_kit)
      setKitAdded(true)
    }
  }

  const riskCfg = RISK_CONFIG[data?.risk_level] || RISK_CONFIG.Medium

  return (
    <div className="max-w-container mx-auto px-3 md:px-6 py-4 md:py-6">
      {/* Satellite activity bar */}
      <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="font-semibold">Satellite Actively Active</span>
        <span className="text-text-muted">· Sentinel-2 (Trusted data: Gate-indexed 20 fortnightly)</span>
      </div>

      <h1 className="text-xl md:text-2xl font-bold text-text-primary mb-1">{t('soilPlan.title')}</h1>
      <p className="text-xs text-text-muted mb-6">Precision agro-hydrology monitor calibrated for Calcareous Aravalli Alluvium and interconnected lake flooding.</p>

      {loading && <div className="flex items-center justify-center h-40 gap-2 text-text-muted"><Loader2 className="w-6 h-6 animate-spin text-primary" /> Loading soil data…</div>}
      {error && <div className="card bg-red-50 border-red-200 text-red-700 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {error}</div>}

      {data && !loading && (
        <div className="space-y-6">
          <SampleDataBanner />

          {/* ── Degradation Index + Metrics ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Index card */}
            <div className="card lg:col-span-2">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xxs font-semibold text-text-muted uppercase tracking-wide block mb-1">[Partner name] · ICRM Soil Standard</span>
                  <h2 className="font-bold text-text-primary">{t('soilPlan.degradationIndex')}</h2>
                  <p className="text-xs text-text-muted mt-1">
                    Post-zone moisture offset compounded by depleted organic carbon; immediate surface mulching recommended
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xxs text-text-muted">Field Verification</p>
                  <p className="text-xxs text-text-muted">Low Consolidated</p>
                </div>
              </div>

              {/* Big score gauge */}
              <div className="flex items-center gap-6 mb-6">
                <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center border-4 ${data.risk_level === 'Low' ? 'border-green-400' : data.risk_level === 'Medium' ? 'border-amber-400' : 'border-red-400'}`}>
                  <span className="text-2xl font-bold text-text-primary">{data.degradation_index}</span>
                  <span className="text-xxs text-text-muted">/ 100</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Risk Level: <span className={riskCfg.color}>{data.risk_level}</span></p>
                  <span className={`badge mt-1 ${riskCfg.cls}`}>{data.risk_level} — Reconsider</span>
                </div>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { label: 'Moisture Index', value: `${data.metrics?.moisture_pct}%`, status: data.metrics?.moisture_status, key: 'moisture' },
                  { label: 'Organic Carbon', value: `${data.metrics?.organic_carbon_pct}%`, status: data.metrics?.organic_carbon_status, key: 'oc' },
                  { label: 'Salinity (DS/M)', value: `${data.metrics?.salinity_ds_m}`, status: data.metrics?.salinity_status, key: 'sal' },
                  { label: 'Acidity / pH', value: `${data.metrics?.ph} pH`, status: data.metrics?.ph_status, key: 'ph' },
                  { label: 'Erosion Gradient', value: `${data.metrics?.erosion_hydro_gradient}%`, status: data.metrics?.erosion_status, key: 'er' },
                  { label: 'Slope Direction', value: data.metrics?.erosion_direction?.split(' ')[0], status: 'Moderate Risk (Risk)', key: 'sl' },
                ].map(m => (
                  <div key={m.key} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xxs text-text-muted mb-0.5">{m.label}</p>
                    <p className="font-bold text-text-primary text-sm">{m.value} <SampleDataLabel /></p>
                    {m.status && (
                      <span className={`badge text-xxs mt-1 ${STATUS_CHIP[m.status] || 'badge-gray'}`}>{m.status}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Spectral NDRE */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-text-primary text-sm">Spectral NDRE Layer</h3>
                <span className="text-xxs text-text-muted">10m/px</span>
              </div>
              <div className="w-full h-36 bg-gradient-to-br from-red-200 via-amber-100 to-green-200 rounded-lg flex items-center justify-center mb-3">
                <div className="text-center">
                  <span className="text-3xl">🛰️</span>
                  <p className="text-xxs text-text-muted mt-1">Sentinel-2 NDRE</p>
                  <p className="text-xxs text-text-muted">{data.spectral_ndre?.image_date}</p>
                </div>
              </div>
              <div className="text-xxs text-text-muted space-y-1">
                <p>Spectral Vigour: <span className="text-red-600 font-medium">Low</span></p>
                <p>Chlorophyll Deficit: {data.spectral_ndre?.low_ndre_area_pct}% area <SampleDataLabel /></p>
                <p>High Stress Zones: {data.spectral_ndre?.high_stress_zones}</p>
              </div>
              <button className="btn-outline w-full text-xs mt-3 gap-2">
                <Download className="w-3.5 h-3.5" /> Download Full Spectral DcTiff
              </button>
            </div>
          </div>

          {/* ── 3-Step Remediation ── */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xxs text-text-muted uppercase font-semibold tracking-wide block mb-0.5">Agronomic Soil Plan</span>
                <h2 className="font-bold text-text-primary">{t('soilPlan.remediation')}</h2>
              </div>
              <span className="text-xxs text-text-muted">[Partner] Udaipur Agronomy Desk</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {(data.remediation_plan || []).map((step, i) => (
                <div key={step.step} className={`rounded-card border p-4 ${STEP_COLORS[i]}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 bg-white rounded-full flex items-center justify-center font-bold text-sm border">
                      {step.step}
                    </span>
                    <span className={`badge text-xxs ${i === 0 ? 'badge-red' : i === 1 ? 'badge-amber' : 'badge-green'}`}>
                      {step.phase || (i === 0 ? 'Phase 1 — Immediate' : i === 1 ? 'Phase 2 — Day 3-5' : 'Phase 3 — Day 11')}
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm text-text-primary mb-1">{step.title}</h4>
                  <p className="text-xs text-text-muted leading-relaxed">{step.action || step.detail}</p>
                  {step.timing && <p className="text-xxs text-text-muted mt-2 italic">{step.timing}</p>}
                </div>
              ))}
            </div>
            <AIDisclaimer />
          </div>

          {/* ── Kit offer ── */}
          {data.recommended_kit && (
            <div className="card bg-primary-50 border-primary-200">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">📦</span>
                  <div>
                    <span className="text-xxs text-text-muted mb-0.5 block">[Partner] Recommended Pack · 100% Botanicals Available</span>
                    <h3 className="font-bold text-text-primary">{data.recommended_kit.name}</h3>
                    <p className="text-xs text-text-muted mt-1">{data.recommended_kit.description}</p>
                    <p className="text-xs text-text-muted mt-1">{data.recommended_kit.delivery}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xl font-bold text-text-primary">₹{data.recommended_kit.price}<SampleDataLabel /></p>
                  {data.recommended_kit.original_price && (
                    <p className="text-xs text-text-muted line-through">₹{data.recommended_kit.original_price}</p>
                  )}
                  <button onClick={handleAddKit} disabled={kitAdded}
                    className={`btn-primary text-xs mt-2 ${kitAdded ? 'bg-green-600' : ''}`}>
                    {kitAdded ? '✅ Added to Cart' : '🛒 Buy Complete Bundle'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
