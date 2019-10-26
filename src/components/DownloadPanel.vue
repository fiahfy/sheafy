<template>
  <div
    class="download-panel d-flex flex-column"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
  >
    <v-toolbar tile dense flat class="flex-grow-0">
      <span class="subtitle-2 text-uppercase text-truncate user-select-none">
        downloads
      </span>
      <badge v-if="downloads.length" class="ml-3" :num="downloads.length" />
      <v-spacer />
      <v-btn
        icon
        width="36"
        height="36"
        title="Clear All"
        @click="clearDownloads"
      >
        <v-icon size="20">mdi-notification-clear-all</v-icon>
      </v-btn>
    </v-toolbar>
    <div ref="container" class="flex-grow-1 overflow-y-scroll scrollbar">
      <download-list v-if="downloads.length" :downloads="downloads" />
      <div v-else class="d-flex justify-center caption py-5">
        <div>No downloads</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import Badge from '~/components/Badge'
import DownloadList from '~/components/DownloadList'

export default {
  components: {
    Badge,
    DownloadList
  },
  computed: {
    ...mapState('download', ['downloads'])
  },
  methods: {
    ...mapActions('download', ['clearDownloads'])
  }
}
</script>
