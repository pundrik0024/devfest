import { useLang } from '../../context/LangContext'
import { Phone } from 'lucide-react'

export default function TopBar() {
  const { t } = useLang()
  return (
    <div className="hidden md:block bg-topbar text-white text-xs py-1.5">
      <div className="max-w-container mx-auto px-3 md:px-6 flex items-center justify-between gap-4">
        {/* Left: partner strip */}
        <div className="flex items-center gap-4 min-w-0">
          <span className="flex items-center gap-1.5 opacity-90 truncate">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shrink-0" />
            <span className="font-medium">ICAR &amp; Maharana Pratap University Agri-Intelligence Partner</span>
          </span>
          <span className="hidden lg:block opacity-70 shrink-0">Southern Rajasthan Hydrological Belt</span>
        </div>

        {/* Right: helpline */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:[Helpline number]"
            className="flex items-center gap-1 font-semibold bg-white/10 hover:bg-white/20 transition-colors px-2 py-0.5 rounded"
            aria-label="Kisan care helpline"
          >
            <Phone className="w-3 h-3" />
            Kisan Care: {t('header.helpline')}
          </a>
        </div>
      </div>
    </div>
  )
}
