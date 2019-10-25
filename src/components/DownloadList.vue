<template>
  <v-list two-line dense class="download-list py-0">
    <download-list-item
      v-for="download of downloads"
      :key="download.key"
      :download="download"
    />
  </v-list>
</template>

<script>
import DownloadListItem from '~/components/DownloadListItem'

export default {
  components: {
    DownloadListItem
  },
  props: {
    downloads: {
      type: Array,
      default: () => []
    }
  }
}
</script>
