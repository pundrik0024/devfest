import { useState } from 'react'
import { MapPin, Leaf, Camera, Edit2, Save, X } from 'lucide-react'
import { SampleDataLabel } from '../components/ui/SampleDataLabel'
import { Link } from 'react-router-dom'

const SAVED_CROPS = [
  { name: 'Tomato (टमाटर)', variety: 'Hybrid Himsona', area: '0.8 ha', status: 'Growing', icon: '🍅' },
  { name: 'Mustard (सरसों)', variety: 'Pusa Bold', area: '1.2 ha', status: 'Harvested', icon: '🌿' },
  { name: 'Chana / Gram (चना)', variety: 'GNG-1581', area: '0.3 ha', status: 'Planning', icon: '🫘' },
]

const PAST_SCANS = [
  { id: 'ARV-DEMO01', crop: 'Tomato', disease: 'Early Blight', confidence: 'high', date: '2025-01-14', severity: 'moderate' },
  { id: 'ARV-DEMO02', crop: 'Mustard', disease: 'Alternaria Leaf Spot', confidence: 'medium', date: '2025-01-10', severity: 'mild' },
]

export default function MyFarm() {
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: '[Farmer Name]',
    location: 'Girwa Block, Udaipur, Rajasthan',
    farmSize: '2.3 ha',
    soilType: 'Red-Loamy (Aravalli Alluvium)',
    phone: '[Phone number]',
  })
  const [draft, setDraft] = useState({ ...profile })

  const handleSave = () => { setProfile(draft); setEditing(false) }
  const handleCancel = () => { setDraft(profile); setEditing(false) }

  return (
    <div className="max-w-container mx-auto px-3 md:px-6 py-4 md:py-6 space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-text-primary">My Farm</h1>

      {/* Profile card */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-3xl">👨‍🌾</div>
            <div>
              <h2 className="font-bold text-text-primary text-lg">{profile.name}</h2>
              <p className="text-xs text-text-muted flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {profile.location}
              </p>
            </div>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-outline text-xs gap-1.5">
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-green text-xs gap-1.5">
                <Save className="w-3.5 h-3.5" /> Save
              </button>
              <button onClick={handleCancel} className="btn-outline text-xs gap-1.5">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Farm Size', key: 'farmSize', icon: '🌾' },
            { label: 'Soil Type', key: 'soilType', icon: '🪨' },
            { label: 'Contact', key: 'phone', icon: '📞' },
          ].map(f => (
            <div key={f.key} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xxs text-text-muted mb-0.5">{f.icon} {f.label}</p>
              {editing ? (
                <input
                  value={draft[f.key]}
                  onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                  className="input text-sm py-1"
                  aria-label={f.label}
                />
              ) : (
                <p className="font-semibold text-sm text-text-primary">{profile[f.key]}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Saved crops */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-text-primary">Saved Crops</h2>
          <span className="text-xxs text-text-muted"><SampleDataLabel /></span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SAVED_CROPS.map(crop => (
            <div key={crop.name} className="card hover:shadow-card-hover transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{crop.icon}</span>
                <div>
                  <p className="font-semibold text-sm text-text-primary">{crop.name}</p>
                  <p className="text-xxs text-text-muted">{crop.variety}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Area: <strong>{crop.area}</strong></span>
                <span className={`badge text-xxs ${crop.status === 'Growing' ? 'badge-green' : crop.status === 'Harvested' ? 'badge-gray' : 'badge-blue'}`}>
                  {crop.status}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <Link to="/prices" className="btn-outline text-xs flex-1 text-center py-1.5">Prices</Link>
                <Link to="/crop-doctor" className="btn-outline text-xs flex-1 text-center py-1.5">Scan</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past scans */}
      <div>
        <h2 className="font-bold text-text-primary mb-3">Past Scans</h2>
        <div className="space-y-3">
          {PAST_SCANS.map(scan => (
            <div key={scan.id} className="card flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-text-primary">{scan.disease}</p>
                <p className="text-xxs text-text-muted">{scan.crop} · {scan.date} · ID: {scan.id}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`badge text-xxs ${scan.confidence === 'high' ? 'badge-green' : 'badge-amber'}`}>
                  {scan.confidence}
                </span>
                <span className={`badge text-xxs ${scan.severity === 'mild' ? 'badge-green' : 'badge-amber'}`}>
                  {scan.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xxs text-text-muted mt-2 flex items-center gap-1">
          <SampleDataLabel /> Sample scan history — real scans saved after you use Crop Doctor
        </p>
      </div>

      {/* Farm plot map placeholder */}
      <div className="card">
        <h2 className="font-bold text-text-primary mb-3">Farm Plot Location</h2>
        <div className="w-full h-40 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-8 h-8 text-primary mx-auto" />
            <p className="text-sm font-medium text-primary mt-1">Girwa Block, Udaipur</p>
            <p className="text-xxs text-text-muted">24.58°N, 73.71°E</p>
            <p className="text-xxs text-text-muted mt-1">Interactive map in M6 polish</p>
          </div>
        </div>
      </div>
    </div>
  )
}
