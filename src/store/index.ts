// import createPersistedState from 'vuex-persistedstate'

// export const state = () => ({
//   fullScreen: false,
//   panelId: 'apps',
//   shortcutBar: false
// })

// export const getters = {}

// export const actions = {
//   showShortcutBar({ commit }) {
//     commit('setShortcutBar', { shortcutBar: true })
//   },
//   hideShortcutBar({ commit }) {
//     commit('setShortcutBar', { shortcutBar: false })
//   }
// }

// export const mutations = {
//   setFullScreen(state, { fullScreen }) {
//     state.fullScreen = fullScreen
//   },
//   setPanelId(state, { panelId }) {
//     state.panelId = panelId
//   },
//   setShortcutBar(state, { shortcutBar }) {
//     state.shortcutBar = shortcutBar
//   }
// }

// export const plugins = [createPersistedState()]

import { Store } from 'vuex'
import { initializeStores } from '~/utils/store-accessor'
const initializer = (store: Store<any>) => initializeStores(store)
export const plugins = [initializer]
export * from '~/utils/store-accessor'
