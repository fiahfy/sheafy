<template>
  <v-toolbar v-if="activeTab.searching" dense class="search-bar">
    <v-text-field
      v-model="searchText"
      name="search-text"
      class="body-2"
      autofocus
      hide-details
      @focus="onFocus"
      @keydown.enter="onKeyDownEnter"
      @keydown.esc="onKeyDownEsc"
    />
    <div v-if="activeTab.searchMatches !== null" class="ml-2 body-2">
      {{ activeTab.searchActiveMatchOrdinal }} / {{ activeTab.searchMatches }}
    </div>
    <v-btn
      icon
      width="36"
      height="36"
      class="ml-1"
      title="Close"
      :disabled="!searchText"
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
      :disabled="!searchText"
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
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    searchText: {
      get() {
        return this.activeTab.searchText
      },
      set(searchText) {
        this.updateTab({ id: this.activeTab.id, searchText })
        if (searchText) {
          this.$eventBus.$emit('findInPage', searchText, {
            forward: true,
            findNext: false
          })
        } else {
          this.$eventBus.$emit('stopFindInPage')
          this.updateTab({
            id: this.activeTab.id,
            searchActiveMatchOrdinal: null,
            searchMatches: null
          })
        }
      }
    },
    ...mapGetters('tab', ['activeTab'])
  },
  methods: {
    onFocus(e) {
      e.target.select()
      if (this.searchText) {
        this.$eventBus.$emit('findInPage', this.searchText, {
          forward: true,
          findNext: false
        })
      }
    },
    onKeyDownEnter(e) {
      if (this.searchText) {
        this.$eventBus.$emit('findInPage', this.searchText, {
          forward: !e.shiftKey,
          findNext: true
        })
      }
    },
    onKeyDownEsc() {
      this.$eventBus.$emit('stopFindInPage')
      this.updateTab({ id: this.activeTab.id, searching: false })
    },
    onClickUp() {
      if (this.searchText) {
        this.$eventBus.$emit('findInPage', this.searchText, {
          forward: false,
          findNext: true
        })
      }
    },
    onClickDown() {
      if (this.searchText) {
        this.$eventBus.$emit('findInPage', this.searchText, {
          forward: true,
          findNext: true
        })
      }
    },
    onClickClose() {
      this.$eventBus.$emit('stopFindInPage')
      this.updateTab({ id: this.activeTab.id, searching: false })
    },
    ...mapActions('tab', ['updateTab'])
  }
}
</script>

<style lang="scss" scoped>
.search-bar {
  width: 480px;
}
</style>
