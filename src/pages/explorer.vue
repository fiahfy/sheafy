<template>
  <v-container
    class="explorer"
    fill-height
    fluid
    pa-0
    :class="{ resizing: resizing }"
  >
    <explorer-tab-bar :resizing.sync="resizing" />
    <explorer-toolbar />
    <div class="flex-grow-1 fill-height">
      <explorer-webview
        v-for="tab in tabs"
        :key="tab.id"
        :tab="tab"
        class="flex-grow-1 fill-height"
      />
      <explorer-search-bar />
    </div>
  </v-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import ExplorerSearchBar from '~/components/ExplorerSearchBar'
import ExplorerTabBar from '~/components/ExplorerTabBar'
import ExplorerToolbar from '~/components/ExplorerToolbar'
import ExplorerWebview from '~/components/ExplorerWebview'

export default {
  components: {
    ExplorerSearchBar,
    ExplorerTabBar,
    ExplorerToolbar,
    ExplorerWebview
  },
  data() {
    return {
      resizing: false
    }
  },
  computed: {
    ...mapState('tab', ['tabs'])
  },
  created() {
    this.newTabIfEmpty()
  },
  methods: {
    ...mapActions('tab', ['newTabIfEmpty'])
  }
}
</script>

<style lang="scss" scoped>
.explorer {
  &.resizing > .explorer-webview {
    pointer-events: none;
  }
  .explorer-search-bar {
    position: absolute;
    top: 0;
    right: 0;
  }
}
</style>
