import { createContext, useContext, useState, useCallback } from 'react'
import en from '../locales/en.json'
import hi from '../locales/hi.json'
import mewari from '../locales/mewari.json'

const LOCALES = { en, hi, mewari }

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en')

  const switchLang = useCallback((l) => {
    setLang(l)
    localStorage.setItem('lang', l)
    document.documentElement.lang = l === 'hi' ? 'hi' : l === 'mewari' ? 'raj' : 'en'
  }, [])

  const t = useCallback((key, vars = {}) => {
    const locale = LOCALES[lang] || LOCALES.en
    let str = locale[key] || LOCALES.en[key] || key
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(`{${k}}`, v)
    })
    return str
  }, [lang])

  return (
    <LangContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}
