import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mic, MicOff, Send, Volume2, RefreshCw, Loader2, Camera, Upload, 
         ChevronRight, ShieldCheck, Truck, Phone, Star, Leaf, Droplets,
         AlertTriangle, TrendingUp, FlaskConical } from 'lucide-react'
import { useSpeech } from '../hooks/useSpeech'
import { useLang } from '../context/LangContext'
import { useCart } from '../context/CartContext'
import { SampleDataLabel, AIDisclaimer, SampleDataBanner } from '../components/ui/SampleDataLabel'
import OutlookCalendar from '../components/ui/OutlookCalendar'
import ProductCard from '../components/ui/ProductCard'
import { apiFetch } from '../lib/api'

// ── Static data ────────────────────────────────────────────────────
const SERVICE_TILES = [
  { icon: Mic,          label: 'Ask AI Voice',      sub: 'Ask in Hindi/English', to: '/#agri-doctor', color: 'bg-primary-50 text-primary' },
  { icon: Camera,       label: 'Crop Doctor',        sub: 'Scan leaf disease',    to: '/crop-doctor',  color: 'bg-red-50 text-red-600' },
  { icon: Leaf,         label: 'Soil Plan',          sub: 'Regional soil matrix', to: '/soil-plan',    color: 'bg-amber-50 text-amber-600' },
  { icon: AlertTriangle,label: 'Weather Alerts',     sub: 'View now',             to: '/alerts',       color: 'bg-blue-50 text-blue-600' },
  { icon: FlaskConical, label: 'Buy Inputs',         sub: 'Verified products',    to: '/shop',         color: 'bg-purple-50 text-purple-600' },
]

const CATEGORIES = [
  { icon: '🍄', label: 'Fungicides',        to: '/shop?category=fungicide' },
  { icon: '🐛', label: 'Insecticides',      to: '/shop?category=insecticide' },
  { icon: '🧪', label: 'Bio-Fertilisers',   to: '/shop?category=bio_fertiliser' },
  { icon: '🪨', label: 'Soil Amendments',   to: '/shop?category=soil_amendment' },
  { icon: '💧', label: 'Drip & Micro',      to: '/shop?category=sprayer' },
  { icon: '📦', label: 'Kits & Bundles',    to: '/shop?category=kit' },
  { icon: '🌱', label: 'Seeds',             to: '/shop' },
  { icon: '🔬', label: 'Soil Test Kits',    to: '/shop' },
  { icon: '🛺', label: 'Transport',         to: '/shop' },
  { icon: '📱', label: 'Agri-Advisory',     to: '/' },
  { icon: '🌊', label: 'Watershed Tools',   to: '/lake-watch' },
  { icon: '📊', label: 'Research Data',     to: '/dashboard' },
]

const CROP_PROBLEMS = [
  { tag: 'Urgent',  color: 'badge-red',   title: 'Leaf Spots & Blight',    crops: 'Tomato · Chana', icon: '🍅' },
  { tag: 'Common',  color: 'badge-amber', title: 'Pests & Stem Borers',    crops: 'Mustard · Maize', icon: '🌾' },
  { tag: 'Nutrient',color: 'badge-blue',  title: 'Nutrient Deficiency',    crops: 'All crops', icon: '🧪' },
  { tag: 'Soil',    color: 'badge-gray',  title: 'Soil-Lost Moisture',     crops: 'All zones', icon: '🪨' },
  { tag: 'Fungal',  color: 'badge-red',   title: 'Powdery Mildew',         crops: 'Tomato · Guava', icon: '🍄' },
  { tag: 'Bacterial',color:'badge-amber', title: 'Bacterial Wilt',         crops: 'Tomato · Potato', icon: '⚠️' },
  { tag: 'Root',    color: 'badge-gray',  title: 'Root & Dry Soil Care',   crops: 'Chana · Wheat', icon: '🌱' },
]

const REGIONAL_CROPS = [
  { emoji: '🍅', name: 'Tomato (टमाटर)', to: '/prices?crop=tomato' },
  { emoji: '🌾', name: 'Wheat (गेहूँ)',   to: '/prices' },
  { emoji: '🌿', name: 'Mustard (सरसों)', to: '/prices?crop=mustard' },
  { emoji: '🌽', name: 'Maize (मक्का)',   to: '/prices' },
  { emoji: '🥦', name: 'Vegetables',      to: '/prices' },
  { emoji: '🍊', name: 'Fruit Trees',     to: '/prices' },
  { emoji: '🪴', name: 'Home Garden',     to: '/prices' },
]

