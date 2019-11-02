<template>
  <v-list two-line dense class="download-list py-0">
    <download-list-item
      v-for="download of downloads.slice().reverse()"
      :key="download.key"
      :download="download"
    />
  </v-list>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import Download from '~/models/download'
import DownloadListItem from '~/components/DownloadListItem.vue'

@Component({
  components: {
    DownloadListItem
  }
})
export default class DownloadList extends Vue {
  @Prop({ type: Array, default: () => [] }) readonly downloads!: Download[]
}
</script>
