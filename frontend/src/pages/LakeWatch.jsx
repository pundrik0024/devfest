import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet'
import L from 'leaflet'
import { Loader2, AlertTriangle, Droplets } from 'lucide-react'
import { SampleDataLabel, SampleDataBanner } from '../components/ui/SampleDataLabel'
import { useLang } from '../context/LangContext'

// Fix Leaflet default icon path for bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const STATUS_CONFIG = {
  Good:         { cls: 'badge-green',  bg: 'bg-green-50 border-green-200',  dot: 'bg-green-500' },
  'Healthy Flow':{ cls: 'badge-blue',  bg: 'bg-blue-50 border-blue-200',    dot: 'bg-blue-500' },
  Alert:        { cls: 'badge-red',    bg: 'bg-red-50 border-red-200',      dot: 'bg-red-500'   },
  Caution:      { cls: 'badge-amber',  bg: 'bg-amber-50 border-amber-200',  dot: 'bg-amber-500' },
}

export default function LakeWatch() {
  const { t } = useLang()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    fetch('/api/lake-watch')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setError('Could not load lake watch data'))
      .finally(() => setLoading(false))
  }, [])

  const center = data?.watershed_map ? [data.watershed_map.center_lat, data.watershed_map.center_lon] : [24.5854, 73.7125]

  return (
    <div className="max-w-container mx-auto px-3 md:px-6 py-4 md:py-6">
      <h1 className="text-xl md:text-2xl font-bold text-text-primary mb-1">{t('lakeWatch.title')}</h1>
      <p className="text-xs text-text-muted mb-6">
        Live telemetry of interconnected lake systems, recharge outflow gates, and canal twist restricts affecting Mavli, Vallabhnagar & Girwa farmers.
      </p>

      {loading && <div className="flex items-center justify-center h-40 gap-2 text-text-muted"><Loader2 className="w-6 h-6 animate-spin text-primary" /> Loading lake data…</div>}
      {error && <div className="card bg-red-50 border-red-200 text-red-700 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {error}</div>}

      {data && !loading && (
        <div className="space-y-6">
          <SampleDataBanner />

          {/* Lake status chips strip */}
          <div className="flex flex-wrap gap-2">
            {(data.lakes || []).map(lake => {
              const cfg = STATUS_CONFIG[lake.status] || STATUS_CONFIG.Caution
              return (
                <div key={lake.id} className="flex items-center gap-1.5 bg-white border border-border rounded-chip px-3 py-1.5">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className="text-xs font-medium text-text-primary">{lake.name}</span>
                  <span className={`badge text-xxs ${cfg.cls}`}>{lake.status}</span>
                </div>
              )
            })}
          </div>

          {/* Lake cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {(data.lakes || []).map(lake => {
              const cfg = STATUS_CONFIG[lake.status] || STATUS_CONFIG.Caution
              return (
                <div key={lake.id} className={`card border ${cfg.bg}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-text-primary text-sm">{lake.name}</h3>
                    <span className={`badge text-xxs ${cfg.cls}`}>{lake.status}</span>
                  </div>

                  {lake.level_pct !== undefined && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-text-muted">Level</span>
                        <span className="font-bold text-text-primary">{lake.level_pct}%<SampleDataLabel className="ml-1" /></span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${lake.level_pct > 80 ? 'bg-green-500' : lake.level_pct > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${lake.level_pct}%` }}
                          role="progressbar"
                          aria-valuenow={lake.level_pct}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                      {lake.full_level && (
                        <p className="text-xxs text-text-muted mt-1">Full: {lake.full_level} · Current: {lake.current_level || '–'}</p>
                      )}
                    </div>
                  )}

                  {lake.flow_status && (
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-medium text-blue-700">{lake.flow_status}</span>
                    </div>
                  )}

                  <p className="text-xxs text-text-muted leading-relaxed">
                    {lake.gate_note || lake.depletion_note || lake.watershed_note || ''}
                  </p>

                  {lake.irrigation_impact && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <span className="text-xxs text-text-muted">Irrigation impact: </span>
                      <span className="text-xxs font-medium text-text-primary">{lake.irrigation_impact}</span>
                    </div>
                  )}

                  {lake.alert_note && (
                    <div className="mt-2 flex items-start gap-1.5 text-xxs text-red-700 bg-red-50 rounded p-2">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                      {lake.alert_note}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Watershed map */}
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-text-primary">Mavli &amp; Vallabhnagar Recharge Zone Cartography</h3>
                <p className="text-xxs text-text-muted">Interactive watershed model — runoff vectors from the Gogunda Highlands down through the Aharvali valley.</p>
              </div>
              <button className="btn-outline text-xs">Stretch Hydrology Overlay</button>
            </div>
            <div style={{ height: '380px' }}>
              <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }} aria-label="Udaipur Basin Watershed Map">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {(data.watershed_map?.recharge_zones || []).map(zone => (
                  <Marker key={zone.name} position={[zone.lat, zone.lon]}>
                    <Popup>
                      <strong>{zone.name}</strong><br />
                      Status: {zone.status}<br />
                      <span style={{ fontSize: '10px', color: '#6B7280' }}>Sample data</span>
                    </Popup>
                  </Marker>
                ))}
                <Circle center={center} radius={8000} color="#1A6B2A" fillOpacity={0.08} />
              </MapContainer>
            </div>
            <div className="px-4 py-3 border-t border-border bg-gray-50 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'No Grand Water Depth', value: data.watershed_map?.stats?.area_sq_km + ' km²' },
                { label: 'Reservoir Discharge Zone', value: '-10 ak vs 1024' },
                { label: 'Micro Irrigation Density', value: data.watershed_map?.stats?.irrigation_density || '—' },
                { label: 'Recharge Zone %', value: (data.watershed_map?.stats?.recharge_zone_pct || '—') + '%' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-xxs text-text-muted">{s.label}</p>
                  <p className="font-bold text-sm text-text-primary">{s.value}<SampleDataLabel className="ml-1" /></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
