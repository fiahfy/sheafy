import Vue from 'vue'
import { MenuItemConstructorOptions } from 'electron'
const show = require('@fiahfy/electron-context-menu').default

declare module 'vue/types/vue' {
  interface Vue {
    $contextMenu: {
      show(template?: MenuItemConstructorOptions[]): void
    }
  }
}

Vue.prototype.$contextMenu = { show }
