<template>
  <div class="download-panel d-flex flex-column">
    <v-toolbar tile dense flat class="flex-grow-0 pr-2" height="36">
      <span class="subtitle-2 text-uppercase text-truncate user-select-none">
        downloads
      </span>
      <badge v-if="downloads.length" class="ml-3" :num="downloads.length" />
      <v-spacer />
      <v-btn
        icon
        width="32"
        height="32"
        title="Clear All"
        @click="onClickClearAll"
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

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { downloadStore } from '~/store'
import Badge from '~/components/Badge.vue'
import DownloadList from '~/components/DownloadList.vue'

@Component({
  components: {
    Badge,
    DownloadList
  }
})
export default class DownloadPanel extends Vue {
  get downloads() {
    return downloadStore.downloads
  }

  onClickClearAll() {
    downloadStore.clearDownloads()
  }
}
</script>
