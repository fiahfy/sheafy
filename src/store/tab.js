import { remote } from 'electron'

export const state = () => ({
  activeTabId: 0,
  tabs: []
})

export const getters = {
  activeTab(state) {
    return state.tabs.find((tab) => tab.id === state.activeTabId)
  },
  isActiveTab(state) {
    return (tab) => tab.id === state.activeTabId
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
  newTab({ commit, state }, { options, ...params }) {
    const { activate = true, position = 'last', baseId = state.activeTabId } =
      options || {}
    // TODO: generate random unique id
    const id = Math.max.apply(null, [0, ...state.tabs.map((tab) => tab.id)]) + 1
    const url = 'https://www.google.com'
    const tab = {
      id,
      url,
      title: '',
      favicon: '',
      loading: false,
      canGoBack: false,
      canGoForward: false,
      query: '',
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
      return {
        ...tab,
        ...params
      }
    })
    commit('setTabs', { tabs })
  },
  closeTab({ commit, state }, { id }) {
    if (id === state.activeTabId) {
      let index = state.tabs.findIndex((tab) => tab.id === id)
      index = index < state.tabs.length - 1 ? index + 1 : index - 1
      const activeTabId =
        index >= 0 && index < state.tabs.length ? state.tabs[index].id : 0
      commit('setActiveTabId', { activeTabId })
    }
    const tabs = state.tabs.filter((tab) => tab.id !== id)
    commit('setTabs', { tabs })
    if (!tabs.length) {
      remote.getCurrentWindow().close()
    }
  },
  activateTab({ commit }, { id }) {
    commit('setActiveTabId', { activeTabId: id })
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
