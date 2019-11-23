import { remote } from 'electron'
import nanoid from 'nanoid'
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import TabUtils from '~/utils/tab'
import Tab, { homeUrl } from '~/models/tab'
import App from '~/models/app'

const convertTab = (tab: Tab): Tab => {
  return {
    ...tab,
    host: TabUtils.getHost(tab.url),
    badge: TabUtils.getBadge(tab.title)
  }
}

const createTabSort = (sortedIds: string[]) => {
  return (a: Tab, b: Tab) => {
    const aIndex = sortedIds.includes(a.id) ? sortedIds.indexOf(a.id) : Infinity
    const bIndex = sortedIds.includes(b.id) ? sortedIds.indexOf(b.id) : Infinity
    if (aIndex === bIndex) {
      return a.createdAt > b.createdAt ? 1 : -1
    }
    return aIndex > bIndex ? 1 : -1
  }
}

const createAppSort = (sortedHosts: string[]) => {
  return (a: App, b: App) => {
    const aIndex = sortedHosts.includes(a.host)
      ? sortedHosts.indexOf(a.host)
      : Infinity
    const bIndex = sortedHosts.includes(b.host)
      ? sortedHosts.indexOf(b.host)
      : Infinity
    return aIndex > bIndex ? 1 : -1
  }
}

@Module({
  name: 'tab',
  stateFactory: true,
  namespaced: true
})
export default class TabModule extends VuexModule {
  tabs: Tab[] = []
  activeId = ''
  history: string[] = []
  historyIndex = -1
  sortedIds: string[] = []
  sortedHosts: string[] = []
  sortedIdsOnHost: { [host: string]: string[] } = {}

  get activeTab() {
    return this.getTab({ id: this.activeId })
  }
  get activeIndex() {
    return this.sortedTabs.findIndex((tab) => tab.id === this.activeId)
  }
  get sortedTabs() {
    return this.tabs.slice().sort(createTabSort(this.sortedIds))
  }
  get sortedApps() {
    return Object.values(
      this.tabs.slice().reduce((carry: { [key: string]: App }, tab) => {
        if (carry[tab.host]) {
          return {
            ...carry,
            [tab.host]: <App>{
              ...carry[tab.host],
              tabs: [...carry[tab.host].tabs, tab]
            }
          }
        }
        return {
          ...carry,
          [tab.host]: <App>{
            host: tab.host,
            favicon: tab.favicon,
            tabs: [tab]
          }
        }
      }, {})
    )
      .sort(createAppSort(this.sortedHosts))
      .map((app) => {
        return {
          ...app,
          tabs: app.tabs.sort(
            createTabSort(this.sortedIdsOnHost[app.host] || [])
          )
        }
      })
  }
  get recentTabs() {
    const recentIds = this.history
      .slice()
      .reverse()
      .reduce((carry: string[], id) => {
        if (carry.includes(id)) {
          return carry
        }
        return [...carry, id]
      }, [])
    return this.tabs.slice().sort(createTabSort(recentIds))
  }
  get totalBadges() {
    return this.tabs.reduce((carry, tab) => carry + tab.badge, 0)
  }
  get canGoBackTab() {
    return !!this.history[this.historyIndex - 1]
  }
  get canGoForwardTab() {
    return !!this.history[this.historyIndex + 1]
  }
  get backTabHistory() {
    return this.history
      .slice(0, this.historyIndex)
      .map((id) => this.getTab({ id }))
      .reverse()
  }
  get forwardTabHistory() {
    return this.history
      .slice(this.historyIndex + 1)
      .map((id) => this.getTab({ id }))
  }
  get isActiveTab() {
    return ({ id }: { id: string }) => id === this.activeId
  }
  get getTab() {
    return ({ id }: { id: string }) => this.tabs.find((tab) => tab.id === id)
  }

  @Mutation
  setTabs({ tabs }: { tabs: Tab[] }) {
    this.tabs = tabs
  }
  @Mutation
  setActiveId({ activeId }: { activeId: string }) {
    this.activeId = activeId
  }
  @Mutation
  setHistory({ history }: { history: string[] }) {
    this.history = history
  }
  @Mutation
  setHistoryIndex({ historyIndex }: { historyIndex: number }) {
    this.historyIndex = historyIndex
  }
  @Mutation
  setSortedIds({ sortedIds }: { sortedIds: string[] }) {
    this.sortedIds = sortedIds
  }
  @Mutation
  setSortedHosts({ sortedHosts }: { sortedHosts: string[] }) {
    this.sortedHosts = sortedHosts
  }
  @Mutation
  setSortedIdsOnHost({
    sortedIdsOnHost
  }: {
    sortedIdsOnHost: { [host: string]: string[] }
  }) {
    this.sortedIdsOnHost = sortedIdsOnHost
  }

