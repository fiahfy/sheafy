<template>
  <v-toolbar
    class="toolbar"
    :class="classes"
    flat
    dense
    height="36"
    extended
    extension-height="36"
  >
    <favicon
      class="mr-3"
      :url="activeTab && activeTab.favicon"
      :loading="activeTab && activeTab.loading"
    />
    <div
      class="caption text-truncate user-select-none"
      @contextmenu.stop="onContextMenu"
      v-text="activeTab && activeTab.title"
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
    <v-btn
      v-if="canCloseView"
      icon
      width="32"
      height="32"
      class="ml-1"
      title="Close View"
      @click="onClickCloseView"
    >
      <v-icon size="20">mdi-close</v-icon>
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
      <toolbar-text-field class="ml-1" :view-id="viewId" />
    </template>
  </v-toolbar>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { shell } from 'electron'
import { tabStore } from '~/store'
import Favicon from '~/components/Favicon.vue'
import ToolbarTextField from '~/components/ToolbarTextField.vue'

@Component({
  components: {
    Favicon,
    ToolbarTextField
  }
})
export default class Toolbar extends Vue {
  @Prop({ type: String, required: true }) readonly viewId!: string

  get classes() {
    return {
      active: tabStore.isActiveView({ id: this.viewId })
    }
  }

  get activeTab() {
    return tabStore.getActiveTab({ viewId: this.viewId })
  }

  get canCloseView() {
    return tabStore.canCloseView
  }

  get canGoBackTab() {
    return tabStore.getCanGoBackTab({ viewId: this.viewId })
  }

  get canGoForwardTab() {
    return tabStore.getCanGoForwardTab({ viewId: this.viewId })
  }

  mounted() {
    this.$eventBus.$on('showBackHistory', this.showBackHistory)
    this.$eventBus.$on('showForwardHistory', this.showForwardHistory)
  }

  destroyed() {
    this.$eventBus.$off('showBackHistory', this.showBackHistory)
    this.$eventBus.$off('showForwardHistory', this.showForwardHistory)
  }

  showBackHistory({ viewId, history }: { viewId: string; history: string[] }) {
    if (this.viewId !== viewId) {
      return
    }
    this.$contextMenu.show(
      history.map((title, index) => {
        return {
          label: title,
          click: () =>
            this.$eventBus.$emit('goToOffset', {
              viewId: this.viewId,
              offset: -index - 1
            })
        }
      })
    )
  }

  showForwardHistory({
    viewId,
    history
  }: {
    viewId: string
    history: string[]
  }) {
    if (this.viewId !== viewId) {
      return
    }
    this.$contextMenu.show(
      history.map((history, index) => {
        return {
          label: history,
          click: () =>
            this.$eventBus.$emit('goToOffset', {
              viewId: this.viewId,
              offset: index + 1
            })
        }
      })
    )
  }

  onClickGoBack() {
    this.$eventBus.$emit('goBack', { viewId: this.viewId })
  }

  onClickGoForward() {
    this.$eventBus.$emit('goForward', { viewId: this.viewId })
  }

  onClickReload() {
    this.$eventBus.$emit('reload', { viewId: this.viewId })
  }

  onClickStop() {
    this.$eventBus.$emit('stop', { viewId: this.viewId })
  }

  onClickClose() {
    const tab = this.activeTab
    if (tab) {
      tabStore.closeTab({ id: tab.id })
    }
  }

  onClickCloseView() {
    tabStore.closeView({ id: this.viewId })
  }

  onClickGoBackTab() {
    tabStore.goBackTab({ viewId: this.viewId })
  }

  onClickGoForwardTab() {
    tabStore.goForwardTab({ viewId: this.viewId })
  }

  onContextMenu() {
    const tab = this.activeTab
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
    this.$eventBus.$emit('requestBackHistory', { viewId: this.viewId })
  }

  onContextMenuForward() {
    this.$eventBus.$emit('requestForwardHistory', { viewId: this.viewId })
  }

  onContextMenuBackTab() {
    this.$contextMenu.show(
      tabStore
        .getBackTabHistory({ viewId: this.viewId })
        .map((history, index) => {
          return {
            label: history && history.title,
            click: () =>
              tabStore.goToOffsetTab({
                viewId: this.viewId,
                offset: -index - 1
              })
          }
        })
    )
  }

  onContextMenuForwardTab() {
    this.$contextMenu.show(
      tabStore
        .getForwardTabHistory({ viewId: this.viewId })
        .map((history, index) => {
          return {
            label: history && history.title,
            click: () =>
              tabStore.goToOffsetTab({
                viewId: this.viewId,
                offset: index + 1
              })
          }
        })
    )
  }
}
</script>

<style lang="scss" scoped>
.toolbar:not(.active) .caption {
  opacity: 0.5;
}
</style>
