<template>
  <v-list-item
    class="history-list-item"
    :title="item.title"
    @click="onClickItem"
    @contextmenu.stop="onContextMenu"
  >
    <v-list-item-icon class="mr-3 align-center">
      <favicon :url="item.favicon" />
    </v-list-item-icon>

    <v-list-item-content>
      <v-list-item-title>
        <span class="text-truncate mr-3" v-text="item.title" />
      </v-list-item-title>
      <v-list-item-subtitle class="d-flex">
        <span v-text="item.host" />
        <v-spacer />
        <span class="secondary--text" v-text="updatedAt" />
      </v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { MenuItemConstructorOptions } from 'electron'
import { tabStore, historyStore } from '~/store'
import Favicon from '~/components/Favicon.vue'
import HistoryItem from '~/models/history-item'

@Component({
  components: {
    Favicon
  }
})
export default class HistoryListItem extends Vue {
  @Prop({ type: Object, required: true }) readonly item!: HistoryItem

  get updatedAt() {
    return new Date(this.item.updatedAt).toLocaleString()
  }

  onClickItem(e: MouseEvent) {
    tabStore.newTab({
      url: this.item.url,
      options: { viewId: e.altKey ? 'secondary' : 'primary' }
    })
  }

  onContextMenu() {
    const template: MenuItemConstructorOptions[] = [
      {
        label: 'Open to the Secondary View',
        click: () =>
          tabStore.newTab({
            url: this.item.url,
            options: { viewId: 'secondary' }
          })
      },
      { type: 'separator' },
      {
        label: 'Delete',
        click: () => historyStore.deleteHistoryItem({ id: this.item.id })
      }
    ]

    this.$contextMenu.show(template)
  }
}
</script>
