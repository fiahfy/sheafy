import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'

@Module({
  name: 'layout',
  stateFactory: true,
  namespaced: true
})
export default class LayoutModule extends VuexModule {
  fullScreen = false
  resizing = false
  panelId = 'apps'
  shortcutBar = false

  @Mutation
  setFullScreen({ fullScreen }: { fullScreen: boolean }) {
    this.fullScreen = fullScreen
  }
  @Mutation
  setResizing({ resizing }: { resizing: boolean }) {
    this.resizing = resizing
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
