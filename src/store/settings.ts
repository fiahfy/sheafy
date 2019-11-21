import { Module, VuexModule, Mutation } from 'vuex-module-decorators'

@Module({
  name: 'settings',
  stateFactory: true,
  namespaced: true
})
export default class SettingsModule extends VuexModule {
  darkTheme = false
  swipeToNavigate = false
  sideBarLocation = 'left'
  sideBarWidth = 256
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
  setSideBarLocation({ sideBarLocation }: { sideBarLocation: string }) {
    this.sideBarLocation = sideBarLocation
  }
  @Mutation
  setSideBarWidth({ sideBarWidth }: { sideBarWidth: number }) {
    this.sideBarWidth = sideBarWidth
  }
  @Mutation
  setTopContentHeight({ topContentHeight }: { topContentHeight: number }) {
    this.topContentHeight = topContentHeight
  }
}
