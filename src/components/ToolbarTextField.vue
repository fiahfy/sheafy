<template>
  <v-combobox
    ref="combobox"
    v-model="query"
    class="toolbar-text-field body-2"
    name="query"
    filled
    dense
    hide-details
    append-icon=""
    item-text="title"
    item-value="url"
    :rounded="rounded"
    :return-object="false"
    :items="items"
    :filter="filter"
    :menu-props="menuProps"
    @change="onChange"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @contextmenu.stop="onContextMenu"
  >
    <template v-slot:item="{ item }">
      <v-list-item-icon class="mr-3 align-self-center">
        <favicon :url="item.favicon" />
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title class="font-weight-regular caption">
          <span v-text="item.title" />
          <span class="secondary--text">— {{ item.url }}</span>
        </v-list-item-title>
      </v-list-item-content>
    </template>
    <v-icon slot="prepend-inner" small v-text="icon" />
    <v-btn
      v-if="activeTab && activeTab.finding"
      slot="append"
      x-small
      depressed
      rounded
      title="Find"
      @click.stop="onClickFind"
      @mouseup.stop
    >
      <v-icon small>mdi-file-search-outline</v-icon>
    </v-btn>
    <v-btn
      v-if="activeTab && activeTab.zooming"
      slot="append"
      x-small
      depressed
      rounded
      title="Zoom"
      @click.stop="onClickStopFind"
      @mouseup.stop
    >
      <v-icon small>mdi-magnify-plus-outline</v-icon>
    </v-btn>
  </v-combobox>
</template>

<script lang="ts">
import { VCombobox } from 'vuetify/lib'
import { Vue, Component, Prop, Ref } from 'vue-property-decorator'
import { tabStore, historyStore } from '~/store'
import HistoryItem from '~/models/history-item'
import Favicon from '~/components/Favicon.vue'

@Component({
  components: {
    Favicon
  }
})
export default class ToolbarTextField extends Vue {
  @Prop({ type: String, required: true }) readonly viewId!: string
  @Ref() readonly combobox!: typeof VCombobox

  width = 0
  focusIn = false

  get activeTab() {
    return tabStore.getActiveTab({ viewId: this.viewId })
  }

  get query() {
    const tab = this.activeTab
    return tab ? tab.query : ''
  }

  set query(value) {
    const tab = this.activeTab
    if (tab) {
      tabStore.updateTab({ id: tab.id, query: value })
    }
  }

  get rounded() {
    // TODO: return false if menu is open
    return true
  }

  get items() {
    return historyStore.sortedHistoryItems
  }

  get filter() {
    return (item: HistoryItem, queryText: string, itemText: string) => {
      return (
        itemText.toLocaleLowerCase().includes(queryText.toLocaleLowerCase()) ||
        item.url.toLocaleLowerCase().includes(queryText.toLocaleLowerCase())
      )
    }
  }

  get menuProps() {
    return {
      closeOnClick: false,
      closeOnContentClick: false,
      openOnClick: false,
      maxHeight: 480,
      offsetY: true,
      offsetOverflow: true,
      transition: false,
      maxWidth: this.width
    }
  }

  get icon() {
    const tab = this.activeTab
    const url = tab ? tab.url : ''
    const match = url.match(/^http(s)?:\/\//)
    if (match) {
      return match[1] ? 'mdi-lock' : 'mdi-alert-circle-outline'
    }
    return 'mdi-help-circle-outline'
  }

  mounted() {
    this.$eventBus.$on('focusLocation', this.focus)
    this.$eventBus.$on('hideQueryHistory', this.hideQueryHistory)
  }

  destroyed() {
    this.$eventBus.$off('focusLocation', this.focus)
    this.$eventBus.$off('hideQueryHistory', this.hideQueryHistory)
  }

  focus({ viewId }: { viewId: string }) {
    if (this.viewId !== viewId) {
      return
    }
    this.$nextTick(() => {
      const el = this.$el.querySelector('input')
      if (el) {
        el.focus()
        el.select()
      }
    })
  }

  hideQueryHistory() {
    ;(this.combobox as any).isMenuActive = false
  }

  onContextMenu() {
    this.$contextMenu.openEditMenu()
  }

  onChange() {
    this.hideQueryHistory()
    const input = this.$el.querySelector('input')!
    input.blur()
    this.$nextTick(() => {
      this.$eventBus.$emit('load', { viewId: this.viewId })
    })
  }

  onMouseDown(e: MouseEvent) {
    // adjust menu width
    this.width = (this.$el as HTMLElement).offsetWidth

    const input = e.target
    if (input === document.activeElement) {
      return
    }
    ;(window as Window).getSelection()!.empty()
    this.focusIn = true
  }

  onMouseUp(e: MouseEvent) {
    const input = e.target as HTMLInputElement
    if (this.focusIn && !(window as Window).getSelection()!.toString()) {
      input.select()
    }
    this.focusIn = false
  }

  onClickFind() {
    const tab = this.activeTab
    if (tab) {
      tabStore.updateTab({ id: tab.id, finding: false })
    }
  }
}
</script>

<style lang="scss" scoped>
.toolbar-text-field ::v-deep .v-input__control > .v-input__slot {
  min-height: unset;
  padding: 0 6px 0 12px !important;
  > .v-input__prepend-inner {
    margin-top: 0;
    padding-right: 8px;
    align-self: center;
  }
  > .v-select__slot {
    > input {
      padding: 4px 0;
      margin-top: 0 !important;
    }
    > .v-input__append-inner {
      margin-top: 0;
      align-self: center;
    }
  }
}
::v-deep .v-list-item {
  min-height: 36px;
  .v-list-item__icon {
    height: unset;
    min-width: unset;
  }
}
</style>
