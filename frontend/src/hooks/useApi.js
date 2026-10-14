import { useState, useEffect, useCallback } from 'react'

/**
 * Generic API fetch hook with loading/error state.
 */
export function useApi(url, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { auto = true, deps = [] } = options

  const fetch_ = useCallback(async (overrideUrl) => {
    const target = overrideUrl || url
    if (!target) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(target)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    if (auto) fetch_()
  }, [auto, ...deps]) // eslint-disable-line

  return { data, loading, error, refetch: fetch_ }
}
