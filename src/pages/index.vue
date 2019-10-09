<template>
  <v-container
    class="index"
    fill-height
    fluid
    pa-0
    :class="{ resizing: resizing }"
  >
    <sidebar :resizing.sync="resizing" />
    <toolbar />
    <div class="flex-grow-1 fill-height">
      <webview
        v-for="tab in tabs"
        :key="tab.id"
        :tab="tab"
        class="fill-height"
      />
      <shortcut-bar />
      <search-bar />
    </div>
  </v-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import SearchBar from '~/components/SearchBar'
import ShortcutBar from '~/components/ShortcutBar'
import Sidebar from '~/components/Sidebar'
import Toolbar from '~/components/Toolbar'
import Webview from '~/components/Webview'

export default {
  components: {
    SearchBar,
    ShortcutBar,
    Sidebar,
    Toolbar,
    Webview
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
.index {
  &.resizing ::v-deep webview {
    pointer-events: none;
  }
  .search-bar {
    position: absolute;
    top: 0;
    right: 0;
    width: 384px;
    max-width: 100%;
  }
  .shortcut-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 512px;
    max-width: 100%;
    margin: 0 auto;
    z-index: 1;
  }
}
</style>
