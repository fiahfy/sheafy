<template>
  <v-system-bar
    v-if="titleBar"
    class="title-bar user-select-none"
    app
    height="22"
    @dblclick="onDoubleClick"
  >
    <v-spacer />
    <span class="caption text-truncate" v-text="title" />
    <v-spacer />
  </v-system-bar>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { remote } from 'electron'
import { layoutStore, tabStore } from '~/store'

@Component
export default class TitleBar extends Vue {
  get titleBar() {
    return process.platform === 'darwin' && !layoutStore.fullScreen
  }

  get title() {
    const viewId = tabStore.activeViewId
    const tab = tabStore.getActiveTab({ viewId })
    return tab ? `${tab.title} — ${tab.host}` : ''
  }

  // @see https://github.com/electron/electron/issues/16385
  onDoubleClick() {
    const doubleClickAction = remote.systemPreferences.getUserDefault(
      'AppleActionOnDoubleClick',
      'string'
    )
    const win = remote.getCurrentWindow()
    if (doubleClickAction === 'Minimize') {
      win.minimize()
    } else if (doubleClickAction === 'Maximize') {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.title-bar {
  padding: 0 72px;
  -webkit-app-region: drag;
}
</style>
