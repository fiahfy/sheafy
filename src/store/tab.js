import { remote } from 'electron'
import nanoid from 'nanoid'

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
  tabs: [],
  hosts: [],
  activeId: null,
  parentId: null,
  childIds: []
})

export const getters = {
  activeTab(state) {
    return state.tabs.find((tab) => tab.id === state.activeId)
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
    return ({ id }) => id === state.activeId
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
    const { activate = true, position = 'last', srcId = state.activeId } =
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
      searching: false,
      searchText: '',
      searchActiveMatchOrdinal: null,
      searchMatches: null,
      loaded: false,
      ...params
    })

    let index
    switch (position) {
      case 'next': {
        const srcIndex = state.tabs.findIndex((tab) => tab.id === srcId)
        // new tab at last when host is different from host in src tab
        if (srcIndex === -1 || tab.host !== state.tabs[srcIndex].host) {
          index = state.tabs.length
        } else {
          index = srcIndex + 1
        }
        break
      }
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

    const parentId = state.activeId
    let childIds = [tab.id]
    if (parentId === state.parentId) {
      childIds = [...state.childIds.slice(), ...childIds]
    }
    commit('setParentId', { parentId })
    commit('setChildIds', { childIds })

    if (activate) {
      commit('setActiveId', { activeId: id })
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
      options: { srcId: tab.id, position: 'next' }
    })
  },
  updateTab({ commit, state }, { id, ...params }) {
    let hostChanged = false
    let tabs = state.tabs.map((tab) => {
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
    commit('setTabs', { tabs })
  },
  closeTab({ commit, dispatch, getters, state }, { id }) {
    if (id === state.activeId) {
      if (state.childIds.includes(id)) {
        const childIds = state.childIds.filter((childId) => childId !== id)
        commit('setChildIds', { childIds })
        commit('setActiveId', { activeId: state.parentId })
      } else {
        if (id === state.parentId) {
          commit('setParentId', { parentId: null })
          commit('setChildIds', { childIds: [] })
        }

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
            const activeId = app.tabs[index + 1].id
            commit('setActiveId', { activeId })
          } else if (index > 0) {
            const activeId = app.tabs[index - 1].id
            commit('setActiveId', { activeId })
          } else {
            commit('setActiveId', { activeId: null })
          }
        }
      }
    }

    const tabs = state.tabs.filter((tab) => tab.id !== id)
    commit('setTabs', { tabs })
    if (!tabs.length) {
      remote.getCurrentWindow().close()
    }
  },
  activateTab({ commit, state }, { id }) {
    if (state.parentId !== id && !state.childIds.includes(id)) {
      commit('setParentId', { parentId: null })
      commit('setChildIds', { childIds: [] })
    }
    commit('setActiveId', { activeId: id })
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
    const active = tabIds.includes(state.activeId)
    if (active) {
      commit('setParentId', { parentId: null })
      commit('setChildIds', { childIds: [] })

      const index = getters.apps.findIndex((app) => app.host === host)
      if (index < getters.apps.length - 1) {
        const activeId = getters.apps[index + 1].tabs[0].id
        commit('setActiveId', { activeId })
      } else if (index > 0) {
        const activeId =
          getters.apps[index - 1].tabs[getters.apps[index - 1].tabs.length - 1]
            .id
        commit('setActiveId', { activeId })
      } else {
        commit('setActiveId', { activeId: null })
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
  }
}

export const mutations = {
  setTabs(state, { tabs }) {
    state.tabs = tabs
  },
  setHosts(state, { hosts }) {
    state.hosts = hosts
  },
  setActiveId(state, { activeId }) {
    state.activeId = activeId
  },
  setParentId(state, { parentId }) {
    state.parentId = parentId
  },
  setChildIds(state, { childIds }) {
    state.childIds = childIds
  }
}
