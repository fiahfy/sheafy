<template>
  <v-toolbar class="toolbar" flat dense extension-height="0">
    <v-btn
      v-long-press="onContextMenuBack"
      icon
      width="36"
      height="36"
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
      width="36"
      height="36"
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
      width="36"
      height="36"
      class="mr-1"
      title="Stop"
      @click="onClickStop"
    >
      <v-icon size="20">mdi-close</v-icon>
    </v-btn>
    <v-btn
      v-else
      icon
      width="36"
      height="36"
      class="mr-1"
      title="Reload"
      @click="onClickReload"
    >
      <v-icon size="20">mdi-refresh</v-icon>
    </v-btn>
    <query-text-field class="mx-1" />
    <v-btn
      v-long-press="onContextMenuBackTab"
      icon
      width="36"
      height="36"
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
      width="36"
      height="36"
      class="ml-1"
      title="Go Forward Tab"
      :disabled="!canGoForwardTab"
      @click="onClickGoForwardTab"
      @contextmenu.stop="onContextMenuForwardTab"
    >
      <v-icon size="20">mdi-chevron-right</v-icon>
    </v-btn>
    <v-divider slot="extension" />
  </v-toolbar>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { tabStore } from '~/store'
import QueryTextField from '~/components/QueryTextField.vue'

@Component({
  components: {
    QueryTextField
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
  onClickGoBackTab() {
    tabStore.goBackTab()
  }
  onClickGoForwardTab() {
    tabStore.goForwardTab()
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

<style lang="scss" scoped>
.toolbar ::v-deep {
  .v-toolbar__extension {
    padding: 0;
    > .v-divider {
      border-color: transparent;
    }
  }
}
</style>
