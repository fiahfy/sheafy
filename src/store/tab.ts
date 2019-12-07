import { remote } from 'electron'
import nanoid from 'nanoid'
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import TabUtils from '~/utils/tab'
import App from '~/models/app'
import Tab, { homeUrl } from '~/models/tab'
import TabHistoryItem from '~/models/tab-history-item'

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
  activeViewId = 'primary'
  activeTabIds: { [viewId: string]: string } = {}
  tabHistories: { [viewId: string]: TabHistoryItem[] } = {}
  tabHistoryIndexes: { [viewId: string]: number } = {}
  sortedIds: string[] = []
  sortedHosts: string[] = []
  sortedIdsOnHost: { [host: string]: string[] } = {}

  get multiView() {
    return !!this.activeTabIds.secondary
  }

  get duplicatedView() {
    return this.activeTabIds.primary === this.activeTabIds.secondary
  }

  get canCloseView() {
    return !!this.activeTabIds.primary && !!this.activeTabIds.secondary
  }

  get totalBadges() {
    return this.tabs.reduce((carry, tab) => carry + tab.badge, 0)
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
    const recentIds = Object.keys(this.tabHistories)
      .reduce((carry: TabHistoryItem[], viewId) => {
        return [...carry, ...this.tabHistories[viewId]]
      }, [])
      .sort((a, b) => {
        return a.createdAt > b.createdAt ? -1 : 1
      })
      .map((item) => item.id)
      .reduce((carry: string[], id) => {
        if (carry.includes(id)) {
          return carry
        }
        return [...carry, id]
      }, [])
    return this.tabs.slice().sort(createTabSort(recentIds))
  }

  get getTab() {
    return ({ id }: { id: string }) => this.tabs.find((tab) => tab.id === id)
  }

  get getTabWithIndex() {
    return ({ index }: { index: number }): Tab | undefined =>
      this.sortedTabs[index]
  }

  get getTabIndex() {
    return ({ id }: { id: string }) =>
      this.sortedTabs.findIndex((tab) => tab.id === id)
  }

  get getActiveTab() {
    return ({ viewId }: { viewId: string }) => {
      const id = this.activeTabIds[viewId]
      return this.getTab({ id })
    }
  }

  get getActiveTabIndex() {
    return ({ viewId }: { viewId: string }) => {
      const id = this.activeTabIds[viewId]
      return this.getTabIndex({ id })
    }
  }

  get isActiveView() {
    return ({ id }: { id: string }) => id === this.activeViewId
  }

  get isActiveTab() {
    return ({ id }: { id: string }) => {
      return Object.values(this.activeTabIds).includes(id)
    }
  }

  get getViewId() {
    return ({ tabId }: { tabId: string }) => {
      return Object.entries(this.activeTabIds)
        .reverse()
        .reduce((carry: { [tabId: string]: string }, [key, value]) => {
          return {
            ...carry,
            [value]: key
          }
        }, {})[tabId]
    }
  }

  get getTabHistory() {
    return ({ viewId }: { viewId: string }) => {
      const history = this.tabHistories[viewId]
      return history === undefined ? [] : history
    }
  }

  get getTabHistoryIndex() {
    return ({ viewId }: { viewId: string }) => {
      const index = this.tabHistoryIndexes[viewId]
      return index === undefined ? -1 : index
    }
  }

  get getBackTabHistory() {
    return ({ viewId }: { viewId: string }) => {
      const history = this.getTabHistory({ viewId })
      const index = this.getTabHistoryIndex({ viewId })
      return history
        .slice(0, index)
        .map((item) => this.getTab({ id: item.id }))
        .reverse()
    }
  }

  get getForwardTabHistory() {
    return ({ viewId }: { viewId: string }) => {
      const history = this.getTabHistory({ viewId })
      const index = this.getTabHistoryIndex({ viewId })
      return history
        .slice(index + 1)
        .map((item) => this.getTab({ id: item.id }))
    }
  }

  get getCanGoBackTab() {
    return ({ viewId }: { viewId: string }) => {
      const history = this.getTabHistory({ viewId })
      const index = this.getTabHistoryIndex({ viewId }) - 1
      return !!history[index]
    }
  }

  get getCanGoForwardTab() {
    return ({ viewId }: { viewId: string }) => {
      const history = this.getTabHistory({ viewId })
      const index = this.getTabHistoryIndex({ viewId }) + 1
      return !!history[index]
    }
  }

  @Mutation
  setTabs({ tabs }: { tabs: Tab[] }) {
    this.tabs = tabs
  }

  @Mutation
  setActiveViewId({ activeViewId }: { activeViewId: string }) {
    this.activeViewId = activeViewId
  }

  @Mutation
  setActiveTabId({
    activeTabId,
    viewId
  }: {
    activeTabId: string
    viewId: string
  }) {
    this.activeTabIds = {
      ...this.activeTabIds,
      [viewId]: activeTabId
    }
  }

  @Mutation
  setTabHistory({
    tabHistory,
    viewId
  }: {
    tabHistory: TabHistoryItem[]
    viewId: string
  }) {
    this.tabHistories = {
      ...this.tabHistories,
      [viewId]: tabHistory
    }
  }

  @Mutation
  setTabHistoryIndex({
    tabHistoryIndex,
    viewId
  }: {
    tabHistoryIndex: number
    viewId: string
  }) {
    this.tabHistoryIndexes = {
      ...this.tabHistoryIndexes,
      [viewId]: tabHistoryIndex
    }
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
      viewId?: string
    }
  } = {}) {
    const {
      activate = true,
      position = 'last',
      srcId = this.activeTabIds[this.activeViewId],
      openerId = '',
      viewId = this.activeViewId
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
        index = this.getTabIndex({ id: srcId }) + 1
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
      this.activateTab({ id, viewId })
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
  activateTab({ id, viewId }: { id: string; viewId: string }) {
    if (id === this.activeTabIds[viewId]) {
      return
    }
    this.setActiveTabId({ activeTabId: id, viewId })

    const history = this.getTabHistory({ viewId })
    const index = this.getTabHistoryIndex({ viewId })
    const newHistory = [
      ...history.slice(0, index + 1),
      {
        id,
        createdAt: Date.now()
      }
    ].slice(-1001)
    this.setTabHistory({ tabHistory: newHistory, viewId })
    this.setTabHistoryIndex({
      tabHistoryIndex: newHistory.length - 1,
      viewId
    })
  }

  @Action
  closeTabs({ ids }: { ids: string[] }) {
    // TODO: MV
    // const activeIndex = this.activeIndex

    const tabs = this.tabs.filter((tab) => !ids.includes(tab.id))
    this.setTabs({ tabs })

    const existIds = tabs.map((tab) => tab.id)

      // if (!existIds.includes(this.activeId)) {
      //   const index = Math.min(activeIndex, tabs.length - 1)
      //   this.activateTabIndex({ index })
      // }
    ;['primary', 'secondary'].forEach((viewId) => {
      if (
        this.activeTabIds[viewId] &&
        !existIds.includes(this.activeTabIds[viewId])
      ) {
        const tab = this.getTabWithIndex({ index: 0 })
        if (tab) {
          this.activateTab({ id: tab.id, viewId })
        }
      }

      const history = this.getTabHistory({ viewId })
      const index = this.getTabHistoryIndex({ viewId })
      const newHistory = history
        .slice()
        .filter((item) => existIds.includes(item.id))
      const newIndex =
        index -
        history.slice(0, index).filter((item) => !existIds.includes(item.id))
          .length
      this.setTabHistory({ tabHistory: newHistory, viewId })
      this.setTabHistoryIndex({ tabHistoryIndex: newIndex, viewId })
    })

    if (!this.tabs.length) {
      remote.getCurrentWindow().close()
    }
  }

  @Action
  closeTab({ id }: { id: string }) {
    // TODO: MV
    // back tab if prev tab is opener
    // if (id === this.activeId) {
    //   const tab = this.getTab({ id })
    //   if (tab && tab.openerId === this.history[this.historyIndex - 1]) {
    //     this.goBackTab()
    //   }
    // }
    ;['primary', 'secondary'].forEach((viewId) => {
      if (id === this.activeTabIds[viewId]) {
        this.goBackTab({ viewId })
      }
    })
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
  activateView({ id }: { id: string }) {
    this.setActiveViewId({ activeViewId: id })
  }

  @Action
  closeView({ id }: { id: string }) {
    if (id === 'primary') {
      this.setActiveTabId({
        activeTabId: this.activeTabIds.secondary,
        viewId: 'primary'
      })
      this.setTabHistory({
        tabHistory: this.tabHistories.secondary,
        viewId: 'primary'
      })
      this.setTabHistoryIndex({
        tabHistoryIndex: this.tabHistoryIndexes.secondary,
        viewId: 'primary'
      })
      this.setActiveTabId({ activeTabId: '', viewId: 'secondary' })
      this.setTabHistory({ tabHistory: [], viewId: 'secondary' })
      this.setTabHistoryIndex({ tabHistoryIndex: -1, viewId: 'secondary' })
    }
    this.setActiveViewId({ activeViewId: 'primary' })
    this.setActiveTabId({ activeTabId: '', viewId: 'secondary' })
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
  goToOffsetTab({ offset, viewId }: { offset: number; viewId: string }) {
    const index = this.getTabHistoryIndex({ viewId }) + offset
    const history = this.getTabHistory({ viewId })
    const historyItem = history[index]
    if (!historyItem) {
      return
    }
    this.setActiveTabId({ activeTabId: historyItem.id, viewId })
    this.setTabHistoryIndex({ tabHistoryIndex: index, viewId })
  }

  @Action
  goBackTab({ viewId }: { viewId: string }) {
    this.goToOffsetTab({ offset: -1, viewId })
  }

  @Action
  goForwardTab({ viewId }: { viewId: string }) {
    this.goToOffsetTab({ offset: 1, viewId })
  }

  @Action
  goNextTab({ viewId }: { viewId: string }) {
    let index = this.getActiveTabIndex({ viewId }) + 1
    if (index > this.tabs.length - 1) {
      index = 0
    }
    const tab = this.getTabWithIndex({ index })
    if (!tab) {
      return
    }
    this.activateTab({ id: tab.id, viewId })
  }

  @Action
  goPreviousTab({ viewId }: { viewId: string }) {
    let index = this.getActiveTabIndex({ viewId }) - 1
    if (index < 0) {
      index = this.tabs.length - 1
    }
    const tab = this.getTabWithIndex({ index })
    if (!tab) {
      return
    }
    this.activateTab({ id: tab.id, viewId })
  }
}