const WHY_CHOOSE = [
  { icon: '🛰️', title: 'Satellite Soil & Moisture Tracking', desc: 'Sentinel-2 NDRE maps calibrated for Aravalli alluvial and black cotton soils.' },
  { icon: '💡', title: 'Agronomic Climate-AI Decisions',     desc: '20-day outlook rules matched per crop, with confidence decay and spray-window alerts.' },
  { icon: '🚚', title: 'Doorstep Delivery with CoD',         desc: 'Inputs dispatched to Girwa, Mavli, Vallabhnagar & Badgaon. Pay cash on delivery.' },
  { icon: '🔬', title: 'Clinically Formulated Inputs',       desc: 'Every product listed with active ingredient, batch reference, and formulation chemistry.' },
]

// ── Component ────────────────────────────────────────────────────────
export default function Home() {
  const { lang, t } = useLang()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const speechLang = lang === 'hi' ? 'hi-IN' : 'en-IN'
  const { isListening, transcript, isSpeaking, sttSupported, startListening, stopListening, speak, stopSpeaking } = useSpeech({ lang: speechLang })

  const [textInput, setTextInput]     = useState('')
  const [aiAnswer, setAiAnswer]       = useState('')
  const [aiLoading, setAiLoading]     = useState(false)
  const [aiError, setAiError]         = useState('')
  const [outlook, setOutlook]         = useState([])
  const [products, setProducts]       = useState([])
  const [scanFile, setScanFile]       = useState(null)
  const [scanLoading, setScanLoading] = useState(false)

  // Load outlook + products on mount
  useEffect(() => {
    apiFetch('/api/outlook?crop=tomato')
      .then(r => r.json())
      .then(d => setOutlook(d.outlook || []))
      .catch(() => {})

    apiFetch('/api/products?per_page=5')
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .catch(() => {})
  }, [])

  // When voice transcript arrives → auto-fill text input
  useEffect(() => {
    if (transcript) setTextInput(transcript)
  }, [transcript])

  const handleAsk = async (question) => {
    if (!question.trim()) return
    setAiLoading(true)
    setAiError('')
    setAiAnswer('')
    try {
      const res = await apiFetch('/api/agri-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, lang: lang === 'hi' ? 'hi' : 'en', location: 'Udaipur, Rajasthan' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Server error')
      setAiAnswer(data.answer)
    } catch (e) {
      setAiError(e.message || 'Could not reach AI service. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleScan = async () => {
    if (!scanFile) return
    setScanLoading(true)
    const form = new FormData()
    form.append('image', scanFile)
    try {
      const res = await apiFetch('/api/crop-doctor', { method: 'POST', body: form })
      const data = await res.json()
      navigate('/crop-doctor', { state: { result: data, filename: scanFile.name } })
    } catch {
      alert('Scan failed — please try again.')
    } finally { setScanLoading(false) }
  }

  return (
    <div className="max-w-container mx-auto px-3 md:px-6 py-4 md:py-6 space-y-8">

      {/* ── 1. Service tiles ── */}
      <section aria-label="Quick access services">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SERVICE_TILES.map(tile => (
            <Link key={tile.label} to={tile.to}
              className="card flex flex-col items-center gap-2 py-4 text-center hover:shadow-card-hover transition-shadow focus-visible:outline-2 focus-visible:outline-primary">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tile.color}`}>
                <tile.icon className="w-5 h-5" />
              </div>
              <span className="font-semibold text-sm text-text-primary leading-tight">{tile.label}</span>
              <span className="text-xxs text-text-muted">{tile.sub}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 2. AI Agri-Doctor + Leaf Scan panel ── */}
      <section id="agri-doctor" aria-label="AI Agri-Doctor">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Left: AI Doctor */}
          <div className="lg:col-span-3 card bg-gradient-to-br from-primary-50 to-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🌿</span>
              <div>
                <h2 className="font-bold text-primary text-base">{t('home.agriDoctor.title')}</h2>
                <p className="text-xxs text-text-muted">Ask in Hindi or English about any crop problem</p>
              </div>
            </div>

            {/* Input row */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAsk(textInput)}
                placeholder={t('home.agriDoctor.placeholder')}
                className="input flex-1 text-sm"
                aria-label="Ask the Agri-Doctor"
              />
              <button onClick={() => handleAsk(textInput)} className="btn-primary px-3" aria-label="Send">
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>

            {/* Mic button */}
            {sttSupported && (
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all
                    ${isListening ? 'bg-red-500 mic-pulse' : 'bg-primary hover:bg-primary-600'}`}
                  aria-label={isListening ? 'Stop listening' : t('home.agriDoctor.askVoice')}
                  aria-pressed={isListening}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <div>
                  <p className="text-xs font-medium text-text-primary">
                    {isListening ? t('home.agriDoctor.listening') : t('home.agriDoctor.askVoice')}
                  </p>
                  {isListening && transcript && (
                    <p className="text-xxs text-text-muted italic">{transcript}</p>
                  )}
                </div>
              </div>
            )}

            {/* Suggested questions */}
            <div className="flex flex-wrap gap-2 mb-3">
              {['मेरी टमाटर की फसल में पीली पत्तियाँ हैं', 'When is the best time to spray?', 'मिट्टी में नमी कम है क्या करें'].map(q => (
                <button key={q} onClick={() => { setTextInput(q); handleAsk(q) }}
                  className="text-xxs bg-primary-50 text-primary-700 border border-primary-200 rounded-chip px-2 py-1 hover:bg-primary-100 transition-colors">
                  {q}
                </button>
              ))}
            </div>

            {/* Answer */}
            {aiError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                {aiError}
              </div>
            )}
            {aiLoading && (
              <div className="flex items-center gap-2 text-sm text-text-muted py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                Consulting AI Agri-Doctor…
              </div>
            )}
            {aiAnswer && !aiLoading && (
              <div className="bg-white border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-text-primary leading-relaxed mb-3">{aiAnswer}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => speak(aiAnswer, speechLang)}
                    disabled={isSpeaking}
                    className="btn-outline text-xs px-3 py-1.5"
                    aria-label="Hear advice aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {t('home.agriDoctor.hearAdvice')}
                  </button>
                  {isSpeaking && (
                    <button onClick={stopSpeaking} className="btn-outline text-xs px-3 py-1.5">Stop</button>
                  )}
                </div>
                <AIDisclaimer className="mt-2" />
              </div>
            )}
          </div>

          {/* Right: Leaf scan */}
          <div className="lg:col-span-2 card flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔬</span>
              <div>
                <h2 className="font-bold text-text-primary text-sm">{t('home.leafScan.title')}</h2>
                <p className="text-xxs text-text-muted">{t('home.leafScan.subtitle')}</p>
              </div>
            </div>

            {/* Drop zone */}
            <label className="border-2 border-dashed border-primary-200 rounded-lg p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-primary-50 transition-colors">
              {scanFile ? (
                <img src={URL.createObjectURL(scanFile)} alt="Leaf preview"
                  className="w-full h-32 object-cover rounded-lg" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-primary-400" />
                  <span className="text-xs text-text-muted text-center">Drop a leaf photo or tap to upload</span>
                </>
              )}
              <input type="file" accept="image/*" className="sr-only"
                onChange={e => setScanFile(e.target.files[0])}
                aria-label="Upload leaf photo" />
            </label>

            {/* Camera capture (mobile) */}
            <label className="btn-outline text-xs cursor-pointer flex items-center justify-center gap-2 min-touch">
              <Camera className="w-4 h-4" /> Capture with Camera
              <input type="file" accept="image/*" capture="environment" className="sr-only"
                onChange={e => setScanFile(e.target.files[0])} />
            </label>

            <button onClick={handleScan} disabled={!scanFile || scanLoading} className="btn-green w-full">
              {scanLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : '🔬'}
              {t('home.leafScan.cta')}
            </button>

            <Link to="/crop-doctor" className="text-xs text-primary hover:underline text-center">
              Or view past scan results →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. Shop by Category ── */}
      <section aria-label="Shop by Category">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-heading text-lg">{t('home.shopCategory.title')}</h2>
          <Link to="/shop" className="text-xs text-primary font-medium hover:underline focus-visible:underline">
            {t('home.shopCategory.viewAll')}
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {CATEGORIES.map(cat => (
            <Link key={cat.label} to={cat.to}
              className="card flex flex-col items-center gap-2 py-3 text-center hover:shadow-card-hover hover:bg-primary-50 transition-all focus-visible:outline-2 focus-visible:outline-primary">
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xxs font-medium text-text-primary leading-tight">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4. Browse by Crop Problem ── */}
      <section aria-label="Browse by Crop Problem">
        <h2 className="section-heading text-lg mb-3">{t('home.cropProblem.title')}</h2>
        <div className="h-scroll pb-2">
          <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
            {CROP_PROBLEMS.map(p => (
              <Link key={p.title} to="/crop-doctor"
                className="card min-w-[160px] hover:shadow-card-hover transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{p.icon}</span>
                  <span className={`badge ${p.color} text-xxs`}>{p.tag}</span>
                </div>
                <p className="font-semibold text-sm text-text-primary leading-tight mb-1">{p.title}</p>
                <p className="text-xxs text-text-muted">{p.crops}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Browse by Regional Crop ── */}
      <section aria-label="Browse by Regional Crop">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-heading text-lg">{t('home.regionalCrop.title')}</h2>
          <Link to="/prices" className="text-xs text-primary font-medium hover:underline">Udaipur Mandi Board Live →</Link>
        </div>
        <div className="flex gap-2 flex-wrap">
          {REGIONAL_CROPS.map(c => (
            <Link key={c.name} to={c.to}
              className="flex items-center gap-2 bg-white border border-border rounded-chip px-3 py-2 text-sm hover:bg-primary-50 hover:border-primary-300 transition-colors">
              <span>{c.emoji}</span>
              <span className="font-medium text-text-primary">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 6. Verified Crop Care Inputs ── */}
      <section aria-label="Verified Crop Care Inputs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-heading text-lg">{t('home.products.title')}</h2>
          <Link to="/shop" className="text-xs text-primary font-medium hover:underline">View Verified Inputs →</Link>
        </div>
        <SampleDataBanner />
        {products.length > 0 ? (
          <div className="h-scroll pb-2">
            <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
              {products.map(p => (
                <div key={p.id} className="w-52 shrink-0">
                  <ProductCard product={p} compact />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card flex items-center justify-center h-32 text-text-muted text-sm">
            Loading products…
          </div>
        )}
      </section>

      {/* ── 7. 20-Day Agricultural Outlook ── */}
      <section aria-label="20-Day Agricultural Outlook">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-heading text-lg">{t('home.outlook.title')} — Udaipur & Girwa Basin</h2>
          <Link to="/prices" className="text-xs text-primary font-medium hover:underline">Full Outlook →</Link>
        </div>
        <OutlookCalendar days={outlook} crop="Tomato" />
      </section>

      {/* ── 8. Trust strip ── */}
      <section aria-label="Trust features" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: ShieldCheck, title: 'Secure Payment',           desc: 'Cash on Delivery. No advance payment required.' },
          { icon: Star,        title: 'Genuine Products [Verified]', desc: 'Batch-verified inputs with active ingredient disclosure.' },
          { icon: Truck,       title: 'Trusted Across Udaipur',   desc: 'Delivery to Girwa, Mavli, Vallabhnagar & Badgaon blocks.' },
        ].map(f => (
          <div key={f.title} className="card flex items-start gap-3">
            <f.icon className="w-8 h-8 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-text-primary">{f.title}</p>
              <p className="text-xs text-text-muted mt-0.5">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── 9. Why Choose ── */}
      <section aria-label="Why Choose Sentri">
        <div className="bg-primary-50 rounded-card p-6">
          <h2 className="section-heading text-center mb-1">{t('home.whyChoose.title')}</h2>
          <p className="text-sm text-text-muted text-center mb-6">Built specifically for the agri-ecological micro-climates of Udaipur, Rajsamand, Dungarpur and Sirohi districts.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHY_CHOOSE.map(f => (
              <div key={f.title} className="bg-white rounded-card p-4 shadow-card">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="font-semibold text-sm text-text-primary mt-2 mb-1">{f.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. CTA banner ── */}
      <section className="bg-primary rounded-card p-6 flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="text-white text-center md:text-left">
          <p className="font-bold text-lg">Speak with an Agronomist Right Now</p>
          <p className="text-sm text-primary-200 mt-0.5">Connect directly for field inspection and soil pH advisory in Mewari or Hindi.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <a href="tel:[Helpline number]" className="btn-primary flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Call Now ([Helpline number])
          </a>
          <Link to="/crop-doctor" className="btn-outline bg-white text-primary hover:bg-primary-50">
            Request Hindi / Mewari Callback
          </Link>
        </div>
      </section>

    </div>
  )
}
