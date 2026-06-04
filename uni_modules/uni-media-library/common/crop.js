export function generateCoverURL (url, cropRule) {
  if (!url || !cropRule) return url

  const parsedUrl = new URL(url)

  if (parsedUrl.pathname.endsWith('.webp')) {
    return url
  }

  const isQuery = parsedUrl.search.length > 0

  const separator = isQuery ? '&' : '?'

  return url + separator + cropRule
}
