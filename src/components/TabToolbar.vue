<template>
  <v-toolbar
    class="tab-toolbar"
    flat
    dense
    height="36"
    extended
    extension-height="36"
  >
    <favicon
      class="mr-3"
      :url="activeTab.favicon"
      :loading="activeTab.loading"
    />
    <div
      class="caption text-truncate user-select-none"
      @contextmenu.stop="onContextMenu"
      v-text="activeTab.title"
    />
    <v-btn icon small class="ml-3" title="Close" @click="onClickClose">
      <v-icon small>mdi-close</v-icon>
    </v-btn>
    <v-spacer />
    <v-btn
      v-long-press="onContextMenuBackTab"
      icon
      width="32"
      height="32"
      class="ml-1"
      title="Go Back Tab"
      :disabled="!canGoBackTab"
      @click="onClickGoBackTab"
      @contextmenu.stop="onContextMenuBackTab"
    >
      <v-icon size="20">mdi-chevron-left</v-icon>
    </v-btn>
    <v-btn
      v-long-press="onContextMenuForwardTab"
      icon
      width="32"
      height="32"
      class="ml-1"
      title="Go Forward Tab"
      :disabled="!canGoForwardTab"
      @click="onClickGoForwardTab"
      @contextmenu.stop="onContextMenuForwardTab"
    >
      <v-icon size="20">mdi-chevron-right</v-icon>
    </v-btn>
    <template slot="extension">
      <v-btn
        v-long-press="onContextMenuBack"
        icon
        width="32"
        height="32"
        class="mr-1"
        title="Go Back"
        :disabled="!activeTab || !activeTab.canGoBack"
        @click="onClickGoBack"
        @contextmenu.stop="onContextMenuBack"
      >
        <v-icon size="20">mdi-arrow-left</v-icon>
      </v-btn>
      <v-btn
        v-long-press="onContextMenuForward"
        icon
        width="32"
        height="32"
        class="mr-1"
        title="Go Forward"
        :disabled="!activeTab || !activeTab.canGoForward"
        @click="onClickGoForward"
        @contextmenu.stop="onContextMenuForward"
      >
        <v-icon size="20">mdi-arrow-right</v-icon>
      </v-btn>
      <v-btn
        v-if="activeTab && activeTab.loading"
        icon
        width="32"
        height="32"
        class="mr-1"
        title="Stop"
        @click="onClickStop"
      >
        <v-icon size="20">mdi-close</v-icon>
      </v-btn>
      <v-btn
        v-else
        icon
        width="32"
        height="32"
        class="mr-1"
        title="Reload"
        @click="onClickReload"
      >
        <v-icon size="20">mdi-refresh</v-icon>
      </v-btn>
      <tab-toolbar-text-field class="ml-1" />
    </template>
  </v-toolbar>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { shell } from 'electron'
import { tabStore } from '~/store'
import Favicon from '~/components/Favicon.vue'
import TabToolbarTextField from '~/components/TabToolbarTextField.vue'

@Component({
  components: {
    Favicon,
    TabToolbarTextField
  }
})
export default class Toolbar extends Vue {
  get activeTab() {
    return tabStore.activeTab
  }
  get canGoBackTab() {
    return tabStore.canGoBackTab
  }
  get canGoForwardTab() {
    return tabStore.canGoForwardTab
  }

  mounted() {
    this.$eventBus.$on('showBackHistory', this.showBackHistory)
    this.$eventBus.$on('showForwardHistory', this.showForwardHistory)
  }

  destroyed() {
    this.$eventBus.$off('showBackHistory', this.showBackHistory)
    this.$eventBus.$off('showForwardHistory', this.showForwardHistory)
  }

  showBackHistory(history: string[]) {
    this.$contextMenu.show(
      history.map((title, index) => {
        return {
          label: title,
          click: () => this.$eventBus.$emit('goToOffset', -index - 1)
        }
      })
    )
  }
  showForwardHistory(history: string[]) {
    this.$contextMenu.show(
      history.map((history, index) => {
        return {
          label: history,
          click: () => this.$eventBus.$emit('goToOffset', index + 1)
        }
      })
    )
  }
  onClickGoBack() {
    this.$eventBus.$emit('goBack')
  }
  onClickGoForward() {
    this.$eventBus.$emit('goForward')
  }
  onClickReload() {
    this.$eventBus.$emit('reload')
  }
  onClickStop() {
    this.$eventBus.$emit('stop')
  }
  onClickClose() {
    const tab = tabStore.activeTab
    if (tab) {
      tabStore.closeTab({ id: tab.id })
    }
  }
  onClickGoBackTab() {
    tabStore.goBackTab()
  }
  onClickGoForwardTab() {
    tabStore.goForwardTab()
  }
  onContextMenu() {
    const tab = tabStore.activeTab
    if (!tab) {
      return
    }
    this.$contextMenu.show([
      {
        label: 'New Tab',
        click: () =>
          tabStore.newTab({ options: { srcId: tab.id, position: 'next' } })
      },
      { type: 'separator' },
      {
        label: 'Duplicate Tab',
        click: () => tabStore.duplicateTab({ id: tab.id })
      },
      {
        label: 'Open Current Page in a Default Browser',
        click: () => shell.openExternal(tab.url)
      },
      { type: 'separator' },
      {
        label: 'Close Tab',
        click: () => tabStore.closeTab({ id: tab.id })
      }
    ])
  }
  onContextMenuBack() {
    this.$eventBus.$emit('requestBackHistory')
  }
  onContextMenuForward() {
    this.$eventBus.$emit('requestForwardHistory')
  }
  onContextMenuBackTab() {
    this.$contextMenu.show(
      tabStore.backTabHistory.map((history, index) => {
        return {
          label: history && history.title,
          click: () => tabStore.goToOffsetTab({ offset: -index - 1 })
        }
      })
    )
  }
  onContextMenuForwardTab() {
    this.$contextMenu.show(
      tabStore.forwardTabHistory.map((history, index) => {
        return {
          label: history && history.title,
          click: () => tabStore.goToOffsetTab({ offset: index + 1 })
        }
      })
    )
  }
}
</script>
