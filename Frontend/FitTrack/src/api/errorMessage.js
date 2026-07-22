// The API answers errors in two shapes: a plain string (e.g. "Email already in use.")
// and an ASP.NET ProblemDetails object for model-validation failures. Rendering the
// object straight into JSX throws, so callers get a string out of here either way.
export default function errorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const data = err?.response?.data

  if (typeof data === 'string' && data.trim()) return data
  if (typeof data !== 'object' || data === null) return fallback

  if (data.errors) {
    const first = Object.values(data.errors).flat().find((m) => typeof m === 'string' && m.trim())
    if (first) return first
  }

  // In Development the backend puts exception.ToString() — stack trace included — in
  // Detail, so only take it when it looks like a real one-line message.
  if (typeof data.detail === 'string' && data.detail.trim() && data.detail.length < 200 && !data.detail.includes('\n')) {
    return data.detail
  }

  return data.title || fallback
}
