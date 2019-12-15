import { NuxtAppOptions, Plugin } from '@nuxt/types'
import Vue from 'vue'
import { remote, MenuItemConstructorOptions } from 'electron'
import { open } from '@fiahfy/electron-context-menu'

const createInspectElementMenuItem = () => {
  const e = window.event
  if (!(e instanceof MouseEvent)) {
    return undefined
  }

  const { clientX: x, clientY: y } = e

  return {
    label: 'Inspect Element',
    click: (): void =>
      remote.getCurrentWindow().webContents.inspectElement(x, y)
  }
}

const contextMenuCreator = (app: NuxtAppOptions) => {
  return {
    open: (template: MenuItemConstructorOptions[] = [], options: any = {}) => {
      app.$eventBus.$emit('closeContextMenu')
      if (!options.vuetify) {
        open(template, options)
        return
      }
      if (process.env.NODE_ENV !== 'production') {
        const menuItem = createInspectElementMenuItem()
        if (menuItem) {
          if (template.length) {
            template = [...template, { type: 'separator' }]
          }
          template = [...template, menuItem]
        }
      }
      app.$eventBus.$emit('openContextMenu', { template, options })
    },
    openEditMenu: () => {
      app.$eventBus.$emit('closeContextMenu')
      open([{ role: 'cut' }, { role: 'copy' }, { role: 'paste' }])
    }
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $contextMenu: ReturnType<typeof contextMenuCreator>
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $contextMenu: ReturnType<typeof contextMenuCreator>
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $contextMenu: ReturnType<typeof contextMenuCreator>
  }
}

const contextMenuPlugin: Plugin = ({ app }, inject) => {
  inject('contextMenu', contextMenuCreator(app))
}

export default contextMenuPlugin
