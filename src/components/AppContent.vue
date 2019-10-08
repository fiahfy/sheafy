<template>
  <div
    class="app-content d-flex flex-column"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
  >
    <v-toolbar tile dense flat class="flex-grow-0">
      <span class="subtitle-2 text-uppercase">apps</span>
    </v-toolbar>
    <div ref="container" class="flex-grow-1 overflow-y-auto">
      <app-list v-if="apps.length" :apps="apps" />
      <div
        v-else
        class="d-flex justify-center caption py-3 grey--text text--darken-1"
      >
        <div>No Apps</div>
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
    async onDrop(e) {
      const effectAllowed = e.dataTransfer.effectAllowed
      // Prevent for sorting tabs
      if (effectAllowed === 'move') {
        return
      }
      const url = this.getUrlWithQuery(e.dataTransfer.getData('text'))
      if (url) {
        const tab = await this.newTab({ url })
        this.pinApp({ host: tab.host })
      }
    },
    ...mapActions('tab', ['newTab', 'pinApp'])
  }
}
</script>

<style>
.app-content > div {
  position: relative;
  flex-basis: 0;
}
</style>
