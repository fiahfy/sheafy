export const state = () => ({
  darkTheme: false,
  fullScreen: false,
  tabBarWidth: 256
})

export const mutations = {
  setDarkTheme(state, { darkTheme }) {
    state.darkTheme = darkTheme
  },
  setFullScreen(state, { fullScreen }) {
    state.fullScreen = fullScreen
  },
  setTabBarWidth(state, { tabBarWidth }) {
    state.tabBarWidth = tabBarWidth
  }
}
