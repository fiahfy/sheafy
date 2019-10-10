<template>
  <div
    class="app-content d-flex flex-column"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
  >
    <v-toolbar tile dense flat class="flex-grow-0">
      <span class="subtitle-2 text-uppercase text-truncate user-select-none">
        apps
      </span>
      <v-spacer />
      <v-btn icon width="36" height="36" title="New Tab" @click="newTab">
        <v-icon size="20">mdi-tab-plus</v-icon>
      </v-btn>
    </v-toolbar>
    <div ref="container" class="flex-grow-1 overflow-y-auto py-1">
      <app-list v-if="apps.length" :apps="apps" />
      <div
        v-else
        class="d-flex justify-center caption py-3 grey--text text--darken-1"
      >
        <div>No apps</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import AppList from '~/components/AppList'

export default {
  components: {
    AppList
  },
  computed: {
    ...mapGetters('tab', ['activeTab', 'apps', 'getUrlWithQuery'])
  },
  watch: {
    activeTab(oldValue, newValue) {
      if (oldValue.id === newValue.id && oldValue.host === newValue.host) {
        return
      }
      this.$nextTick(() => {
        const tab = this.$el.querySelector(
          '.app-tab-list-item.v-list-item--active'
        )
        if (!tab) {
          return
        }
        if (this.$refs.container.scrollTop > tab.offsetTop) {
          this.$refs.container.scrollTop = tab.offsetTop
        }
        if (
          this.$refs.container.scrollTop + this.$refs.container.offsetHeight <
          tab.offsetTop + tab.offsetHeight
        ) {
          this.$refs.container.scrollTop =
            tab.offsetTop + tab.offsetHeight - this.$refs.container.offsetHeight
        }
      })
    }
  },
  methods: {
    onDragOver(e) {
      e.dataTransfer.dropEffect = 'link'
    },
    onDrop(e) {
      const effectAllowed = e.dataTransfer.effectAllowed
      // Prevent for sorting tabs
      if (effectAllowed === 'move') {
        return
      }
      const url = this.getUrlWithQuery(e.dataTransfer.getData('text'))
      if (url) {
        this.newTab({ url })
      }
    },
    ...mapActions('tab', ['newTab'])
  }
}
</script>

<style lang="scss" scoped>
.app-content > div {
  position: relative;
  flex-basis: 0;
}
</style>
