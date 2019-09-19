<template>
  <v-container class="explorer" fill-height fluid pa-0>
    <explorer-tab-bar />
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
