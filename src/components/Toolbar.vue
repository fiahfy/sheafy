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
    <v-text-field
      v-model="query"
      outlined
      hide-details
      class="mx-1 body-2"
      name="query"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @keypress.enter="onKeyPressEnter"
      @contextmenu.stop="onContextMenuTextField"
    >
      <v-icon slot="prepend-inner" small v-text="icon" />
    </v-text-field>
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

export default {
  data() {
    return {
      focusIn: false
    }
  },
  computed: {
    icon() {
      const match = this.activeTab.url.match(/^http(s)?:\/\//)
      if (match) {
        return match[1] ? 'mdi-lock' : 'mdi-alert-circle-outline'
      }
      return 'mdi-help-circle-outline'
    },
    query: {
      get() {
        return this.activeTab && this.activeTab.query
      },
      set(value) {
        if (this.activeTab) {
          this.updateTab({ id: this.activeTab.id, query: value })
        }
      }
    },
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
    onContextMenuReload() {
      this.$contextMenu.show([
        { label: 'Reload', click: () => this.$eventBus.$emit('reload') },
        {
          label: 'Force Reload',
          click: () => this.$eventBus.$emit('forceReload')
        }
      ])
    },
    onContextMenuTextField() {
      this.$contextMenu.show([
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ])
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
    onMouseDown(e) {
      if (e.target === document.activeElement) {
        return
      }
      window.getSelection().empty()
      this.focusIn = true
    },
    onMouseUp(e) {
      if (this.focusIn && !window.getSelection().toString()) {
        e.target.select()
      }
      this.focusIn = false
    },
    onKeyPressEnter(e) {
      e.target.blur()
      this.$eventBus.$emit('load')
    },
    ...mapActions('tab', [
      'updateTab',
      'goToOffsetTab',
      'goBackTab',
      'goForwardTab'
    ])
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
  .v-text-field--outlined > .v-input__control > .v-input__slot {
    min-height: unset;
    padding-left: 10px;
    > .v-input__prepend-inner {
      margin-top: 0;
      padding-right: 8px;
      align-self: center;
    }
    > .v-text-field__slot > input {
      padding: 4px 0;
    }
  }
}
</style>