  @Action
  newTab({
    options,
    ...params
  }: Partial<Tab> & {
    options?: {
      activate?: boolean
      position?: string
      srcId?: string
      openerId?: string
    }
  } = {}) {
    const {
      activate = true,
      position = 'last',
      srcId = this.activeId,
      openerId = ''
    } = options || {}
    const id = nanoid()
    const url = homeUrl
    const tab = convertTab({
      id,
      url,
      host: '',
      title: 'Loading...',
      badge: 0,
      favicon: '',
      loading: false,
      canGoBack: false,
      canGoForward: false,
      query: '',
      finding: false,
      findingText: '',
      foundActiveMatchOrdinal: 0,
      foundMatches: 0,
      loaded: false,
      openerId,
      createdAt: Date.now(),
      ...params
    })
    // Set url to query on new tab
    if (url !== tab.url) {
      tab.query = tab.url
    }

    let index
    switch (position) {
      case 'next':
        index = this.sortedTabs.findIndex((tab) => tab.id === srcId) + 1
        break
      case 'last':
      default:
        index = this.tabs.length
        break
    }

    const tabs = [...this.tabs, tab]
    this.setTabs({ tabs })

    const sortedIds = [
      ...this.sortedIds.slice(0, index),
      tab.id,
      ...this.sortedIds.slice(index)
    ]
    this.setSortedIds({ sortedIds })

    if (activate) {
      this.activateTab({ id })
    }
  }
  @Action
  newTabIfEmpty() {
    if (!this.tabs.length) {
      this.newTab()
    }
  }
  @Action
  duplicateTab({ id }: { id: string }) {
    const tab = this.getTab({ id })
    if (tab) {
      this.newTab({
        url: tab.url,
        options: { position: 'next', srcId: tab.id, openerId: tab.id }
      })
    }
  }
  @Action
  updateTab({ id, ...params }: Partial<Tab>) {
    const tabs = this.tabs.map((tab) => {
      if (tab.id !== id) {
        return tab
      }
      return convertTab({ ...tab, ...params })
    })
    this.setTabs({ tabs })
  }
  @Action
  activateTab({ id }: { id: string }) {
    if (id === this.activeId) {
      return
    }
    this.setActiveId({ activeId: id })
    if (id) {
      const history = [
        ...this.history.slice(0, this.historyIndex + 1),
        id
      ].slice(-1001)
      this.setHistory({ history })
      this.setHistoryIndex({ historyIndex: history.length - 1 })
    } else {
      this.setHistory({ history: [] })
      this.setHistoryIndex({ historyIndex: -1 })
    }
  }
  @Action
  activateTabIndex({ index }: { index: number }) {
    const tab = this.sortedTabs[index]
    if (!tab) {
      return
    }
    this.activateTab({ id: tab.id })
  }
  @Action
  closeTabs({ ids }: { ids: string[] }) {
    const activeIndex = this.activeIndex

    const tabs = this.tabs.filter((tab) => !ids.includes(tab.id))
    this.setTabs({ tabs })

    const existIds = tabs.map((tab) => tab.id)

    if (!existIds.includes(this.activeId)) {
      const index = Math.min(activeIndex, tabs.length - 1)
      this.activateTabIndex({ index })
    }

    const sortedIds = this.sortedIds.filter((id) => existIds.includes(id))
    this.setSortedIds({ sortedIds })

    const history = this.history
      .slice()
      .filter((item) => existIds.includes(item))
    const historyIndex =
      this.historyIndex -
      this.history
        .slice(0, this.historyIndex)
        .filter((item) => !existIds.includes(item)).length
    this.setHistory({ history })
    this.setHistoryIndex({ historyIndex })

    if (!this.tabs.length) {
      remote.getCurrentWindow().close()
    }
  }
  @Action
  closeTab({ id }: { id: string }) {
    // back tab if prev tab is opener
    if (id === this.activeId) {
      const tab = this.getTab({ id })
      if (tab && tab.openerId === this.history[this.historyIndex - 1]) {
        this.goBackTab()
      }
    }
    this.closeTabs({ ids: [id] })
  }
  @Action
  closeApp({ host }: { host: string }) {
    const ids = this.tabs
      .filter((tab) => tab.host === host)
      .map((tab) => tab.id)
    this.closeTabs({ ids })
  }
  @Action
  sortTabs({ ids }: { ids: string[] }) {
    this.setSortedIds({ sortedIds: ids })
  }
  @Action
  sortApps({ hosts }: { hosts: string[] }) {
    this.setSortedHosts({ sortedHosts: hosts })
  }
  @Action
  sortTabsOnApp({ ids, host }: { ids: string[]; host: string }) {
    const sortedIdsOnHost = {
      ...this.sortedIdsOnHost,
      [host]: ids
    }
    this.setSortedIdsOnHost({ sortedIdsOnHost })
  }
  @Action
  goToOffsetTab({ offset }: { offset: number }) {
    const index = this.historyIndex + offset
    const id = this.history[index]
    if (!id) {
      return
    }
    this.setActiveId({ activeId: id })
    this.setHistoryIndex({ historyIndex: index })
  }
  @Action
  goNextTab() {
    let index = this.activeIndex + 1
    if (index > this.tabs.length - 1) {
      index = 0
    }
    this.activateTabIndex({ index })
  }
  @Action
  goPreviousTab() {
    let index = this.activeIndex - 1
    if (index < 0) {
      index = this.tabs.length - 1
    }
    this.activateTabIndex({ index })
  }
  @Action
  goBackTab() {
    this.goToOffsetTab({ offset: -1 })
  }
  @Action
  goForwardTab() {
    this.goToOffsetTab({ offset: 1 })
  }
}
