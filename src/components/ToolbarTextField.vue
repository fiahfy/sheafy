<template>
  <v-text-field
    v-model="query"
    filled
    rounded
    hide-details
    class="toolbar-text-field body-2"
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
import { Vue, Component, Prop } from 'vue-property-decorator'
import { tabStore } from '~/store'

@Component
export default class ToolbarTextField extends Vue {
  @Prop({ type: String, required: true }) readonly viewId!: string

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

  onKeyPressEnter(e: KeyboardEvent) {
    const input = e.target as HTMLInputElement
    input.blur()
    this.$eventBus.$emit('load', { viewId: this.viewId })
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
