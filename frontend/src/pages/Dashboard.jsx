import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, Filter, Loader2 } from 'lucide-react'
import { SampleDataLabel, SampleDataBanner } from '../components/ui/SampleDataLabel'
import { apiFetch } from '../lib/api'

function downloadCSV(data, filename) {
  if (!data || !data.length) return
  const headers = Object.keys(data[0])
  const rows = data.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function Dashboard() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/api/dashboard')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-container mx-auto px-3 md:px-6 py-4 md:py-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-text-primary">Researcher &amp; NGO Dashboard</h1>
          <p className="text-xs text-text-muted mt-0.5">Soil &amp; watershed data for Southern Rajasthan — sample time-series</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => data && downloadCSV(data.soil_trend, 'soil_trend.csv')}
            className="btn-outline text-xs gap-2">
            <Download className="w-4 h-4" /> Export Soil CSV
          </button>
          <button onClick={() => data && downloadCSV(data.watershed_trend, 'watershed_trend.csv')}
            className="btn-outline text-xs gap-2">
            <Download className="w-4 h-4" /> Export Watershed CSV
          </button>
        </div>
      </div>

      <SampleDataBanner />

      {loading && <div className="flex items-center justify-center h-40 gap-2 text-text-muted"><Loader2 className="w-6 h-6 animate-spin text-primary" /> Loading dashboard…</div>}

      {data && !loading && (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Degradation Index', value: data.summary?.degradation_index, unit: '/100', color: 'text-amber-600' },
              { label: 'Risk Level',         value: data.summary?.risk_level,         unit: '',    color: 'text-amber-600' },
              { label: 'Active Lakes',       value: data.summary?.active_lakes,       unit: '',    color: 'text-blue-600' },
              { label: 'Area Monitored',     value: data.summary?.area_monitored_ha,  unit: ' ha', color: 'text-primary' },
            ].map(s => (
              <div key={s.label} className="card text-center">
                <p className="text-xxs text-text-muted">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}{s.unit}</p>
                <SampleDataLabel className="mt-1 mx-auto" />
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Soil moisture + OC trend */}
            <div className="card">
              <h3 className="font-bold text-text-primary mb-4 text-sm">Soil Moisture &amp; Organic Carbon Trend</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.soil_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="moisture" stroke="#1A6B2A" strokeWidth={2} name="Moisture %" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="salinity" stroke="#F59E0B" strokeWidth={2} name="Salinity DS/m" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xxs text-text-muted mt-2 flex items-center gap-1"><SampleDataLabel /> Sample 6-month trend</p>
            </div>

            {/* Watershed levels */}
            <div className="card">
              <h3 className="font-bold text-text-primary mb-4 text-sm">Lake Level &amp; Recharge Rate</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.watershed_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="pichola_level" fill="#1A6B2A" name="Pichola Level %" radius={[3,3,0,0]} />
                  <Bar dataKey="mavli_level" fill="#4CAF50" name="Mavli Level %" radius={[3,3,0,0]} />
                  <Bar dataKey="recharge_rate" fill="#F59E0B" name="Recharge Rate" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xxs text-text-muted mt-2 flex items-center gap-1"><SampleDataLabel /> Sample 6-month trend</p>
            </div>
          </div>

          {/* Soil metrics table */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-text-primary text-sm">Current Soil Metrics</h3>
              <button onClick={() => data.current_soil && downloadCSV([data.current_soil], 'soil_metrics.csv')}
                className="btn-outline text-xs"><Download className="w-3.5 h-3.5" /> CSV</button>
            </div>
            <div className="h-scroll">
              <table className="w-full text-sm">
                <thead><tr className="text-xxs text-text-muted border-b border-border">
                  {['Metric','Value','Status','Benchmark'].map(h => (
                    <th key={h} className="text-left py-2 pr-4">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {[
                    { metric: 'Moisture', value: `${data.current_soil?.moisture_pct}%`, status: data.current_soil?.moisture_status, bench: '22–35%' },
                    { metric: 'Organic Carbon', value: `${data.current_soil?.organic_carbon_pct}%`, status: data.current_soil?.organic_carbon_status, bench: '>0.5%' },
                    { metric: 'Salinity', value: `${data.current_soil?.salinity_ds_m} DS/m`, status: data.current_soil?.salinity_status, bench: '<1.0' },
                    { metric: 'pH', value: `${data.current_soil?.ph}`, status: data.current_soil?.ph_status, bench: '6.5–7.5' },
                    { metric: 'Erosion Gradient', value: `${data.current_soil?.erosion_hydro_gradient}%`, status: data.current_soil?.erosion_status, bench: '<1.5%' },
                  ].map(r => (
                    <tr key={r.metric} className="border-b border-border hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium text-text-primary">{r.metric}</td>
                      <td className="py-2 pr-4">{r.value} <SampleDataLabel /></td>
                      <td className="py-2 pr-4"><span className="badge-gray text-xxs">{r.status}</span></td>
                      <td className="py-2 text-text-muted text-xs">{r.bench}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
