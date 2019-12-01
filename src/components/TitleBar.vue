<template>
  <v-system-bar
    v-if="titleBar"
    class="title-bar caption px-0 align-start user-select-none"
    app
    height="22"
  >
    <v-sheet tile class="fill-height flex-grow-1" @dblclick="onDoubleClick">
      <div class="text-truncate text-center" v-text="title" />
    </v-sheet>
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
    return tab ? tab.title : ''
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
  z-index: 9999;
  .v-sheet {
    position: relative;
    padding: 0 72px;
    min-width: 0;
    -webkit-app-region: drag;
    > div {
      margin-top: 2px;
    }
  }
}
</style>
