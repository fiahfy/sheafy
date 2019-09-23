import { remote } from 'electron'

const getHost = (url) => {
  return url.replace(/^https?:\/\/([^/]+).*$/, '$1')
}

export const state = () => ({
  activeTabId: null,
  tabs: []
})

export const getters = {
  activeTab(state) {
    return state.tabs.find((tab) => tab.id === state.activeTabId)
  },
  isActiveTab(state) {
    return (tab) => tab.id === state.activeTabId
  },
  groups(state) {
    return state.tabs
      .reduce((carry, tab) => {
        const exists = !!carry.find((group) => group.host === tab.host)
        if (exists) {
          return carry.map((group) => {
            if (group.host !== tab.host) {
              return group
            }
            return {
              ...group,
              tabs: [...group.tabs, tab]
            }
          })
        }
        return [
          ...carry,
          {
            host: tab.host,
            tabs: [tab]
          }
        ]
      }, [])
      .reduce(
        ([groups, ungrouped], group) => {
          if (group.tabs.length > 1) {
            return [[...groups, group], ungrouped]
          }
          return [
            groups,
            {
              ...ungrouped,
              tabs: [...ungrouped.tabs, group.tabs[0]]
            }
          ]
        },
        [[], { host: null, tabs: [] }]
      )
      .reduce((carry, value, index) => {
        if (index === 0) {
          return value
        }
        if (value.tabs.length) {
          return [value, ...carry]
        }
        return carry
      })
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
  newTabIfEmpty({ dispatch, state }) {
    if (!state.tabs.length) {
      dispatch('newTab')
    }
  },
  newTab({ commit, state }, { options, ...params } = {}) {
    const { activate = true, position = 'last', baseId = state.activeTabId } =
      options || {}
    // TODO: generate random unique id
    const id = Math.max.apply(null, [0, ...state.tabs.map((tab) => tab.id)]) + 1
    const url = 'https://www.google.com/?shelf-browser'
    const tab = {
      id,
      url,
      host: getHost(url),
      title: '',
      favicon: '',
      loading: false,
      canGoBack: false,
      canGoForward: false,
      query: '',
      searching: false,
      searchText: '',
      searchActiveMatchOrdinal: null,
      searchMatches: null,
      ...params
    }

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
  updateTab({ commit, state }, { id, ...params }) {
    const tabs = state.tabs.map((tab) => {
      if (tab.id !== id) {
        return tab
      }
      const newTab = { ...tab, ...params }
      return {
        ...newTab,
        host: getHost(newTab.url)
      }
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
  }
}

export const mutations = {
  setActiveTabId(state, { activeTabId }) {
    state.activeTabId = activeTabId
  },
  setTabs(state, { tabs }) {
    state.tabs = tabs
  }
}
