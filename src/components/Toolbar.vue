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
      @click="goBack"
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
      @click="goForward"
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
      @click="stop"
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
      @click="reload"
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
      @click="goBackTab"
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
      @click="goForwardTab"
      @contextmenu.stop="onContextMenuForwardTab"
    >
      <v-icon size="20">mdi-chevron-right</v-icon>
    </v-btn>
    <v-divider slot="extension" />
  </v-toolbar>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import QueryTextField from '~/components/QueryTextField'

export default {
  components: {
    QueryTextField
  },
  computed: {
    ...mapGetters('tab', [
      'activeTab',
      'canGoBackTab',
      'canGoForwardTab',
      'backTabHistory',
      'forwardTabHistory'
    ])
  },
  mounted() {
    this.$eventBus.$on('showBackHistory', this.showBackHistory)
    this.$eventBus.$on('showForwardHistory', this.showForwardHistory)
  },
  destroyed() {
    this.$eventBus.$off('showBackHistory', this.showBackHistory)
    this.$eventBus.$off('showForwardHistory', this.showForwardHistory)
  },
  methods: {
    goBack() {
      this.$eventBus.$emit('goBack')
    },
    goForward() {
      this.$eventBus.$emit('goForward')
    },
    reload() {
      this.$eventBus.$emit('reload')
    },
    stop() {
      this.$eventBus.$emit('stop')
    },
    showBackHistory(history) {
      this.$contextMenu.show(
        history.map((history, index) => {
          return {
            label: history,
            click: () => this.$eventBus.$emit('goToOffset', -index - 1)
          }
        })
      )
    },
    showForwardHistory(history) {
      this.$contextMenu.show(
        history.map((history, index) => {
          return {
            label: history,
            click: () => this.$eventBus.$emit('goToOffset', index + 1)
          }
        })
      )
    },
    onContextMenuBack() {
      this.$eventBus.$emit('requestBackHistory')
    },
    onContextMenuForward() {
      this.$eventBus.$emit('requestForwardHistory')
    },
    onContextMenuBackTab() {
      this.$contextMenu.show(
        this.backTabHistory.map((history, index) => {
          return {
            label: history.title,
            click: () => this.goToOffsetTab({ offset: -index - 1 })
          }
        })
      )
    },
    onContextMenuForwardTab() {
      this.$contextMenu.show(
        this.forwardTabHistory.map((history, index) => {
          return {
            label: history.title,
            click: () => this.goToOffsetTab({ offset: index + 1 })
          }
        })
      )
    },
    ...mapActions('tab', ['goToOffsetTab', 'goBackTab', 'goForwardTab'])
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
