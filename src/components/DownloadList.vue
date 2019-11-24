<template>
  <v-list two-line dense class="download-list py-0">
    <download-list-item
      v-for="item of items.slice().reverse()"
      :key="item.key"
      :item="item"
    />
  </v-list>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import DownloadItem from '~/models/download-item'
import DownloadListItem from '~/components/DownloadListItem.vue'

@Component({
  components: {
    DownloadListItem
  }
})
export default class DownloadList extends Vue {
  @Prop({ type: Array, default: () => [] }) readonly items!: DownloadItem[]
}
</script>
