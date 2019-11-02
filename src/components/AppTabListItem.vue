<template>
  <v-list-item
    class="app-tab-list-item"
    :class="{ 'sub-group': subGroup }"
    :title="title"
    :input-value="active"
    @click="onClick"
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
      <v-btn icon small title="Close" @click.stop="onClickClose">
        <v-icon small>mdi-close</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { shell } from 'electron'
import { tabStore } from '~/store'
import Tab from '~/models/tab'
import AppTabListItemIcon from '~/components/AppTabListItemIcon.vue'
import Badge from '~/components/Badge.vue'

@Component({
  components: {
    AppTabListItemIcon,
    Badge
  }
})
export default class AppTabListItem extends Vue {
  @Prop({ type: Object, required: true }) readonly tab!: Tab
  @Prop({ type: Boolean, default: false }) readonly subGroup!: boolean

  get active() {
    return tabStore.isActiveTab({ id: this.tab.id })
  }
  get title() {
    return this.subGroup ? this.tab.title : this.tab.host
  }
  get badge() {
    return this.tab.badge > 99 ? '99+' : String(this.tab.badge)
  }

  onClick() {
    tabStore.activateTab({ id: this.tab.id })
  }
  onClickClose() {
    tabStore.closeTab({ id: this.tab.id })
  }
  onContextMenu() {
    this.$contextMenu.show([
      {
        label: 'New Tab',
        click: () =>
          tabStore.newTab({ options: { srcId: this.tab.id, position: 'next' } })
      },
      { type: 'separator' },
      {
        label: 'Duplicate Tab',
        click: () => tabStore.duplicateTab({ id: this.tab.id })
      },
      {
        label: 'Open Current Page in a Default Browser',
        click: () => shell.openExternal(this.tab.url)
      },
      { type: 'separator' },
      {
        label: 'Close Tab',
        click: () => tabStore.closeTab({ id: this.tab.id })
      }
    ])
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
