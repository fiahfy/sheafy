<template>
  <v-system-bar v-if="titleBar" class="title-bar caption px-0" app height="16">
    <v-sheet tile class="flex-grow-1" @dblclick="onDoubleClick">
      <div>{{ title }}</div>
    </v-sheet>
  </v-system-bar>
</template>

<script>
import { remote } from 'electron'
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['title', 'titleBar'])
  },
  methods: {
    // TODO: https://github.com/electron/electron/issues/16385
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
}
</script>

<style lang="scss" scoped>
.title-bar {
  user-select: none;
  z-index: 9999;
  align-items: start;
  .v-sheet {
    position: relative;
    height: 20px;
    padding: 0 72px;
    min-width: 0;
    -webkit-app-region: drag;
    > div {
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
    }
  }
}
</style>
