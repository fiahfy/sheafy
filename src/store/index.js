import createPersistedState from 'vuex-persistedstate'

export const state = () => ({
  fullScreen: false,
  panelId: null
})

export const getters = {
  titleBar(state) {
    return process.platform === 'darwin' && !state.fullScreen
  }
}

export const actions = {}

export const mutations = {
  setFullScreen(state, { fullScreen }) {
    state.fullScreen = fullScreen
  },
  setPanelId(state, { panelId }) {
    state.panelId = panelId
  }
}

export const plugins = [createPersistedState()]
