import { useState, useEffect, useCallback, useRef } from 'react'

// Generic fetch→loading→error hook. `fetcher` should resolve to the value
// you want in `data` (e.g. `() => getExercises().then(r => r.data)`).
// `deps` controls when it re-runs, same as a useEffect dependency array.
// Kept in a ref (updated post-render) so `refetch`'s identity stays stable
// without forcing callers to memoize their fetcher.
export function useFetch(fetcher, deps = [], initialData = null) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetcherRef = useRef(fetcher)
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  const refetch = useCallback(() => {
    setLoading(true)
    setError(null)
    return fetcherRef.current()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, setData, refetch }
}
