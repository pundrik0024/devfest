import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Volume2, MapPin, TrendingUp, TrendingDown, Minus, Loader2, AlertTriangle } from 'lucide-react'
import { useSpeech } from '../hooks/useSpeech'
import { useLang } from '../context/LangContext'
import { SampleDataLabel, AIDisclaimer, SampleDataBanner } from '../components/ui/SampleDataLabel'
import OutlookCalendar from '../components/ui/OutlookCalendar'

const TREND_ICON = {
  up:     <TrendingUp className="w-4 h-4 text-green-600" />,
  rising: <TrendingUp className="w-4 h-4 text-green-600" />,
  down:   <TrendingDown className="w-4 h-4 text-red-500" />,
  stable: <Minus className="w-4 h-4 text-text-muted" />,
}

export default function Prices() {
  const { lang, t } = useLang()
  const { speak, isSpeaking, ttsSupported } = useSpeech({ lang: 'hi-IN' })
  const [data, setData]         = useState(null)
  const [outlook, setOutlook]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/prices?location=Udaipur&lang=${lang === 'hi' ? 'hi' : 'en'}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setError('Could not load prices'))
      .finally(() => setLoading(false))

    fetch('/api/outlook?crop=tomato')
      .then(r => r.json())
      .then(d => setOutlook(d.outlook || []))
      .catch(() => {})
  }, [lang])

  const crops = data?.crops || []
  const mandiTable = (data?.mandi_table || []).filter(m =>
    activeFilter === 'all' || m.crop.toLowerCase().includes(activeFilter)
  )

  const bestCrop = crops[0]

  const handleHearAdvice = () => {
    const adviceText = crops.map(c => `${c.name_hi || c.name_en}: ${c.gemini_advice || ''}`).join('. ')
    speak(adviceText, 'hi-IN')
  }

  return (
    <div className="max-w-container mx-auto px-3 md:px-6 py-4 md:py-6">

      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-xxs font-semibold text-text-muted uppercase tracking-widest mb-1">Agronomic Profitability Index</p>
          <div className="flex items-center gap-2 mb-1 text-xs text-text-muted flex-wrap">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Girwa & Mavli Block, Udaipur</span>
            <span className="hidden sm:inline">· Zone IV-A (Sub-Humid Southern Plain)</span>
            <span>· Updated: {new Date().toLocaleTimeString()}</span>
            <SampleDataLabel />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary">Crops & Mandi Real-Time Prices</h1>
          <p className="text-xs text-text-muted mt-1">Crops engineered for Udaipur red–loamy soil and current humidity forecast, paired with five nearest APMC realization.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-4 text-sm">
            <div className="text-center"><p className="text-xxs text-text-muted">Active Mandis</p><p className="font-bold text-primary">5 Yards</p></div>
            <div className="text-center"><p className="text-xxs text-text-muted">Top Yield Delta</p><p className="font-bold text-green-600">+₹4.20/kg</p><SampleDataLabel /></div>
          </div>
          {ttsSupported && (
            <button onClick={handleHearAdvice} disabled={isSpeaking}
              className="btn-primary text-xs px-3 py-1.5">
              <Volume2 className="w-4 h-4" /> {t('prices.hearAdvice')}
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40 gap-2 text-text-muted">
          <Loader2 className="w-6 h-6 animate-spin text-primary" /> Loading prices…
        </div>
      )}
      {error && (
        <div className="card bg-red-50 border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {!loading && data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Crop cards */}
          <div className="lg:col-span-2 space-y-4">
            <SampleDataBanner />

            {crops.map((crop, idx) => (
              <div key={crop.id} className={`card ${crop.caution ? 'border-amber-300 bg-amber-50' : 'border-primary-200 bg-white'}`}>
                {/* Crop header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{idx === 0 ? '🍅' : idx === 1 ? '🌿' : '🫘'}</span>
                    <div>
                      {idx === 0 && <span className="badge-green text-xxs mb-1 inline-block">✅ BEST OPTION</span>}
                      {crop.caution && <span className="badge-amber text-xxs mb-1 inline-block">⚡ Use Caution</span>}
                      <h2 className="font-bold text-text-primary text-base">{crop.name_en} — {crop.name_hi}</h2>
                      <p className="text-xxs text-text-muted">{crop.variety}</p>
                    </div>
                  </div>
                  {crop.suitability_days && (
                    <span className="badge-green text-xxs shrink-0">Suitable {crop.suitability_days} days</span>
                  )}
                </div>

                {/* Mandi prices table → stacked cards on mobile */}
                <div className="mb-3">
                  <p className="text-xxs font-semibold text-text-muted uppercase mb-2">Direct Mandi Prices</p>
                  <div className="hidden sm:grid sm:grid-cols-2 gap-2">
                    {(crop.mandis || []).map(m => (
                      <div key={m.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-text-primary">{m.name_en}</p>
                          <p className="text-xxs text-text-muted">{m.distance_km} km away · {m.pickup}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-text-primary">₹{m.price_per_kg}<span className="text-xxs font-normal text-text-muted">/kg</span></p>
                          <div className="flex items-center justify-end gap-1">{TREND_ICON[m.trend]}<span className="text-xxs text-text-muted">{m.trend}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Mobile stacked */}
                  <div className="sm:hidden space-y-2">
                    {(crop.mandis || []).map(m => (
                      <div key={m.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div>
                          <p className="text-xs font-semibold text-text-primary">[Mandi {String.fromCharCode(65 + (crop.mandis.indexOf(m)))} — {m.name_en}]</p>
                          <p className="text-xxs text-text-muted">{m.distance_km} km from your farm</p>
                        </div>
                        <p className="font-bold text-text-primary">₹{m.price_per_kg}<span className="text-xxs font-normal"> /kg</span></p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gemini advice */}
                {crop.gemini_advice && (
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-primary-800">{crop.gemini_advice}</p>
                      <AIDisclaimer />
                    </div>
                  </div>
                )}

                {crop.caution_reason && (
                  <div className="mt-2 flex items-start gap-2 text-xs text-amber-700">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {crop.caution_reason}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right: Mandi comparison table + weather feed */}
          <div className="space-y-4">
            {/* Mandi table */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-text-primary text-sm">Mandi Price Comparison (Southern Rajasthan)</h3>
                <span className="text-xxs text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Sample Rates</span>
              </div>

              {/* Filter pills */}
              <div className="flex gap-1 flex-wrap mb-3">
                {['all','tomato','mustard','chana'].map(f => (
                  <button key={f} onClick={() => setActiveFilter(f)}
                    className={`text-xxs px-2 py-1 rounded-chip border transition-colors ${activeFilter === f ? 'bg-primary text-white border-primary' : 'bg-gray-50 border-gray-200 text-text-muted hover:bg-gray-100'}`}>
                    {f === 'all' ? 'All Crops' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              <div className="h-scroll">
                <table className="w-full text-xs" role="table">
                  <thead>
                    <tr className="text-xxs text-text-muted border-b border-border">
                      <th className="text-left py-1.5 pr-2">Mandi Yard</th>
                      <th className="text-right pr-2">Dist.</th>
                      <th className="text-right pr-2">Price/kg</th>
                      <th className="text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mandiTable.map((m, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-gray-50">
                        <td className="py-2 pr-2">
                          <p className="font-medium text-text-primary">{m.yard}</p>
                          <p className="text-xxs text-text-muted">{m.crop} · {m.arrival}</p>
                        </td>
                        <td className="text-right pr-2 text-text-muted">{m.distance_km} km</td>
                        <td className="text-right pr-2 font-bold text-text-primary">₹{m.price_per_kg}</td>
                        <td className="text-right">{TREND_ICON[m.trend] || TREND_ICON.stable}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xxs text-text-muted mt-2 flex items-center gap-1">
                <SampleDataLabel /> Market prices reflect sample modal rates per APMC mandi yard.
              </p>
            </div>

            {/* 20-day weather feed */}
            <div className="card">
              <h3 className="font-semibold text-text-primary text-sm mb-3">30-Day Weather Outlook Feed — Girwa Station</h3>
              {outlook.slice(0, 8).map(day => (
                <div key={day.date} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-xs font-medium text-text-primary">{day.day} {day.date?.slice(5)}</p>
                    <p className="text-xxs text-text-muted">{day.notes}</p>
                  </div>
                  <span className={`badge text-xxs
                    ${day.status === 'optimal' ? 'badge-green' :
                      day.status === 'spray_ok' ? 'badge-blue' :
                      day.status === 'caution' ? 'badge-amber' : 'badge-red'}`}>
                    {day.status === 'optimal' ? 'Optimal' :
                     day.status === 'spray_ok' ? 'Spray Ready' :
                     day.status === 'caution' ? 'Caution' : 'Not Suitable'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Full 20-day outlook */}
      {outlook.length > 0 && (
        <div className="mt-6">
          <OutlookCalendar days={outlook} crop="tomato" />
        </div>
      )}
    </div>
  )
}
