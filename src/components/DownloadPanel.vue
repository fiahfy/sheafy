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
      <badge class="ml-3" :num="downloads.length" />
    </v-toolbar>
    <div ref="container" class="flex-grow-1 overflow-y-scroll scrollbar">
      <download-list :downloads="downloads" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Badge from '~/components/Badge'
import DownloadList from '~/components/DownloadList'

export default {
  components: {
    Badge,
    DownloadList
  },
  computed: {
    ...mapState('download', ['downloads'])
  }
}
</script>
