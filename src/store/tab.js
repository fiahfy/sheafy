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
        favicon: '',
        loading: false,
        canGoBack: false,
        canGoForward: false
      }
    ]
  },
  updateTab(state, { id, ...params }) {
    state.tabs = state.tabs.map((tab) => {
      if (tab.id !== id) {
        return tab
      }
      return {
        ...tab,
        ...params
      }
    })
  },
  activateTab(state, { id }) {
    state.activeTabId = id
  },
  closeTab(state, { id }) {
    if (id === state.activeTabId) {
      let index = state.tabs.findIndex((tab) => tab.id === id)
      index = index < state.tabs.length - 1 ? index + 1 : index - 1
      state.activeTabId =
        index >= 0 && index < state.tabs.length ? state.tabs[index].id : 0
    }
    state.tabs = state.tabs.filter((tab) => tab.id !== id)
  }
}
