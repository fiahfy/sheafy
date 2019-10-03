import { remote } from 'electron'

const getHost = (url) => {
  return url.replace(/^https?:\/\/([^/]+).*$/, '$1')
}

const getBadge = (title) => {
  const match = title.match(/\(([\d,]+)\)\s*/)
  if (!match) {
    return 0
  }
  return Number(match[1].replace(',', ''))
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
  hosts: []
})

export const getters = {
  activeTab(state) {
    return state.tabs.find((tab) => tab.id === state.activeTabId)
  },
  isActiveTab(state) {
    return (tab) => tab.id === state.activeTabId
  },
  isPinnedTab(state) {
    return (tab) => state.hosts.includes(tab.host)
  },
  groups(state) {
    return [null, ...state.hosts.slice().reverse()]
      .map((host, i) => {
        const tabs = state.tabs.filter((tab) =>
          i === 0 ? !state.hosts.includes(tab.host) : tab.host === host
        )
        if (tabs.length) {
          return {
            host,
            tabs
          }
        }
        return null
      })
      .filter((group) => !!group)
      .reverse()
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
      replaced: false,
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
      const group = getters.groups.find(
        (group) => !!group.tabs.find((tab) => tab.id === id)
      )
      if (group.tabs.length <= 1) {
        dispatch('closeGroup', { host: group.host })
        return
      }
      const index = group.tabs.findIndex((tab) => tab.id === id)
      if (index < group.tabs.length - 1) {
        const activeTabId = group.tabs[index + 1].id
        commit('setActiveTabId', { activeTabId })
      } else if (index > 0) {
        const activeTabId = group.tabs[index - 1].id
        commit('setActiveTabId', { activeTabId })
      } else {
        commit('setActiveTabId', { activeTabId: null })
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
    ].map((tab) => ({
      ...tab,
      replaced: tab.id !== state.activeTabId
    }))
    commit('setTabs', { tabs })
  },
  pinHost({ commit, state }, { host }) {
    const hosts = [...state.hosts, host]
    commit('setHosts', { hosts })
  },
  unpinHost({ commit, state }, { host }) {
    const hosts = state.hosts.filter((value) => value !== host)
    commit('setHosts', { hosts })
  },
  closeGroup({ commit, getters, state }, { host }) {
    const group = getters.groups.find((group) => group.host === host)
    const tabIds = group.tabs.map((tab) => tab.id)
    const active = tabIds.includes(state.activeTabId)
    if (active) {
      const index = getters.groups.findIndex((group) => group.host === host)
      if (index < getters.groups.length - 1) {
        const activeTabId = getters.groups[index + 1].tabs[0].id
        commit('setActiveTabId', { activeTabId })
      } else if (index > 0) {
        const activeTabId =
          getters.groups[index - 1].tabs[
            getters.groups[index - 1].tabs.length - 1
          ].id
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
  sortGroups({ commit }, { hosts }) {
    commit('setHosts', { hosts: hosts.filter((host) => !!host) })
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
  }
}
