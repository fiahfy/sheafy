<template>
  <v-container class="explorer" fill-height fluid pa-0>
    <explorer-tabbar />
    <explorer-toolbar />
    <explorer-webview
      v-for="tab in tabs"
      :key="tab.id"
      :tab="tab"
      class="fill-height spacer"
      :class="getClasses(tab)"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
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
  methods: {
    getClasses(tab) {
      return {
        'd-none': !this.isActiveTab(tab)
      }
    }
  }
}
</script>
