<template>
  <v-toolbar v-if="activeTab.finding" dense class="finding-bar">
    <v-text-field
      v-model="findingText"
      name="finding-text"
      class="body-2"
      autofocus
      hide-details
      @focus="onFocus"
      @keydown.enter="onKeyDownEnter"
      @keydown.esc="onKeyDownEsc"
    />
    <div v-if="activeTab.foundMatches !== null" class="ml-2 body-2">
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

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  computed: {
    findingText: {
      get() {
        return this.activeTab.findingText
      },
      set(value) {
        this.updateTab({ id: this.activeTab.id, findingText: value })
        if (value) {
          this.$eventBus.$emit('findInPage', value, {
            forward: true,
            findNext: false
          })
        } else {
          this.$eventBus.$emit('stopFindInPage')
          this.updateTab({
            id: this.activeTab.id,
            foundActiveMatchOrdinal: null,
            foundMatches: null
          })
        }
      }
    },
    ...mapGetters('tab', ['activeTab'])
  },
  methods: {
    onFocus(e) {
      e.target.select()
      if (this.findingText) {
        this.$eventBus.$emit('findInPage', this.findingText, {
          forward: true,
          findNext: false
        })
      }
    },
    onKeyDownEnter(e) {
      if (this.findingText) {
        this.$eventBus.$emit('findInPage', this.findingText, {
          forward: !e.shiftKey,
          findNext: true
        })
      }
    },
    onKeyDownEsc() {
      this.$eventBus.$emit('stopFindInPage')
      this.updateTab({ id: this.activeTab.id, finding: false })
    },
    onClickUp() {
      if (this.findingText) {
        this.$eventBus.$emit('findInPage', this.findingText, {
          forward: false,
          findNext: true
        })
      }
    },
    onClickDown() {
      if (this.findingText) {
        this.$eventBus.$emit('findInPage', this.findingText, {
          forward: true,
          findNext: true
        })
      }
    },
    onClickClose() {
      this.$eventBus.$emit('stopFindInPage')
      this.updateTab({ id: this.activeTab.id, finding: false })
    },
    ...mapActions('tab', ['updateTab'])
  }
}
</script>
