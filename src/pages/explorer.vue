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
    <explorer-webview
      v-for="tab in tabs"
      :key="tab.id"
      :tab="tab"
      class="fill-height spacer"
    />
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import ExplorerTabBar from '~/components/ExplorerTabBar'
import ExplorerToolbar from '~/components/ExplorerToolbar'
import ExplorerWebview from '~/components/ExplorerWebview'

export default {
  components: {
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
    ...mapState('tab', ['tabs']),
    ...mapGetters('tab', ['isActiveTab'])
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
.explorer.resizing > .explorer-webview {
  pointer-events: none;
}
</style>
