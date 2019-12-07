<template>
  <v-toolbar v-if="activeTab && activeTab.finding" dense class="finding-bar">
    <v-text-field
      v-model="findingText"
      name="finding-text"
      class="body-2"
      autofocus
      hide-details
      @focus="onFocus"
      @keydown.enter="onKeyDownEnter"
      @keydown.esc="onKeyDownEsc"
      @contextmenu.stop="onContextMenu"
    />
    <div v-if="activeTab && activeTab.findingText" class="ml-2 body-2">
      {{ activeTab.foundActiveMatchOrdinal }} / {{ activeTab.foundMatches }}
    </div>
    <v-btn
      icon
      width="32"
      height="32"
      class="ml-1"
      title="Close"
      :disabled="!findingText"
      @click="onClickUp"
    >
      <v-icon size="20">mdi-chevron-up</v-icon>
    </v-btn>
    <v-btn
      icon
      width="32"
      height="32"
      class="ml-1"
      title="Close"
      :disabled="!findingText"
      @click="onClickDown"
    >
      <v-icon size="20">mdi-chevron-down</v-icon>
    </v-btn>
    <v-btn
      icon
      width="32"
      height="32"
      class="ml-1"
      title="Close"
      @click="onClickClose"
    >
      <v-icon size="20">mdi-close</v-icon>
    </v-btn>
  </v-toolbar>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { tabStore } from '~/store'

@Component
export default class FindingBar extends Vue {
  @Prop({ type: String, required: true }) readonly viewId!: string

  get activeTab() {
    return tabStore.getActiveTab({ viewId: this.viewId })
  }

  get findingText() {
    const tab = this.activeTab
    return tab ? tab.findingText : ''
  }

  set findingText(value) {
    const tab = this.activeTab
    if (!tab) {
      return
    }
    tabStore.updateTab({ id: tab.id, findingText: value })
    if (value) {
      this.$eventBus.$emit('findInPage', {
        viewId: this.viewId,
        text: value,
        forward: true,
        findNext: false
      })
    } else {
      this.$eventBus.$emit('stopFindInPage', { viewId: this.viewId })
      tabStore.updateTab({
        id: tab.id,
        foundActiveMatchOrdinal: 0,
        foundMatches: 0
      })
    }
  }

  mounted() {
    this.$eventBus.$on('focusFinding', this.focus)
  }

  destroyed() {
    this.$eventBus.$off('focusFinding', this.focus)
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

  onFocus() {
    if (!this.findingText) {
      return
    }
    this.$eventBus.$emit('findInPage', {
      viewId: this.viewId,
      text: this.findingText,
      forward: true,
      findNext: false
    })
  }

  onKeyDownEnter(e: KeyboardEvent) {
    if (!this.findingText) {
      return
    }
    this.$eventBus.$emit('findInPage', {
      viewId: this.viewId,
      text: this.findingText,
      forward: !e.shiftKey,
      findNext: true
    })
  }

  onKeyDownEsc() {
    this.$eventBus.$emit('stopFindInPage', { viewId: this.viewId })
    const tab = this.activeTab
    if (tab) {
      tabStore.updateTab({ id: tab.id, finding: false })
    }
  }

  onContextMenu() {
    this.$contextMenu.show([
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' }
    ])
  }

  onClickUp() {
    if (!this.findingText) {
      return
    }
    this.$eventBus.$emit('findInPage', {
      viewId: this.viewId,
      text: this.findingText,
      forward: false,
      findNext: true
    })
  }

  onClickDown() {
    if (!this.findingText) {
      return
    }
    this.$eventBus.$emit('findInPage', {
      viewId: this.viewId,
      text: this.findingText,
      forward: true,
      findNext: true
    })
  }

  onClickClose() {
    this.$eventBus.$emit('stopFindInPage', { viewId: this.viewId })
    const tab = this.activeTab
    if (tab) {
      tabStore.updateTab({ id: tab.id, finding: false })
    }
  }
}
</script>
