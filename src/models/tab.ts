export const homeUrl = 'https://www.google.com/?sheafy'

export default interface Tab {
  id: string
  url: string
  host: string
  title: string
  badge: number
  favicon: string
  loading: boolean
  canGoBack: boolean
  canGoForward: boolean
  query: string
  finding: boolean
  findingText: string
  foundActiveMatchOrdinal: number
  foundMatches: number
  loaded: boolean
  openerId: string
  createdAt: number
}
