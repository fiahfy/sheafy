import Tab from '~/models/tab'

export default interface App {
  host: string
  favicon: string
  tabs: Tab[]
}
