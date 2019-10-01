import createPersistedState from 'vuex-persistedstate'
import Package from '~~/package.json'

export const state = () => ({
  title: Package.productName,
  fullScreen: false
})

export const getters = {
  title(state, getters) {
    const tab = getters['tab/activeTab']
    return tab ? tab.title : ''
  },
  titleBar(state) {
    return process.platform === 'darwin' && !state.fullScreen
  }
}

export const actions = {}

export const mutations = {
  setTitle(state, { title }) {
    state.title = title
  },
  setFullScreen(state, { fullScreen }) {
    state.fullScreen = fullScreen
  }
}

export const plugins = [
  createPersistedState({
    paths: ['settings', 'tab']
  })
]
