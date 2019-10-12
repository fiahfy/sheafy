export const state = () => ({
  darkTheme: false,
  sideBarLocation: 'left',
  sideBarWidth: 256
})

export const mutations = {
  setDarkTheme(state, { darkTheme }) {
    state.darkTheme = darkTheme
  },
  setSideBarLocation(state, { sideBarLocation }) {
    state.sideBarLocation = sideBarLocation
  },
  setSideBarWidth(state, { sideBarWidth }) {
    state.sideBarWidth = sideBarWidth
  }
}
