export const state = () => ({
  activeTabId: 0,
  tabs: []
})

export const getters = {
  isActiveTab(state) {
    return (tab) => tab.id === state.activeTabId
  },
  activeTab(state) {
    return state.tabs.find((tab) => tab.id === state.activeTabId)
  }
}

export const actions = {
  toggleBookmarked({ commit, getters }, { filepath }) {
    if (getters.isBookmarked({ filepath })) {
      commit('removeBookmark', { filepath })
    } else {
      commit('addBookmark', { filepath })
    }
  }
}

export const mutations = {
  newTab(state) {
    const id = Math.max.apply(null, [0, ...state.tabs.map((tab) => tab.id)]) + 1

    state.activeTabId = id
    state.tabs = [
      ...state.tabs,
      {
        id,
        url: 'https://www.google.com',
        title: '',
        favicon: ''
      }
    ]
  },
  updateTabTitle(state, { id, title }) {
    state.tabs = state.tabs.map((tab) => {
      if (tab.id !== id) {
        return tab
      }
      return {
        ...tab,
        title
      }
    })
  },
  updateTabFavicon(state, { id, favicon }) {
    state.tabs = state.tabs.map((tab) => {
      if (tab.id !== id) {
        return tab
      }
      return {
        ...tab,
        favicon
      }
    })
  },
  activateTab(state, { id }) {
    state.activeTabId = id
  }
}
