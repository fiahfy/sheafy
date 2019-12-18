<template>
  <div class="address-bar flex-grow-1">
    <v-text-field
      ref="combobox"
      v-model="query"
      class="body-2"
      name="query"
      filled
      dense
      hide-details
      :rounded="rounded"
      @focus="onFocus"
      @blur="onBlur"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @keydown.escape="onKeyDownEscape"
      @keydown.enter="onKeyDownEnter"
      @keydown.up="onKeyDownUp"
      @keydown.down="onKeyDownDown"
      @contextmenu.stop="onContextMenu"
    >
      <v-icon slot="prepend-inner" small v-text="icon" />
      <v-btn
        v-if="activeTab && activeTab.finding"
        slot="append"
        x-small
        depressed
        rounded
        title="Find"
        @click.stop="onClickStopFind"
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
    </v-text-field>
    <v-menu
      v-model="menu"
      :position-x="x"
      :position-y="y"
      :max-width="width"
      :min-width="width"
      absolute
      max-height="360"
      :close-on-click="false"
      :close-on-content-click="false"
      :transition="false"
    >
      <v-list dense class="py-0">
        <v-list-item-group v-model="index" color="primary">
          <v-list-item
            v-for="(item, index) in items"
            :key="index"
            @mousedown.prevent
            @click="() => onClickItem(item)"
          >
            <v-list-item-icon class="mr-3 align-self-center">
              <favicon :url="item.favicon" />
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="font-weight-regular caption">
                <span v-text="item.title" />
                <span class="secondary--text">— {{ item.url }}</span>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts">
import { VCombobox } from 'vuetify/lib'
import { Vue, Component, Prop, Ref, Watch } from 'vue-property-decorator'
import { tabStore, historyStore } from '~/store'
import HistoryItem from '~/models/history-item'
import Favicon from '~/components/Favicon.vue'

@Component({
  components: {
    Favicon
  }
})
export default class AddressBar extends Vue {
  @Prop({ type: String, required: true }) readonly viewId!: string
  @Ref() readonly combobox!: typeof VCombobox

  focused = false
  focusIn = false
  menu = false
  width = 0
  x = 0
  y = 0
  index = 0

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
    return !this.menu
  }

  get items() {
    return historyStore.sortedHistoryItems
      .filter((item) => item.url !== this.query)
      .filter((item) => {
        return (
          item.title
            .toLocaleLowerCase()
            .includes(this.query.toLocaleLowerCase()) ||
          item.url.toLocaleLowerCase().includes(this.query.toLocaleLowerCase())
        )
      })
      .slice(0, 10)
  }

  get icon() {
    const tab = this.activeTab
    const query = tab ? tab.query : ''
    const match = query.match(/^(\w+):\/\//)
    if (!match) {
      return 'mdi-magnify'
    }
    switch (match[1]) {
      case 'https':
        return 'mdi-lock'
      case 'http':
        return 'mdi-alert-circle-outline'
      default:
        return 'mdi-help-circle-outline'
    }
  }

  @Watch('menu')
  onMenuChanged() {
    this.index = -1
  }

  @Watch('items')
  onItemsChanged(value: HistoryItem[]) {
    this.index = -1
    if (this.focused) {
      this.menu = !!value.length
    }
  }

  mounted() {
    this.$eventBus.$on('focusLocation', this.focus)
  }

  destroyed() {
    this.$eventBus.$off('focusLocation', this.focus)
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

  onContextMenu() {
    this.$contextMenu.openEditMenu()
  }

  onFocus() {
    this.focused = true
    const rect = this.$el.getBoundingClientRect()
    this.x = rect.left
    this.y = rect.top + rect.height
    this.width = rect.width
    this.menu = this.menu = !!this.items.length
  }

  onBlur() {
    this.focused = false
    this.menu = false
  }

  onMouseDown(e: MouseEvent) {
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

  onKeyDownUp() {
    const index = this.index - 1
    this.index = Math.max(0, Math.min(index, this.items.length - 1))
  }

  onKeyDownDown() {
    const index = this.index + 1
    this.index = Math.max(0, Math.min(index, this.items.length - 1))
  }

  onKeyDownEscape() {
    this.menu = false
  }

  onKeyDownEnter(e: KeyboardEvent) {
    const item = this.items[this.index]
    if (item) {
      this.query = item.url
    }
    if (!this.query) {
      return
    }
    const input = e.target as HTMLInputElement
    input.blur()
    this.$nextTick(() => {
      this.$eventBus.$emit('load', { viewId: this.viewId })
    })
  }

  onClickItem(item: HistoryItem) {
    this.query = item.url
    this.$nextTick(() => {
      this.$eventBus.$emit('load', { viewId: this.viewId })
    })
  }

  onClickStopFind() {
    const tab = this.activeTab
    if (tab) {
      tabStore.updateTab({ id: tab.id, finding: false })
    }
  }
}
</script>

<style lang="scss" scoped>
.address-bar .v-text-field {
  &.primary--text {
    caret-color: unset !important;
  }
  ::selection {
    color: unset;
  }
  ::v-deep .v-input__control > .v-input__slot {
    min-height: unset;
    padding: 0 6px 0 12px !important;
    &::before,
    &::after {
      display: none;
    }
    > .v-input__prepend-inner {
      margin-top: 0;
      padding-right: 12px;
      align-self: center;
    }
    > .v-text-field__slot > input {
      padding: 4px 0;
      margin-top: 0;
    }
    > .v-input__append-inner {
      margin-top: 0;
      align-self: center;
    }
  }
}
::v-deep .v-list-item {
  min-height: 36px !important;
  > .v-list-item__icon {
    height: unset !important;
    min-width: unset !important;
  }
}
</style>
