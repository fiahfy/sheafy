export const getHost = (url: string): string => {
  return url.replace(/^https?:\/\/([^/]+).*$/, '$1')
}

export const getBadge = (title: string): number => {
  const match = title.match(/\(([\d,]+)\)\s*/)
  return match ? Number(match[1].replace(',', '')) : 0
}

export const getUrlWithQuery = (query: string) => {
  if (!query) {
    return ''
  }
  if (query.match(/^https?:\/\//)) {
    return query
  } else {
    return 'https://www.google.com/search?q=' + query
  }
}
