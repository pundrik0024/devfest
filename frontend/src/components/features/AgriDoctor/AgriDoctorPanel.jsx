import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Send, Volume2, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { useSpeech } from '../../../hooks/useSpeech'
import { useLang } from '../../../context/LangContext'
import { AIDisclaimer } from '../../ui/SampleDataLabel'
import { apiFetch } from '../../../lib/api'

// Location constants for Udaipur, Rajasthan
const LOCATION_LABEL = 'Udaipur, Rajasthan'
const LAT = 24.5854
const LON = 73.7125

// Language options supported by the panel
const LANG_OPTIONS = [
  { code: 'hi', sttCode: 'hi-IN', label: 'हिंदी' },
  { code: 'en', sttCode: 'en-IN', label: 'EN' },
]

export default function AgriDoctorPanel() {
  const { t } = useLang()

  // Selected language for STT / API call
  const [selectedLang, setSelectedLang] = useState(LANG_OPTIONS[0])

  const speech = useSpeech({ lang: selectedLang.sttCode })
  const { isListening, transcript, isSpeaking, startListening, stopListening, speak, stopSpeaking } = speech

  // Detect browser STT support once on mount
  const [sttSupported, setSttSupported] = useState(false)
  useEffect(() => {
    setSttSupported(
      typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    )
  }, [])

  // Text input value (synced from transcript when STT fires)
  const [inputText, setInputText] = useState('')
  const inputRef = useRef(null)

  // Sync transcript → input while listening
  useEffect(() => {
    if (transcript) {
      setInputText(transcript)
    }
  }, [transcript])

  // API state
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState(null)   // { text: string }
  const [apiError, setApiError] = useState(null)

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleMicToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      setInputText('')
      setAnswer(null)
      setApiError(null)
      startListening()
    }
  }

  const handleLangSwitch = (option) => {
    if (isListening) stopListening()
    setSelectedLang(option)
    setInputText('')
    setAnswer(null)
    setApiError(null)
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const question = inputText.trim()
    if (!question || loading) return

    if (isListening) stopListening()
    if (isSpeaking) stopSpeaking()

    setLoading(true)
    setAnswer(null)
    setApiError(null)

    try {
      const res = await apiFetch('/api/agri-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          location: LOCATION_LABEL,
          lang: selectedLang.code,
          lat: LAT,
          lon: LON,
        }),
      })

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody?.detail || `Server error ${res.status}`)
      }

      const data = await res.json()
      setAnswer({ text: data.answer ?? data.text ?? JSON.stringify(data) })
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePlayAgain = () => {
    if (!answer?.text) return
    if (isSpeaking) {
      stopSpeaking()
    } else {
      speak(answer.text)
    }
  }

  const handleReset = () => {
    if (isListening) stopListening()
    if (isSpeaking) stopSpeaking()
    setInputText('')
    setAnswer(null)
    setApiError(null)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <section
      aria-label="AI Agri-Doctor"
      className="flex flex-col gap-4 w-full"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-primary leading-tight">
            🌿 {t('agriDoctor.title') || 'AI Agri-Doctor'}
          </h2>
          <p className="text-xxs text-gray-500 mt-0.5">
            {t('agriDoctor.subtitle') || 'Ask anything about your crops, pests, soil & weather'}
          </p>
        </div>

        {/* Language toggle */}
        <div
          role="group"
          aria-label="Language selector"
          className="flex rounded-full border border-primary/30 overflow-hidden shrink-0"
        >
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              onClick={() => handleLangSwitch(opt)}
              className={[
                'px-3 py-1 text-xxs font-semibold transition-colors min-touch',
                selectedLang.code === opt.code
                  ? 'bg-primary text-white'
                  : 'bg-white text-primary hover:bg-primary/10',
              ].join(' ')}
              aria-pressed={selectedLang.code === opt.code}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mic Button (STT supported only) ── */}
      {sttSupported && (
        <div className="flex flex-col items-center gap-2">
          <div className="relative flex items-center justify-center">
            {/* Pulse rings when listening */}
            {isListening && (
              <>
                <span className="absolute inline-flex h-20 w-20 rounded-full bg-primary/20 animate-ping" />
                <span className="absolute inline-flex h-16 w-16 rounded-full bg-primary/15 animate-ping [animation-delay:150ms]" />
              </>
            )}
            <button
              onClick={handleMicToggle}
              disabled={loading}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
              className={[
                'relative z-10 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 min-touch',
                isListening
                  ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300 scale-110'
                  : 'bg-primary hover:bg-primary/90 focus:ring-primary/30',
                loading ? 'opacity-50 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {isListening ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
          <p className="text-xxs text-gray-400 text-center">
            {isListening
              ? (t('agriDoctor.listening') || 'Listening… tap to stop')
              : (t('agriDoctor.tapMic') || 'Tap mic to ask by voice')}
          </p>
        </div>
      )}

      {/* ── Text Input ── */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="relative flex-1">
          <label htmlFor="agri-doctor-input" className="sr-only">
            {t('agriDoctor.placeholder') || 'Type your farming question…'}
          </label>
          <textarea
            id="agri-doctor-input"
            ref={inputRef}
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder={
              t('agriDoctor.placeholder') ||
              (selectedLang.code === 'hi'
                ? 'अपनी फसल की समस्या यहाँ लिखें…'
                : 'Type your crop / pest / soil question…')
            }
            disabled={loading}
            className={[
              'w-full resize-none rounded-xl border px-3 py-2.5 text-sm bg-white shadow-sm transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
              loading
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-800 placeholder-gray-400',
            ].join(' ')}
          />
          {/* Character hint */}
          {inputText.length > 0 && (
            <span className="absolute bottom-2 right-3 text-xxs text-gray-300 pointer-events-none select-none">
              {inputText.length}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          aria-label="Send question"
          className={[
            'flex items-center justify-center w-11 h-11 rounded-xl shadow transition-all min-touch shrink-0',
            inputText.trim() && !loading
              ? 'bg-primary text-white hover:bg-primary/90 active:scale-95'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed',
          ].join(' ')}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>

      {/* ── Loading State ── */}
      {loading && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/5 border border-primary/15"
        >
          <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
          <span className="text-xs text-primary font-medium">
            {t('agriDoctor.analyzing') || 'Analysing your question…'}
          </span>
        </div>
      )}

      {/* ── Error State ── */}
      {apiError && !loading && (
        <div
          role="alert"
          className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200"
        >
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-red-600">
              {t('agriDoctor.errorTitle') || 'Could not get an answer'}
            </p>
            <p className="text-xxs text-red-500 mt-0.5 break-words">{apiError}</p>
          </div>
          <button
            onClick={handleReset}
            aria-label="Dismiss error and try again"
            className="text-red-400 hover:text-red-600 transition-colors min-touch shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Answer Card ── */}
      {answer && !loading && (
        <div
          role="region"
          aria-label="AI Answer"
          className="rounded-2xl border border-primary/20 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm overflow-hidden"
        >
          {/* Card header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-primary/[0.08] border-b border-primary/15">
            <span className="text-xxs font-semibold text-primary uppercase tracking-wide">
              {t('agriDoctor.answerLabel') || 'AI Recommendation'}
            </span>
            <div className="flex items-center gap-1.5">
              {/* Play / Stop TTS button */}
              <button
                onClick={handlePlayAgain}
                aria-label={isSpeaking ? 'Stop reading aloud' : 'Play answer aloud'}
                className={[
                  'flex items-center gap-1 px-2.5 py-1 rounded-full text-xxs font-medium transition-all min-touch',
                  isSpeaking
                    ? 'bg-amber-100 text-amber-600 border border-amber-300 animate-pulse'
                    : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20',
                ].join(' ')}
              >
                <Volume2 className="w-3 h-3" />
                {isSpeaking
                  ? (t('agriDoctor.stop') || 'Stop')
                  : (t('agriDoctor.playAgain') || 'Play')}
              </button>

              {/* Reset / ask again */}
              <button
                onClick={handleReset}
                aria-label="Ask a new question"
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xxs font-medium bg-white text-gray-500 hover:bg-gray-100 border border-gray-200 transition-all min-touch"
              >
                <RefreshCw className="w-3 h-3" />
                {t('agriDoctor.askAgain') || 'New'}
              </button>
            </div>
          </div>

          {/* Answer body */}
          <div className="px-4 py-3">
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
              {answer.text}
            </p>
          </div>

          {/* AI Disclaimer */}
          <div className="px-4 pb-3">
            <AIDisclaimer />
          </div>
        </div>
      )}

      {/* Bottom safe padding for mobile tab bar */}
      <div className="pb-20 md:pb-0" />
    </section>
  )
}
