<template>
  <v-text-field
    v-model="query"
    outlined
    hide-details
    class="query-text-field body-2"
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

<script>
import { mapActions, mapGetters } from 'vuex'

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
    ...mapGetters('tab', ['activeTab'])
  },
  methods: {
    onContextMenu() {
      this.$contextMenu.show([
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ])
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
    onClickFind() {
      if (this.activeTab) {
        this.updateTab({ id: this.activeTab.id, finding: false })
      }
    },
    ...mapActions('tab', ['updateTab'])
  }
}
</script>

<style lang="scss" scoped>
.query-text-field ::v-deep .v-input__control > .v-input__slot {
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
  > .v-input__append-inner {
    margin-top: 0;
    align-self: center;
  }
}
</style>
