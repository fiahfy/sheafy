import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

@Module({
  name: 'root',
  stateFactory: true,
  namespaced: true
})
export default class SettingsModule extends VuexModule {
  fullScreen = false
  panelId = 'apps'
  shortcutBar = false

  @Mutation
  setFullScreen({ fullScreen }: { fullScreen: boolean }) {
    this.fullScreen = fullScreen
  }
  @Mutation
  setPanelId({ panelId }: { panelId: string }) {
    this.panelId = panelId
  }
  @Mutation
  setShortcutBar({ shortcutBar }: { shortcutBar: boolean }) {
    this.shortcutBar = shortcutBar
  }

  @Action
  showShortcutBar() {
    this.setShortcutBar({ shortcutBar: true })
  }
  @Action
  hideShortcutBar() {
    this.setShortcutBar({ shortcutBar: false })
  }
}
