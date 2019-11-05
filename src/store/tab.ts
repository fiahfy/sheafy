import { remote } from 'electron'
import nanoid from 'nanoid'
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import Tab from '~/models/tab'
import App from '~/models/app'

const getHost = (url: string): string => {
  return url.replace(/^https?:\/\/([^/]+).*$/, '$1')
}

const getBadge = (title: string): number => {
  const match = title.match(/\(([\d,]+)\)\s*/)
  return match ? Number(match[1].replace(',', '')) : 0
}

const convertTab = (tab: Tab): Tab => {
  return {
    ...tab,
    host: getHost(tab.url),
    badge: getBadge(tab.title)
  }
}

@Module({
  name: 'tab',
  stateFactory: true,
  namespaced: true
})
export default class TabModule extends VuexModule {
  tabs: Tab[] = []
  hosts: string[] = []
  activeId = ''
  parentId = ''
  childIds: string[] = []
  history: string[] = []
  historyIndex = -1

  get activeTab() {
    return this.getTab({ id: this.activeId })
  }
  get apps() {
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
    ).sort((a, b) => {
      const aIndex = this.hosts.includes(a.host)
        ? this.hosts.indexOf(a.host)
        : Infinity
      const bIndex = this.hosts.includes(b.host)
        ? this.hosts.indexOf(b.host)
        : Infinity
      return aIndex > bIndex ? 1 : -1
    })
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
  get getUrlWithQuery() {
    return ({ query }: { query: string }) => {
      if (!query) {
        return ''
      }
      if (query.match(/^https?:\/\//)) {
        return query
      } else {
        return 'https://www.google.com/search?q=' + query
      }
    }
  }

  @Mutation
  setTabs({ tabs }: { tabs: Tab[] }) {
    this.tabs = tabs
  }
  @Mutation
  setHosts({ hosts }: { hosts: string[] }) {
    this.hosts = hosts
  }
  @Mutation
  setActiveId({ activeId }: { activeId: string }) {
    this.activeId = activeId
  }
  @Mutation
  setParentId({ parentId }: { parentId: string }) {
    this.parentId = parentId
  }
  @Mutation
  setChildIds({ childIds }: { childIds: string[] }) {
    this.childIds = childIds
  }
  @Mutation
  setHistory({ history }: { history: string[] }) {
    this.history = history
  }
  @Mutation
  setHistoryIndex({ historyIndex }: { historyIndex: number }) {
    this.historyIndex = historyIndex
  }

  @Action
  newTab({
    options,
    ...params
  }: Partial<Tab> & {
    options?: { activate?: boolean; position?: string; srcId?: string }
  } = {}) {
    const { activate = true, position = 'last', srcId = this.activeId } =
      options || {}
    const id = nanoid()
    const url = 'https://www.google.com/?sheafy'
    const tab = convertTab({
      id,
      url,
      host: '',
      title: '',
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
      ...params
    })

    let index
    switch (position) {
      case 'next': {
        const srcIndex = this.tabs.findIndex((tab) => tab.id === srcId)
        // new tab at last when host is different from host in src tab
        if (srcIndex === -1 || tab.host !== this.tabs[srcIndex].host) {
          index = this.tabs.length
        } else {
          index = srcIndex + 1
        }
        break
      }
      case 'last':
      default:
        index = this.tabs.length
        break
    }

    const tabs = [...this.tabs.slice(0, index), tab, ...this.tabs.slice(index)]
    this.setTabs({ tabs })

    const parentId = this.activeId
    let childIds = [tab.id]
    if (parentId === this.parentId) {
      childIds = [...this.childIds.slice(), ...childIds]
    }
    this.setParentId({ parentId })
    this.setChildIds({ childIds })

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
    if (!tab) {
      return
    }
    this.newTab({
      url: tab.url,
      options: { srcId: tab.id, position: 'next' }
    })
  }
  @Action
  updateTab({ id, ...params }: Partial<Tab>) {
    let hostChanged = false
    let tabs = this.tabs.map((tab) => {
      if (tab.id !== id) {
        return tab
      }
      const newTab = convertTab({ ...tab, ...params })
      hostChanged = tab.host !== newTab.host
      return newTab
    })
    // move tab to last when host is changed
    if (hostChanged) {
      const index = tabs.findIndex((tab) => tab.id === id)
      tabs = [...tabs.slice(0, index), ...tabs.slice(index + 1), tabs[index]]
    }
    this.setTabs({ tabs })
  }
  @Action
  closeTab({ id }: { id: string }) {
    if (id === this.activeId) {
      if (this.childIds.includes(id)) {
        const childIds = this.childIds.filter((childId) => childId !== id)
        this.setChildIds({ childIds })
        this.activateTab({ id: this.parentId })
      } else {
        if (id === this.parentId) {
          this.setParentId({ parentId: '' })
          this.setChildIds({ childIds: [] })
        }

        const app = this.apps.find(
          (app) => !!app.tabs.find((tab) => tab.id === id)
        )
        if (app) {
          if (app.tabs.length <= 1) {
            this.closeApp({ host: app.host })
            return
          }
          const index = app.tabs.findIndex((tab) => tab.id === id)
          if (index < app.tabs.length - 1) {
            const id = app.tabs[index + 1].id
            this.activateTab({ id })
          } else if (index > 0) {
            const id = app.tabs[index - 1].id
            this.activateTab({ id })
          } else {
            this.activateTab({ id: '' })
          }
        }
      }
    }

    const tabs = this.tabs.filter((tab) => tab.id !== id)
    this.setTabs({ tabs })

    const previousTabs = this.history
      .slice(0, this.historyIndex)
      .filter((item) => item === id).length
    const history = this.history.slice().filter((item) => item !== id)
    this.setHistory({ history })
    this.setHistoryIndex({
      historyIndex: this.historyIndex - previousTabs
    })

    if (!tabs.length) {
      remote.getCurrentWindow().close()
    }
  }
  @Action
  activateTab({ id }: { id: string }) {
    if (this.activeId === id) {
      return
    }
    if (this.parentId !== id && !this.childIds.includes(id)) {
      this.setParentId({ parentId: '' })
      this.setChildIds({ childIds: [] })
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
  goBackTab() {
    this.goToOffsetTab({ offset: -1 })
  }
  @Action
  goForwardTab() {
    this.goToOffsetTab({ offset: 1 })
  }
  @Action
  sortTabs({ ids }: { ids: string[] }) {
    const sortedTabs = <Tab[]>(
      ids.map((id) => this.getTab({ id })).filter((tab) => !!tab)
    )
    const tabs = [
      ...this.tabs.filter((tab) => !ids.includes(tab.id)),
      ...sortedTabs
    ]
    this.setTabs({ tabs })
  }
  @Action
  closeApp({ host }: { host: string }) {
    const app = this.apps.find((app) => app.host === host)!
    const tabIds = app.tabs.map((tab) => tab.id)
    const active = tabIds.includes(this.activeId)
    if (active) {
      this.setParentId({ parentId: '' })
      this.setChildIds({ childIds: [] })

      const index = this.apps.findIndex((app) => app.host === host)
      if (index < this.apps.length - 1) {
        const id = this.apps[index + 1].tabs[0].id
        this.activateTab({ id })
      } else if (index > 0) {
        const tabIndex = this.apps[index - 1].tabs.length - 1
        const id = this.apps[index - 1].tabs[tabIndex].id
        this.activateTab({ id })
      } else {
        this.activateTab({ id: '' })
      }
    }

    const tabs = this.tabs.filter((tab) => !tabIds.includes(tab.id))
    this.setTabs({ tabs })

    const previousTabs = this.history
      .slice(0, this.historyIndex)
      .filter((id) => tabIds.includes(id)).length
    const history = this.history.slice().filter((id) => !tabIds.includes(id))
    this.setHistory({ history })
    this.setHistoryIndex({
      historyIndex: this.historyIndex - previousTabs
    })

    if (!tabs.length) {
      remote.getCurrentWindow().close()
    }
  }
  @Action
  sortApps({ hosts }: { hosts: string[] }) {
    this.setHosts({ hosts })
  }
}
