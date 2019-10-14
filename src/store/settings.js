export const state = () => ({
  darkTheme: false,
  swipeToNavigate: false,
  sideBarLocation: 'left',
  sideBarWidth: 256
})

export const mutations = {
  setDarkTheme(state, { darkTheme }) {
    state.darkTheme = darkTheme
  },
  setSwipeToNavigate(state, { swipeToNavigate }) {
    state.swipeToNavigate = swipeToNavigate
  },
  setSideBarLocation(state, { sideBarLocation }) {
    state.sideBarLocation = sideBarLocation
  },
  setSideBarWidth(state, { sideBarWidth }) {
    state.sideBarWidth = sideBarWidth
  }
}
