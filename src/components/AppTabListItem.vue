<template>
  <v-list-item
    class="app-tab-list-item"
    :class="{ 'sub-group': subGroup }"
    :title="title"
    :input-value="active"
    @click="activateTab({ id: tab.id })"
    @contextmenu.stop="onContextMenu"
  >
    <app-tab-list-item-icon
      class="mr-2"
      :url="tab.favicon"
      :host="tab.host"
      :loading="tab.loading"
    />
    <v-list-item-content>
      <v-list-item-title v-text="title" />
    </v-list-item-content>
    <badge v-if="tab.badge" class="ml-3" :num="badge" color="error" />
    <v-list-item-action class="my-0">
      <v-btn icon small title="Close" @click.stop="closeTab({ id: tab.id })">
        <v-icon small>mdi-close</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import { remote } from 'electron'
import { mapActions, mapGetters } from 'vuex'
import AppTabListItemIcon from '~/components/AppTabListItemIcon'
import Badge from '~/components/Badge'

export default {
  components: {
    AppTabListItemIcon,
    Badge
  },
  props: {
    tab: {
      type: Object,
      required: true
    },
    subGroup: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    active() {
      return this.isActiveTab({ id: this.tab.id })
    },
    title() {
      return this.subGroup ? this.tab.title : this.tab.host
    },
    badge() {
      return this.tab.badge > 99 ? '99+' : String(this.tab.badge)
    },
    ...mapGetters('tab', ['isActiveTab'])
  },
  methods: {
    onContextMenu() {
      this.$contextMenu.show([
        {
          label: 'New Tab',
          click: () =>
            this.newTab({ options: { srcId: this.tab.id, position: 'next' } })
        },
        { type: 'separator' },
        {
          label: 'Duplicate Tab',
          click: () => this.duplicateTab({ id: this.tab.id })
        },
        {
          label: 'Open Current Page in a Default Browser',
          click: () => remote.shell.openExternal(this.tab.url)
        },
        { type: 'separator' },
        {
          label: 'Close Tab',
          click: () => this.closeTab({ id: this.tab.id })
        }
      ])
    },
    ...mapActions('tab', ['newTab', 'duplicateTab', 'closeTab', 'activateTab'])
  }
}
</script>

<style lang="scss" scoped>
.app-tab-list-item {
  &.sub-group {
    padding-left: 32px;
  }
  &:not(.v-list-item--active):not(:hover) ::v-deep .v-list-item__action {
    opacity: 0;
  }
}
</style>
