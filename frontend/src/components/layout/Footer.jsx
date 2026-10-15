import { Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import { useLang } from '../../context/LangContext'

const SERVICES = [
  'Ask by Voice Diagnosis', 'AI Plant Disease Scanner',
  'Satellite Soil Health Matrix', '20-Day Agro-Forecast',
  'Udaipur Lake Basin Hydrology', 'Watershed Research Data',
]
const CROPS = [
  { name: 'Tomato (टमाटर)', to: '/prices?crop=tomato' },
  { name: 'Mustard (सरसों)', to: '/prices?crop=mustard' },
  { name: 'Chana (चना)', to: '/prices?crop=chana' },
  { name: 'Guava Orchards', to: '/prices' },
  { name: 'Wheat (गेहूँ)', to: '/prices' },
  { name: 'Maize (मक्का)', to: '/prices' },
  { name: 'Onion (प्याज)', to: '/prices' },
  { name: 'Pomegranate', to: '/prices' },
]
const SHOP_LINKS = [
  'Bio-Fungicides & Sprays', 'Neem Formulations & Bio-Pesticides',
  'Mineral Fertilisers & Micro-Nutrients', 'Micro-Drip & Lateral Lines',
  'Knapsack Precision Sprayers',
]

export default function Footer() {
  const { t } = useLang()
  return (
    <footer className="bg-white border-t border-border mt-12" role="contentinfo">
      <div className="max-w-container mx-auto px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Column 1 — About */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center shrink-0">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-primary text-sm">Sentri</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed mb-3">
              Empowering growers of Southern Rajasthan across Girwa, Mavli, Vallabhnagar, Badgaon,
              and Jhadol blocks with clinical crop diagnostics and lake basin watershed hydrology.
            </p>
            <div className="flex gap-2 text-xs">
              <span className="badge-gray">[Partner name]</span>
              <span className="badge-gray">[Certification]</span>
            </div>
          </div>

          {/* Column 2 — Services */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">{t('footer.services')}</h3>
            <ul className="space-y-1.5">
              {SERVICES.map(s => (
                <li key={s}>
                  <Link to="/" className="text-xs text-text-muted hover:text-primary transition-colors focus-visible:outline-none focus-visible:underline">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Regional Crops */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">{t('footer.crops')}</h3>
            <ul className="space-y-1.5">
              {CROPS.map(c => (
                <li key={c.name}>
                  <Link to={c.to} className="text-xs text-text-muted hover:text-primary transition-colors focus-visible:outline-none focus-visible:underline">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Shop */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">{t('footer.shop')}</h3>
            <ul className="space-y-1.5 mb-4">
              {SHOP_LINKS.map(s => (
                <li key={s}>
                  <Link to="/shop" className="text-xs text-text-muted hover:text-primary transition-colors focus-visible:outline-none focus-visible:underline">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
            {/* App store placeholders */}
            <div className="flex gap-2 flex-wrap">
              <a href="#" className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors">Download Mobile Advisory</a>
              <a href="#" className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 transition-colors">Google Play</a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-8 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xxs text-text-muted">
            © 2025 Sentri. All rights reserved. &nbsp;
            <span className="sample-label">Sample data only — not for commercial use</span>
          </p>
          <div className="flex gap-4 text-xs text-text-muted">
            <a href="#" className="hover:text-primary focus-visible:underline">Water Data Policy</a>
            <a href="#" className="hover:text-primary focus-visible:underline">Open Hydrology API</a>
            <a href="#" className="hover:text-primary focus-visible:underline">Privacy & Mandi Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
