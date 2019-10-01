<template>
  <v-list-item
    class="tab-list-item"
    :title="tab.title"
    :input-value="active"
    @click="activateTab({ id: tab.id })"
    @contextmenu.stop="onContextMenu"
  >
    <v-list-item-icon class="mr-4 px-1 align-self-center">
      <v-progress-circular
        v-if="tab.loading"
        indeterminate
        size="16"
        width="2"
        color="primary"
      />
      <template v-else>
        <v-icon v-if="error" small color="grey darken-1">mdi-earth</v-icon>
        <v-img
          v-else
          :src="tab.favicon"
          height="16"
          width="16"
          contain
          @error="error = true"
        />
      </template>
    </v-list-item-icon>
    <v-list-item-content>
      <v-list-item-title v-text="tab.title" />
    </v-list-item-content>
    <v-chip
      v-if="tab.badge"
      class="caption ml-3 px-2"
      color="error"
      v-text="badge"
    />
    <v-list-item-action class="my-0">
      <v-btn icon small @click.stop="closeTab({ id: tab.id })">
        <v-icon small>mdi-close</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import { remote } from 'electron'
import { mapActions, mapGetters } from 'vuex'

export default {
  props: {
    tab: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      error: false
    }
  },
  computed: {
    active() {
      return this.isActiveTab(this.tab)
    },
    pinned() {
      return this.isPinnedTab(this.tab)
    },
    badge() {
      return this.tab.badge > 99 ? '99+' : String(this.tab.badge)
    },
    ...mapGetters('tab', ['isActiveTab', 'isPinnedTab'])
  },
  watch: {
    tab(newValue, prevValue) {
      if (newValue.loading && !prevValue.loading) {
        this.error = false
      }
    }
  },
  methods: {
    onContextMenu() {
      this.$contextMenu.show([
        {
          label: 'New Tab',
          click: () =>
            this.newTab({ options: { baseId: this.tab.id, position: 'next' } })
        },
        { type: 'separator' },
        {
          label: 'Duplicate Tab',
          click: () =>
            this.newTab({
              url: this.tab.url,
              options: { baseId: this.tab.id, position: 'next' }
            })
        },
        {
          label: 'Open Current Page in a Default Browser',
          click: () => remote.shell.openExternal(this.tab.url)
        },
        {
          label: this.pinned ? 'Unpin Host' : 'Pin Host',
          click: () =>
            this.pinned
              ? this.unpinHost({ host: this.tab.host })
              : this.pinHost({ host: this.tab.host })
        },
        { type: 'separator' },
        {
          label: 'Close Tab',
          click: () => this.closeTab({ id: this.tab.id })
        }
      ])
    },
    ...mapActions('tab', ['newTab', 'closeTab', 'activateTab', 'pinHost'])
  }
}
</script>

<style lang="scss" scoped>
.tab-list-item {
  &:not(.v-list-item--active):not(:hover) ::v-deep .v-list-item__action {
    opacity: 0;
  }
  .v-chip {
    pointer-events: none;
    height: 18px;
    padding: 0 6px !important;
  }
}
</style>
