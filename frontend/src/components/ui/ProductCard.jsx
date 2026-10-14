import { useCart } from '../../context/CartContext'
import { ShoppingCart, Package, BadgeCheck } from 'lucide-react'
import { SampleDataLabel } from './SampleDataLabel'
import { useLang } from '../../context/LangContext'

const CATEGORY_CONFIG = {
  fungicide:      { cls: 'bg-purple-50 text-purple-700', icon: '🍄', label: 'Fungicide' },
  insecticide:    { cls: 'bg-red-50 text-red-700',       icon: '🐛', label: 'Insecticide' },
  bio_fertiliser: { cls: 'bg-green-50 text-green-700',   icon: '🌱', label: 'Bio-Input' },
  soil_amendment: { cls: 'bg-amber-50 text-amber-700',   icon: '🪨', label: 'Soil Amendment' },
  sprayer:        { cls: 'bg-blue-50 text-blue-700',     icon: '💧', label: 'Sprayer' },
  kit:            { cls: 'bg-primary-50 text-primary-700',icon: '📦', label: 'Kit' },
}

const BG_GRADIENT = {
  fungicide:      'from-purple-50 to-purple-100',
  insecticide:    'from-red-50 to-red-100',
  bio_fertiliser: 'from-green-50 to-green-100',
  soil_amendment: 'from-amber-50 to-amber-100',
  sprayer:        'from-blue-50 to-blue-100',
  kit:            'from-primary-50 to-primary-100',
}

export default function ProductCard({ product, compact = false }) {
  const { addItem, items } = useCart()
  const { t } = useLang()
  const cat = CATEGORY_CONFIG[product.category] || { cls: 'bg-gray-50 text-gray-700', icon: '🌿', label: 'Input' }
  const bg  = BG_GRADIENT[product.category] || 'from-gray-50 to-gray-100'
  const savingPct = product.saving_pct || (
    product.original_price && product.price < product.original_price
      ? Math.round((1 - product.price / product.original_price) * 100)
      : 0
  )
  const inCart = items.some(i => i.product.id === product.id)

  return (
    <article className="card flex flex-col gap-0 p-0 overflow-hidden hover:shadow-card-hover transition-shadow">
      {/* Image area */}
      <div className={`relative w-full h-36 bg-gradient-to-br ${bg} flex items-center justify-center`}>
        <span className="text-5xl">{cat.icon}</span>

        {/* Top-left: certified badge */}
        {product.certified !== false && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 text-green-700 text-xxs font-semibold px-1.5 py-0.5 rounded shadow-sm">
            <BadgeCheck className="w-3 h-3" /> Genuine Certified
          </div>
        )}

        {/* Top-right: saving badge */}
        {savingPct > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xxs font-bold px-1.5 py-0.5 rounded">
            Save {savingPct}%
          </div>
        )}

        {/* Bottom-left: category */}
        <div className={`absolute bottom-2 left-2 text-xxs font-medium px-1.5 py-0.5 rounded ${cat.cls} bg-white/80`}>
          {cat.label}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-3 flex-1">
        {/* Name */}
        <div>
          <h3 className="font-semibold text-text-primary text-sm leading-snug">{product.name}</h3>
          {product.active_ingredient && (
            <p className="text-xxs text-text-muted mt-0.5">{product.active_ingredient}</p>
          )}
        </div>

        {/* Description */}
        {!compact && product.description && (
          <p className="text-xxs text-text-muted line-clamp-2 leading-relaxed">{product.description}</p>
        )}

        {/* Pack size */}
        {product.unit && (
          <p className="text-xxs text-text-muted flex items-center gap-1">
            <Package className="w-3 h-3" /> {product.unit}
          </p>
        )}

        {/* Price row */}
        <div className="flex items-end gap-2 mt-auto">
          <span className="font-bold text-text-primary text-base">₹{product.price}</span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-xs text-text-muted line-through">₹{product.original_price}</span>
          )}
          <SampleDataLabel className="ml-auto" />
        </div>

        {/* Add to cart */}
        <button
          onClick={() => addItem(product)}
          className={`btn-primary w-full text-xs ${inCart ? 'bg-green-600 hover:bg-green-700' : ''}`}
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingCart className="w-4 h-4" />
          {inCart ? 'Added ✓' : t('shop.addToCart')}
        </button>
      </div>
    </article>
  )
}
