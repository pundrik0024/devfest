import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, SlidersHorizontal, ChevronLeft, ChevronRight, X, Filter } from 'lucide-react'
import { useLang } from '../context/LangContext'
import { useCart } from '../context/CartContext'
import { SampleDataLabel, SampleDataBanner } from '../components/ui/SampleDataLabel'
import ProductCard from '../components/ui/ProductCard'

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Top Recommended' },
  { value: 'price_asc',   label: 'Price: Low to High' },
  { value: 'price_desc',  label: 'Price: High to Low' },
  { value: 'saving',      label: 'Best Saving' },
]

const CATEGORIES = [
  { id: '',               label: 'All Categories', count: 148 },
  { id: 'fungicide',      label: 'Fungicides & Systemic', count: 44 },
  { id: 'insecticide',    label: 'Insecticides (Rifen)', count: 41 },
  { id: 'bio_fertiliser', label: 'Bio-Fertilisers & Nano', count: 29 },
  { id: 'soil_amendment', label: 'Soil Amendments & Humic', count: 34 },
  { id: 'sprayer',        label: 'Precision Sprayers & Drip', count: 9 },
  { id: 'kit',            label: 'Kits & Bundles', count: 12 },
]

export default function Shop() {
  const { t } = useLang()
  const { addItem } = useCart()

  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]       = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const [category, setCategory] = useState('')
  const [sort, setSort]         = useState('recommended')
  const [page, setPage]         = useState(1)
  const [search, setSearch]     = useState(() => {
    const p = new URLSearchParams(window.location.search)
    return p.get('search') || ''
  })

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ category, sort, page, per_page: 9 })
    if (search) params.set('search', search)
    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(d => {
        setProducts(d.products || [])
        setTotal(d.total || 0)
        setTotalPages(d.total_pages || 1)
        setCategories(d.categories || CATEGORIES)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category, sort, page, search])

  const FilterPanel = () => (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-text-primary text-sm">Formulation Filters</h3>
        <button onClick={() => { setCategory(''); setSort('recommended'); setPage(1) }}
          className="text-xxs text-primary hover:underline">Reset</button>
      </div>

      {/* Input Category */}
      <div>
        <p className="text-xs font-semibold text-text-primary mb-2">Input Category</p>
        <div className="space-y-1.5">
          {CATEGORIES.map(cat => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
              <input type="radio" name="category" checked={category === cat.id}
                onChange={() => { setCategory(cat.id); setPage(1) }}
                className="accent-primary w-4 h-4" />
              <span className={`text-xs flex-1 group-hover:text-primary transition-colors
                ${category === cat.id ? 'text-primary font-medium' : 'text-text-muted'}`}>
                {cat.label}
              </span>
              <span className="text-xxs text-text-muted">{cat.count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Assurance Seals */}
      <div>
        <p className="text-xs font-semibold text-text-primary mb-2">Assurance Seals</p>
        <div className="space-y-1.5">
          {['Genuine Certificate', 'Cash on Delivery Eligible', 'Same-Day Dispatch'].map(seal => (
            <label key={seal} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-primary w-4 h-4" />
              <span className="text-xs text-text-muted">{seal}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  )

  return (
    <div className="max-w-container mx-auto px-3 md:px-6 py-4 md:py-6">
      {/* Header */}
      <div className="mb-4">
        <div className="text-xs text-text-muted mb-1">
          <Link to="/" className="hover:text-primary">Home</Link> / Shop Agri-Inputs / Crop Protection &amp; Nutrition
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-text-primary">Verified Agri-Inputs &amp; Formulations</h1>
            <p className="text-xs text-text-muted mt-0.5">
              Showing {total} certified batch-verified inputs for Southern Rajasthan
              <SampleDataLabel className="ml-2" />
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-text-muted">Sort:</label>
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }}
              className="input text-xs py-1.5 w-auto">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <SampleDataBanner />

      <div className="flex gap-6">
        {/* Sidebar — desktop */}
        <div className="hidden lg:block w-60 shrink-0">
          <div className="card sticky top-20">
            <FilterPanel />
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Mobile filter button */}
          <div className="lg:hidden mb-4">
            <button onClick={() => setFiltersOpen(true)}
              className="btn-outline text-xs gap-2 w-full">
              <Filter className="w-4 h-4" /> {t('shop.filters')}
              {category && <span className="badge-green text-xxs">1 active</span>}
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="card h-64 animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card flex flex-col items-center gap-4 py-12 text-text-muted">
              <span className="text-4xl">🌿</span>
              <p>No products found. <button onClick={() => setCategory('')} className="text-primary hover:underline">Clear filters</button></p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-outline p-2 disabled:opacity-40" aria-label="Previous page">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-text-muted">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="btn-outline p-2 disabled:opacity-40" aria-label="Next page">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Trust strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            {[
              { icon: '✅', title: '100% Genuine Batch', desc: 'Direct manufacturer dispatch with verifiable lab certificates and batch traceability.' },
              { icon: '🚚', title: 'Free Udaipur Delivery', desc: 'Eligible on orders above ₹799 across Girwa, Mavli, Vallabhnagar & Badgaon.' },
              { icon: '💵', title: 'Cash on Delivery', desc: 'You can cash or scan UPI at your doorstep upon receiving sealed product packages.' },
              { icon: '📞', title: 'Doctor Tele-Advisory', desc: 'Free dosage consultation & spray schedule support via toll-free number ([Helpline number]).' },
            ].map(f => (
              <div key={f.title} className="card text-center py-4">
                <span className="text-2xl">{f.icon}</span>
                <p className="font-semibold text-xs text-text-primary mt-2">{f.title}</p>
                <p className="text-xxs text-text-muted mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile filter bottom sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="relative bg-white rounded-t-2xl p-5 max-h-[80dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-text-primary">Filters</h3>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters"
                className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <FilterPanel />
            <button onClick={() => setFiltersOpen(false)} className="btn-green w-full mt-4">
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
