import { remote } from 'electron'

const getHost = (url) => {
  return url.replace(/^https?:\/\/([^/]+).*$/, '$1')
}

const getBadge = (title) => {
  const match = title.match(/\(([\d,]+)\)\s*/)
  return match ? Number(match[1].replace(',', '')) : 0
}

const convertTab = (tab) => {
  return {
    ...tab,
    host: getHost(tab.url),
    badge: getBadge(tab.title)
  }
}

export const state = () => ({
  activeTabId: null,
  tabs: [],
  hosts: [],
  shortcutBar: false
})

export const getters = {
  activeTab(state) {
    return state.tabs.find((tab) => tab.id === state.activeTabId)
  },
  apps(state) {
    return Object.values(
      state.tabs.slice().reduce((carry, tab) => {
        if (carry[tab.host]) {
          return {
            ...carry,
            [tab.host]: {
              ...carry[tab.host],
              tabs: [...carry[tab.host].tabs, tab]
            }
          }
        }
        return {
          ...carry,
          [tab.host]: {
            host: tab.host,
            favicon: tab.favicon,
            tabs: [tab]
          }
        }
      }, {})
    ).sort((a, b) => {
      const aIndex =
        state.hosts.indexOf(a.host) > -1
          ? state.hosts.indexOf(a.host)
          : Infinity
      const bIndex =
        state.hosts.indexOf(b.host) > -1
          ? state.hosts.indexOf(b.host)
          : Infinity
      return aIndex > bIndex ? 1 : -1
    })
  },
  isActiveTab(state) {
    return ({ id }) => id === state.activeTabId
  },
  getUrlWithQuery() {
    return (query) => {
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
}

export const actions = {
  newTab({ commit, state }, { options, ...params } = {}) {
    const { activate = true, position = 'last', baseId = state.activeTabId } =
      options || {}
    // TODO: generate random unique id
    const id = Math.max.apply(null, [0, ...state.tabs.map((tab) => tab.id)]) + 1
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
      searching: false,
      searchText: '',
      searchActiveMatchOrdinal: null,
      searchMatches: null,
      loaded: false,
      ...params
    })

    const baseIndex =
      state.tabs.findIndex((tab) => tab.id === baseId) || state.tabs.length - 1

    let index
    switch (position) {
      case 'next':
        index = baseIndex + 1
        break
      case 'last':
      default:
        index = state.tabs.length
        break
    }

    const tabs = [
      ...state.tabs.slice(0, index),
      tab,
      ...state.tabs.slice(index)
    ]
    commit('setTabs', { tabs })
    if (activate) {
      commit('setActiveTabId', { activeTabId: id })
    }
  },
  newTabIfEmpty({ dispatch, state }) {
    if (!state.tabs.length) {
      dispatch('newTab')
    }
  },
  duplicateTab({ dispatch, state }, { id }) {
    const tab = state.tabs.find((tab) => tab.id === id)
    if (!tab) {
      return
    }
    dispatch('newTab', {
      url: tab.url,
      options: { baseId: tab.id, position: 'next' }
    })
  },
  updateTab({ commit, state }, { id, ...params }) {
    const tabs = state.tabs.map((tab) => {
      if (tab.id !== id) {
        return tab
      }
      return convertTab({ ...tab, ...params })
    })
    commit('setTabs', { tabs })
  },
  closeTab({ commit, dispatch, getters, state }, { id }) {
    if (id === state.activeTabId) {
      const app = getters.apps.find(
        (app) => !!app.tabs.find((tab) => tab.id === id)
      )
      if (app) {
        if (app.tabs.length <= 1) {
          dispatch('closeApp', { host: app.host })
          return
        }
        const index = app.tabs.findIndex((tab) => tab.id === id)
        if (index < app.tabs.length - 1) {
          const activeTabId = app.tabs[index + 1].id
          commit('setActiveTabId', { activeTabId })
        } else if (index > 0) {
          const activeTabId = app.tabs[index - 1].id
          commit('setActiveTabId', { activeTabId })
        } else {
          commit('setActiveTabId', { activeTabId: null })
        }
      }
    }

    const tabs = state.tabs.filter((tab) => tab.id !== id)
    commit('setTabs', { tabs })
    if (!tabs.length) {
      remote.getCurrentWindow().close()
    }
  },
  activateTab({ commit }, { id }) {
    commit('setActiveTabId', { activeTabId: id })
  },
  sortTabs({ commit, state }, { ids }) {
    const sortedTabs = ids.map((id) => state.tabs.find((tab) => tab.id === id))
    const tabs = [
      ...state.tabs.filter((tab) => !ids.includes(tab.id)),
      ...sortedTabs
    ]
    commit('setTabs', { tabs })
  },
  closeApp({ commit, getters, state }, { host }) {
    const app = getters.apps.find((app) => app.host === host)
    const tabIds = app.tabs.map((tab) => tab.id)
    const active = tabIds.includes(state.activeTabId)
    if (active) {
      const index = getters.apps.findIndex((app) => app.host === host)
      if (index < getters.apps.length - 1) {
        const activeTabId = getters.apps[index + 1].tabs[0].id
        commit('setActiveTabId', { activeTabId })
      } else if (index > 0) {
        const activeTabId =
          getters.apps[index - 1].tabs[getters.apps[index - 1].tabs.length - 1]
            .id
        commit('setActiveTabId', { activeTabId })
      } else {
        commit('setActiveTabId', { activeTabId: null })
      }
    }

    const tabs = state.tabs.filter((tab) => !tabIds.includes(tab.id))
    commit('setTabs', { tabs })
    if (!tabs.length) {
      remote.getCurrentWindow().close()
    }
  },
  sortApps({ commit }, { hosts }) {
    commit('setHosts', { hosts })
  },
  showShortcutBar({ commit }) {
    commit('setShortcutBar', { shortcutBar: true })
  },
  hideShortcutBar({ commit }) {
    commit('setShortcutBar', { shortcutBar: false })
  }
}

export const mutations = {
  setActiveTabId(state, { activeTabId }) {
    state.activeTabId = activeTabId
  },
  setTabs(state, { tabs }) {
    state.tabs = tabs
  },
  setHosts(state, { hosts }) {
    state.hosts = hosts
  },
  setShortcutBar(state, { shortcutBar }) {
    state.shortcutBar = shortcutBar
  }
}
