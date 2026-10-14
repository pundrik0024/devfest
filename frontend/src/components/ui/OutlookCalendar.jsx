import { useLang } from '../../context/LangContext'

const STATUS_CONFIG = {
  optimal:        { label: 'status.optimal',       cls: 'status-optimal',      icon: '✅', bg: 'bg-green-50',  border: 'border-green-200' },
  caution:        { label: 'status.caution',        cls: 'status-caution',      icon: '⚡', bg: 'bg-amber-50',  border: 'border-amber-200' },
  not_suitable:   { label: 'status.not_suitable',   cls: 'status-not_suitable', icon: '❌', bg: 'bg-red-50',    border: 'border-red-200'   },
  spray_ok:       { label: 'status.spray_ok',       cls: 'status-spray_ok',     icon: '💧', bg: 'bg-blue-50',   border: 'border-blue-200'  },
  data_unavailable:{ label: 'status.data_unavailable', cls: 'status-data_unavailable', icon: '—', bg: 'bg-gray-50', border: 'border-gray-200' },
}
const CONF_COLORS = { high: 'text-green-700', medium: 'text-amber-700', low: 'text-gray-400' }

export default function OutlookCalendar({ days = [], crop = '' }) {
  const { t } = useLang()
  if (!days.length) {
    return (
      <div className="card flex items-center justify-center h-32 text-text-muted text-sm">
        Loading outlook data…
      </div>
    )
  }

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-text-primary text-sm">
          20-Day Agricultural Outlook
          {crop && <span className="ml-2 badge-green text-xxs capitalize">{crop}</span>}
        </h3>
        <p className="text-xxs text-text-muted">Scroll →</p>
      </div>
      {/* Horizontal scroll container */}
      <div className="h-scroll px-2 py-3">
        <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
          {days.map((day, i) => {
            const cfg = STATUS_CONFIG[day.status] || STATUS_CONFIG.data_unavailable
            return (
              <div
                key={day.date}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2 ${cfg.bg} ${cfg.border} transition-shadow hover:shadow-card`}
                style={{ minWidth: '72px' }}
                role="listitem"
                aria-label={`${day.day} ${day.date}: ${t(cfg.label)}, ${day.confidence} confidence`}
              >
                <span className="text-xxs font-semibold text-text-muted uppercase">{day.day}</span>
                <span className="text-xxs text-text-muted">{day.date?.slice(5)}</span>
                <span className="text-lg leading-none">{cfg.icon}</span>
                <span className={`${cfg.cls} text-xxs text-center leading-tight`}>{t(cfg.label)}</span>
                {day.temp_max && (
                  <span className="text-xxs text-text-muted">{day.temp_max}°C</span>
                )}
                {day.rain_mm !== undefined && (
                  <span className="text-xxs text-blue-600">{day.rain_mm > 0 ? `${day.rain_mm}mm` : 'Dry'}</span>
                )}
                <span className={`text-xxs ${CONF_COLORS[day.confidence] || 'text-gray-400'}`}>
                  {day.confidence === 'high' ? '●●●' : day.confidence === 'medium' ? '●●○' : '●○○'}
                </span>
                {i >= 10 && (
                  <span className="text-xxs text-text-light italic">Low conf.</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div className="px-4 py-2 border-t border-border bg-gray-50">
        <p className="text-xxs text-text-muted">
          Days 1–5: real forecast · Days 6–10: extrapolated · Days 11–20: seasonal estimate (low confidence)
        </p>
      </div>
    </div>
  )
}
