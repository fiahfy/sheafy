<template>
  <v-app-bar
    class="toolbar"
    app
    clipped-left
    flat
    dense
    height="44"
    extension-height="1"
  >
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
      class="ml-1 body-2"
      name="query"
      @focus="onFocus"
      @keypress.enter="onKeyPressEnter"
      @contextmenu.stop="onContextMenuTextField"
    />
    <v-divider slot="extension" />
  </v-app-bar>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
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
    ...mapGetters('tab', ['activeTab'])
  },
  mounted() {
    this.$eventBus.$on('showBackHistories', (histories) => {
      this.$contextMenu.show(
        histories.map((history, index) => {
          return {
            label: history,
            click: () => this.$eventBus.$emit('goToOffset', -index - 1)
          }
        })
      )
    })
    this.$eventBus.$on('showForwardHistories', (histories) => {
      this.$contextMenu.show(
        histories.map((history, index) => {
          return {
            label: history,
            click: () => this.$eventBus.$emit('goToOffset', index + 1)
          }
        })
      )
    })
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
    onContextMenuBack() {
      this.$eventBus.$emit('requestBackHistories')
    },
    onContextMenuForward() {
      this.$eventBus.$emit('requestForwardHistories')
    },
    onContextMenuTextField() {
      this.$contextMenu.show([
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ])
    },
    onFocus(e) {
      e.target.select()
    },
    onKeyPressEnter(e) {
      e.target.blur()
      this.$eventBus.$emit('load')
    },
    ...mapActions('tab', ['updateTab'])
  }
}
</script>

<style lang="scss" scoped>
.toolbar ::v-deep {
  .v-toolbar__extension {
    padding: 0;
  }
  .v-text-field--outlined > .v-input__control > .v-input__slot {
    min-height: unset;
    > .v-text-field__slot > input {
      padding: 4px 0;
    }
  }
}
</style>
