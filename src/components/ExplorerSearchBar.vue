<template>
  <v-toolbar v-if="activeTab.searching" dense class="explorer-search-bar">
    <v-text-field
      v-model="searchText"
      name="search-text"
      autofocus
      hide-details
      @focus="onFocus"
      @keydown.enter="onKeyDownEnter"
      @keydown.esc="onKeyDownEsc"
    />
    <div v-if="activeTab.searchMatches !== null">
      {{ activeTab.searchActiveMatchOrdinal }} / {{ activeTab.searchMatches }}
    </div>
    <v-btn
      icon
      width="36"
      height="36"
      class="ml-1"
      title="Close"
      @click="onClick"
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
          this.$root.$emit('findInPage', searchText, {
            forward: true,
            findNext: false
          })
        } else {
          this.$root.$emit('stopFindInPage')
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
        this.$root.$emit('findInPage', this.searchText, {
          forward: true,
          findNext: false
        })
      }
    },
    onKeyDownEnter(e) {
      if (this.searchText) {
        this.$root.$emit('findInPage', this.searchText, {
          forward: !e.shiftKey,
          findNext: true
        })
      }
    },
    onKeyDownEsc() {
      this.$root.$emit('stopFindInPage')
      this.updateTab({ id: this.activeTab.id, searching: false })
    },
    onClick() {
      this.$root.$emit('stopFindInPage')
      this.updateTab({ id: this.activeTab.id, searching: false })
    },
    ...mapActions('tab', ['updateTab'])
  }
}
</script>

<style lang="scss" scoped>
.explorer-search-bar {
  width: 300px;
}
</style>
