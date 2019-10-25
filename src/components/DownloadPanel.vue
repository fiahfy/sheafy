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
    </v-toolbar>
    <div ref="container" class="flex-grow-1 overflow-y-scroll scrollbar">
      <v-list two-line dense class="py-0">
        <download-list-item
          v-for="download of downloads"
          :key="download.key"
          :download="download"
        />
      </v-list>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import DownloadListItem from '~/components/DownloadListItem'

export default {
  components: {
    DownloadListItem
  },
  computed: {
    ...mapState('download', ['downloads'])
  }
}
</script>
