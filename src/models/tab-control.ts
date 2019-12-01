export default interface TabControl {
  canGoBack: boolean
  canGoForward: boolean
  query: string
  finding: boolean
  findingText: string
  foundActiveMatchOrdinal: number
  foundMatches: number
  loaded: boolean
}
