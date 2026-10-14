import { useState, useRef, useCallback } from 'react'

/**
 * Web Speech API hook for STT (SpeechRecognition) + TTS (SpeechSynthesis).
 * Falls back gracefully when browser does not support one or both APIs.
 */
export function useSpeech({ lang = 'hi-IN' } = {}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [sttSupported] = useState(() => !!(window.SpeechRecognition || window.webkitSpeechRecognition))
  const [ttsSupported] = useState(() => !!window.speechSynthesis)
  const recognitionRef = useRef(null)

  const startListening = useCallback(() => {
    if (!sttSupported) return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = lang
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('')
      setTranscript(t)
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
    setTranscript('')
  }, [lang, sttSupported])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const speak = useCallback((text, speakLang = lang) => {
    if (!ttsSupported || !text) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = speakLang
    utter.rate = 0.9
    utter.onstart = () => setIsSpeaking(true)
    utter.onend = () => setIsSpeaking(false)
    utter.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utter)
  }, [lang, ttsSupported])

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel()
    setIsSpeaking(false)
  }, [])

  const clearTranscript = useCallback(() => setTranscript(''), [])

  return {
    isListening, transcript, isSpeaking,
    sttSupported, ttsSupported,
    startListening, stopListening,
    speak, stopSpeaking, clearTranscript,
  }
}
