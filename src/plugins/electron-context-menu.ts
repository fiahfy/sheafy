import Vue from 'vue'
import { open } from '@fiahfy/electron-context-menu'

declare module 'vue/types/vue' {
  interface Vue {
    $contextMenu: {
      open: typeof open
      openEditMenu: () => void
    }
  }
}

Vue.prototype.$contextMenu = {
  open,
  openEditMenu: () => {
    open([{ role: 'cut' }, { role: 'copy' }, { role: 'paste' }])
  }
}
