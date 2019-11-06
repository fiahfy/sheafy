<template>
  <v-toolbar
    v-if="activeTab && activeTab.finding"
    dense
    class="tab-finding-bar"
  >
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
      width="36"
      height="36"
      class="ml-1"
      title="Close"
      :disabled="!findingText"
      @click="onClickUp"
    >
      <v-icon size="20">mdi-chevron-up</v-icon>
    </v-btn>
    <v-btn
      icon
      width="36"
      height="36"
      class="ml-1"
      title="Close"
      :disabled="!findingText"
      @click="onClickDown"
    >
      <v-icon size="20">mdi-chevron-down</v-icon>
    </v-btn>
    <v-btn
      icon
      width="36"
      height="36"
      class="ml-1"
      title="Close"
      @click="onClickClose"
    >
      <v-icon size="20">mdi-close</v-icon>
    </v-btn>
  </v-toolbar>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { tabStore } from '~/store'

@Component
export default class FindingBar extends Vue {
  get findingText() {
    const tab = tabStore.activeTab
    return tab ? tab.findingText : ''
  }
  set findingText(value) {
    const tab = tabStore.activeTab
    if (!tab) {
      return
    }
    tabStore.updateTab({ id: tab.id, findingText: value })
    if (value) {
      this.$eventBus.$emit('findInPage', value, {
        forward: true,
        findNext: false
      })
    } else {
      this.$eventBus.$emit('stopFindInPage')
      tabStore.updateTab({
        id: tab.id,
        foundActiveMatchOrdinal: 0,
        foundMatches: 0
      })
    }
  }
  get activeTab() {
    return tabStore.activeTab
  }

  onFocus() {
    if (this.findingText) {
      this.$eventBus.$emit('findInPage', this.findingText, {
        forward: true,
        findNext: false
      })
    }
  }
  onKeyDownEnter(e: KeyboardEvent) {
    if (this.findingText) {
      this.$eventBus.$emit('findInPage', this.findingText, {
        forward: !e.shiftKey,
        findNext: true
      })
    }
  }
  onKeyDownEsc() {
    this.$eventBus.$emit('stopFindInPage')
    const tab = tabStore.activeTab
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
    if (this.findingText) {
      this.$eventBus.$emit('findInPage', this.findingText, {
        forward: false,
        findNext: true
      })
    }
  }
  onClickDown() {
    if (this.findingText) {
      this.$eventBus.$emit('findInPage', this.findingText, {
        forward: true,
        findNext: true
      })
    }
  }
  onClickClose() {
    this.$eventBus.$emit('stopFindInPage')
    const tab = tabStore.activeTab
    if (tab) {
      tabStore.updateTab({ id: tab.id, finding: false })
    }
  }
}
</script>
