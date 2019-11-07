<template>
  <v-text-field
    v-model="query"
    filled
    rounded
    hide-details
    class="tab-toolbar-text-field body-2"
    name="query"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @keypress.enter="onKeyPressEnter"
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
  </v-text-field>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { tabStore } from '~/store'

@Component
export default class QueryTextField extends Vue {
  focusIn = false

  get query() {
    const tab = tabStore.activeTab
    return tab ? tab.query : ''
  }
  set query(value) {
    const tab = tabStore.activeTab
    if (tab) {
      tabStore.updateTab({ id: tab.id, query: value })
    }
  }
  get activeTab() {
    return tabStore.activeTab
  }
  get icon() {
    const tab = tabStore.activeTab
    const url = tab ? tab.url : ''
    const match = url.match(/^http(s)?:\/\//)
    if (match) {
      return match[1] ? 'mdi-lock' : 'mdi-alert-circle-outline'
    }
    return 'mdi-help-circle-outline'
  }

  mounted() {
    this.$eventBus.$on('focusLocation', this.focus)
  }

  destroyed() {
    this.$eventBus.$off('focusLocation', this.focus)
  }

  focus() {
    this.$nextTick(() => {
      const el = this.$el.querySelector('input')
      el && el.focus()
    })
  }
  onContextMenu() {
    this.$contextMenu.show([
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' }
    ])
  }
  onMouseDown(e: MouseEvent) {
    const input = e.target
    if (input === document.activeElement) {
      return
    }
    ;(<Window>window).getSelection()!.empty()
    this.focusIn = true
  }
  onMouseUp(e: MouseEvent) {
    const input = <HTMLInputElement>e.target
    if (this.focusIn && !(<Window>window).getSelection()!.toString()) {
      input.select()
    }
    this.focusIn = false
  }
  onKeyPressEnter(e: KeyboardEvent) {
    const input = <HTMLInputElement>e.target
    input.blur()
    this.$eventBus.$emit('load')
  }
  onClickFind() {
    const tab = tabStore.activeTab
    if (tab) {
      tabStore.updateTab({ id: tab.id, finding: false })
    }
  }
}
</script>

<style lang="scss" scoped>
.tab-toolbar-text-field ::v-deep .v-input__control > .v-input__slot {
  min-height: unset;
  padding: 0 6px 0 12px !important;
  > .v-input__prepend-inner {
    margin-top: 0;
    padding-right: 8px;
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
</style>
