import { Module, VuexModule, Mutation } from 'vuex-module-decorators'

@Module({
  name: 'settings',
  stateFactory: true,
  namespaced: true
})
export default class SettingsModule extends VuexModule {
  darkTheme = false
  swipeToNavigate = false
  sidebarLocation = 'left'
  sidebarWidth = 256
  secondaryTabWidthRatio = 0.5
  topContentHeight = 256

  @Mutation
  setDarkTheme({ darkTheme }: { darkTheme: boolean }) {
    this.darkTheme = darkTheme
  }
  @Mutation
  setSwipeToNavigate({ swipeToNavigate }: { swipeToNavigate: boolean }) {
    this.swipeToNavigate = swipeToNavigate
  }
  @Mutation
  setSidebarLocation({ sidebarLocation }: { sidebarLocation: string }) {
    this.sidebarLocation = sidebarLocation
  }
  @Mutation
  setSidebarWidth({ sidebarWidth }: { sidebarWidth: number }) {
    this.sidebarWidth = sidebarWidth
  }
  @Mutation
  setSecondaryTabWidthRatio({
    secondaryTabWidthRatio
  }: {
    secondaryTabWidthRatio: number
  }) {
    this.secondaryTabWidthRatio = secondaryTabWidthRatio
  }
  @Mutation
  setTopContentHeight({ topContentHeight }: { topContentHeight: number }) {
    this.topContentHeight = topContentHeight
  }
}
