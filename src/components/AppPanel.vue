<template>
  <div
    class="app-panel d-flex flex-column"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
  >
    <v-toolbar tile dense flat class="flex-grow-0">
      <span class="subtitle-2 text-uppercase text-truncate user-select-none">
        apps
      </span>
      <badge class="ml-3" :num="apps.length" />
      <v-spacer />
      <v-btn icon width="36" height="36" title="New Tab" @click="newTab">
        <v-icon size="20">mdi-tab-plus</v-icon>
      </v-btn>
      <v-btn
        icon
        width="36"
        height="36"
        title="Expand Apps"
        @click="onClickExpand"
      >
        <v-icon size="20">mdi-expand-all</v-icon>
      </v-btn>
      <v-btn
        icon
        width="36"
        height="36"
        title="Collapse Apps"
        @click="onClickCollapse"
      >
        <v-icon size="20">mdi-collapse-all</v-icon>
      </v-btn>
    </v-toolbar>
    <div ref="container" class="flex-grow-1 overflow-y-scroll scrollbar">
      <app-list :apps="apps" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import AppList from '~/components/AppList'
import Badge from '~/components/Badge'

export default {
  components: {
    AppList,
    Badge
  },
  computed: {
    ...mapGetters('tab', ['activeTab', 'apps', 'getUrlWithQuery'])
  },
  watch: {
    activeTab(newValue, oldValue) {
      if (newValue.id === oldValue.id && newValue.host === oldValue.host) {
        return
      }
      this.$nextTick(() => {
        // Disabled transform for vuedraggable
        this.$el.querySelectorAll('.app-tab-list').forEach((el) => {
          el.parentElement.style.transform = 'none'
          el.querySelectorAll('.app-tab-list-item').forEach((el) => {
            el.parentElement.style.transform = 'none'
          })
        })
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
      const query = e.dataTransfer.getData('text')
      const url = this.getUrlWithQuery({ query })
      if (url) {
        this.newTab({ url })
      }
    },
    onClickExpand() {
      this.$eventBus.$emit('expandApps')
    },
    onClickCollapse() {
      this.$eventBus.$emit('collapseApps')
    },
    ...mapActions('tab', ['newTab'])
  }
}
</script>

<style lang="scss" scoped>
.app-panel > div {
  position: relative;
}
</style>
