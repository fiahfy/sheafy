<template>
  <v-container class="explorer" fill-height fluid pa-0>
    <explorer-tabbar />
    <explorer-toolbar />
    <explorer-webview
      v-for="tab in tabs"
      :key="tab.id"
      :tab="tab"
      class="fill-height spacer"
      :class="{ 'd-none': !isActiveTab(tab) }"
    />
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import ExplorerTabbar from '~/components/ExplorerTabbar'
import ExplorerToolbar from '~/components/ExplorerToolbar'
import ExplorerWebview from '~/components/ExplorerWebview'

export default {
  components: {
    ExplorerTabbar,
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
