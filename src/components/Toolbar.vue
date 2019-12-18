<template>
  <v-toolbar
    class="toolbar pr-0"
    :class="classes"
    flat
    dense
    height="36"
    extended
    extension-height="36"
  >
    <div
      class="d-flex flex-grow-0 fill-height align-center user-select-none"
      style="min-width: 0;"
      @contextmenu.stop="onContextMenu"
    >
      <favicon
        class="mx-3"
        :url="activeTab && activeTab.favicon"
        :loading="activeTab && activeTab.loading"
      />
      <div
        class="caption text-truncate"
        v-text="activeTab && activeTab.title"
      />
      <v-btn icon small class="mx-1" title="Close" @click="onClickClose">
        <v-icon small>mdi-close</v-icon>
      </v-btn>
    </div>
    <div class="background d-flex flex-grow-1 fill-height align-center pl-1">
      <v-btn icon small class="mr-1" title="New Tab" @click="onClickNewTab">
        <v-icon small>mdi-plus</v-icon>
      </v-btn>
      <v-spacer />
      <v-btn
        v-long-press="onContextMenuBackTab"
        icon
        small
        class="mr-1"
        title="Go Back Tab"
        :disabled="!canGoBackTab"
        @click="onClickGoBackTab"
        @contextmenu.stop="onContextMenuBackTab"
      >
        <v-icon small>mdi-chevron-left</v-icon>
      </v-btn>
      <v-btn
        v-long-press="onContextMenuForwardTab"
        icon
        small
        class="mr-1"
        title="Go Forward Tab"
        :disabled="!canGoForwardTab"
        @click="onClickGoForwardTab"
        @contextmenu.stop="onContextMenuForwardTab"
      >
        <v-icon small>mdi-chevron-right</v-icon>
      </v-btn>
      <v-btn
        v-if="canCloseView"
        icon
        small
        class="mr-1"
        title="Close View"
        @click.stop="onClickCloseView"
      >
        <v-icon small>mdi-close</v-icon>
      </v-btn>
      <v-btn
        v-else
        icon
        small
        class="mr-1"
        title="Open Secondary View"
        @click.stop="onClickOpenView"
      >
        <v-icon small>mdi-view-split-vertical</v-icon>
      </v-btn>
    </div>
    <template slot="extension">
      <v-btn
        v-long-press="onContextMenuBack"
        icon
        small
        class="mr-2"
        title="Go Back"
        :disabled="!activeTab || !activeTab.canGoBack"
        @click="onClickGoBack"
        @contextmenu.stop="onContextMenuBack"
      >
        <v-icon size="18">mdi-arrow-left</v-icon>
      </v-btn>
      <v-btn
        v-long-press="onContextMenuForward"
        icon
        small
        class="mr-2"
        title="Go Forward"
        :disabled="!activeTab || !activeTab.canGoForward"
        @click="onClickGoForward"
        @contextmenu.stop="onContextMenuForward"
      >
        <v-icon size="18">mdi-arrow-right</v-icon>
      </v-btn>
      <v-btn
        v-if="activeTab && activeTab.loading"
        icon
        small
        class="mr-2"
        title="Stop"
        @click="onClickStop"
      >
        <v-icon size="18">mdi-close</v-icon>
      </v-btn>
      <v-btn
        v-else
        icon
        small
        class="mr-2"
        title="Reload"
        @click="onClickReload"
      >
        <v-icon size="18">mdi-refresh</v-icon>
      </v-btn>
      <address-bar class="ml-1" :view-id="viewId" />
    </template>
  </v-toolbar>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { shell } from 'electron'
import { tabStore, historyStore } from '~/store'
import AddressBar from '~/components/AddressBar.vue'
import Favicon from '~/components/Favicon.vue'

@Component({
  components: {
    AddressBar,
    Favicon
  }
})
export default class Toolbar extends Vue {
  @Prop({ type: String, required: true }) readonly viewId!: string

  storedEvent: MouseEvent | undefined = undefined

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
    const e = this.storedEvent
    if (!e) {
      return
    }
    this.$contextMenu.open(
      history.slice(0, 10).map((url, index) => {
        const item = historyStore.getHistoryItemWithUrl({ url })
        return {
          icon: item ? item.favicon : undefined,
          label: item ? item.title : url,
          click: () =>
            this.$eventBus.$emit('goToOffset', {
              viewId: this.viewId,
              offset: -index - 1
            })
        }
      }),
      { vuetify: true, x: e.clientX, y: e.clientY }
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
    const e = this.storedEvent
    if (!e) {
      return
    }
    this.$contextMenu.open(
      history.slice(0, 10).map((url, index) => {
        const item = historyStore.getHistoryItemWithUrl({ url })
        return {
          icon: item ? item.favicon : undefined,
          label: item ? item.title : url,
          click: () =>
            this.$eventBus.$emit('goToOffset', {
              viewId: this.viewId,
              offset: index + 1
            })
        }
      }),
      { vuetify: true, x: e.clientX, y: e.clientY }
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

  onClickNewTab() {
    tabStore.newTab()
  }

  onClickCloseView() {
    tabStore.closeView({ id: this.viewId })
  }

  onClickOpenView() {
    const tab = this.activeTab
    if (tab) {
      tabStore.activateTab({
        id: tab.id,
        viewId: 'secondary'
      })
    }
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
    this.$contextMenu.open(
      [
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
      ],
      { vuetify: true }
    )
  }

  onContextMenuBack(e: MouseEvent) {
    this.storedEvent = e
    this.$eventBus.$emit('requestBackHistory', { viewId: this.viewId })
  }

  onContextMenuForward(e: MouseEvent) {
    this.storedEvent = e
    this.$eventBus.$emit('requestForwardHistory', { viewId: this.viewId })
  }

  onContextMenuBackTab(e: MouseEvent) {
    this.$contextMenu.open(
      tabStore
        .getBackTabHistory({ viewId: this.viewId })
        .slice(0, 10)
        .map((tab, index) => {
          return {
            icon: tab && tab.favicon,
            label: tab && tab.title,
            click: () =>
              tabStore.goToOffsetTab({
                viewId: this.viewId,
                offset: -index - 1
              })
          }
        }),
      { vuetify: true, x: e.clientX, y: e.clientY }
    )
  }

  onContextMenuForwardTab(e: MouseEvent) {
    this.$contextMenu.open(
      tabStore
        .getForwardTabHistory({ viewId: this.viewId })
        .slice(0, 10)
        .map((tab, index) => {
          return {
            icon: tab && tab.favicon,
            label: tab && tab.title,
            click: () =>
              tabStore.goToOffsetTab({
                viewId: this.viewId,
                offset: index + 1
              })
          }
        }),
      { vuetify: true, x: e.clientX, y: e.clientY }
    )
  }
}
</script>

<style lang="scss" scoped>
.toolbar {
  &:not(.active) .caption {
    opacity: 0.5;
  }
  ::v-deep .v-toolbar__content {
    padding-left: 0;
    padding-right: 0;
  }
  .theme--light & .background {
    background: #eeeeee;
  }
  .theme--dark & .background {
    background: #212121;
  }
}
</style>
