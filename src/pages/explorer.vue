<template>
  <v-container class="explorer" fill-height fluid pa-0>
    OK
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import ExplorerToolbar from '~/components/ExplorerToolbar'
import ExplorerCard from '~/components/ExplorerCard'
import ExplorerTable from '~/components/ExplorerTable'
import ExplorerGridList from '~/components/ExplorerGridList'

export default {
  components: {
    ExplorerToolbar,
    ExplorerCard
  },
  computed: {
    component() {
      return this.display === 'list' ? ExplorerTable : ExplorerGridList
    },
    ...mapState('local/explorer', ['display'])
  }
}
</script>
