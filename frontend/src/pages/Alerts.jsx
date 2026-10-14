import { useState, useEffect } from 'react'
import { Volume2, AlertTriangle, Loader2, Bell } from 'lucide-react'
import { useSpeech } from '../hooks/useSpeech'
import { useLang } from '../context/LangContext'
import { apiFetch } from '../lib/api'

const SEVERITY_CONFIG = {
  critical:  { cls: 'border-red-300 bg-red-50',    badge: 'badge-red',   dot: 'bg-red-500' },
  advisory:  { cls: 'border-amber-300 bg-amber-50', badge: 'badge-amber', dot: 'bg-amber-500' },
  info:      { cls: 'border-blue-300 bg-blue-50',   badge: 'badge-blue',  dot: 'bg-blue-500' },
}

export default function Alerts() {
  const { t } = useLang()
  const { speak, isSpeaking, ttsSupported } = useSpeech({ lang: 'hi-IN' })
  const [alerts, setAlerts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    apiFetch('/api/alerts')
      .then(r => r.json())
      .then(d => setAlerts(d.alerts || []))
      .catch(() => setError('Could not load weather alerts'))
      .finally(() => setLoading(false))
  }, [])

  const speakAllAlerts = () => {
    const text = alerts.map(a => `${a.title}. ${a.detail}`).join('. अगला अलर्ट: ')
    speak(text, 'hi-IN')
  }

  return (
    <div className="max-w-container mx-auto px-3 md:px-6 py-4 md:py-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-text-primary">{t('alerts.title')}</h1>
            <p className="text-xs text-text-muted">Real-time weather alerts for your farm location</p>
          </div>
        </div>
        {ttsSupported && alerts.length > 0 && (
          <button onClick={speakAllAlerts} disabled={isSpeaking} className="btn-primary text-xs">
            <Volume2 className="w-4 h-4" /> {t('alerts.hearInHindi')}
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40 gap-2 text-text-muted">
          <Loader2 className="w-6 h-6 animate-spin text-primary" /> Loading alerts…
        </div>
      )}

      {error && (
        <div className="card bg-red-50 border-red-200 flex items-center gap-2 text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {!loading && alerts.length === 0 && !error && (
        <div className="card flex flex-col items-center gap-4 py-12 text-text-muted text-center">
          <span className="text-4xl">☀️</span>
          <p className="font-semibold">No active alerts</p>
          <p className="text-xs">Weather conditions look favourable for your area right now.</p>
        </div>
      )}

      <div className="space-y-4">
        {['critical', 'advisory', 'info'].map(severity => {
          const group = alerts.filter(a => a.severity === severity)
          if (!group.length) return null
          const cfg = SEVERITY_CONFIG[severity]
          return (
            <div key={severity}>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                {severity === 'critical' ? '🔴 Critical' : severity === 'advisory' ? '🟡 Advisory' : '🔵 Info'}
              </p>
              <div className="space-y-3">
                {group.map((alert, i) => (
                  <div key={i} className={`card border ${cfg.cls}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{alert.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-text-primary text-sm">{alert.title}</h3>
                          <span className={`badge text-xxs ${cfg.badge}`}>{severity}</span>
                          {alert.date && (
                            <span className="text-xxs text-text-muted">{alert.date}</span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted leading-relaxed">{alert.detail}</p>
                      </div>
                      <button
                        onClick={() => speak(`${alert.title}. ${alert.detail}`, 'hi-IN')}
                        className="p-1.5 rounded-lg hover:bg-white/50 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={`Hear alert: ${alert.title}`}
                      >
                        <Volume2 className="w-4 h-4 text-text-muted" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {alerts.length > 0 && (
        <p className="text-xxs text-text-muted mt-6 text-center">
          Alerts generated from real OpenWeatherMap forecast data for Udaipur (24.58°N, 73.71°E).
          Always verify with local agriculture extension officer before taking action.
        </p>
      )}
    </div>
  )
}
