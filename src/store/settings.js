export const state = () => ({
  darkTheme: false,
  fullScreen: false,
  sideBarWidth: 256
})

export const mutations = {
  setDarkTheme(state, { darkTheme }) {
    state.darkTheme = darkTheme
  },
  setFullScreen(state, { fullScreen }) {
    state.fullScreen = fullScreen
  },
  setSideBarWidth(state, { sideBarWidth }) {
    state.sideBarWidth = sideBarWidth
  }
}
