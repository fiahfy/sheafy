<template>
  <v-list two-line dense class="history-list py-0">
    <history-list-item
      v-for="item of items.slice().reverse()"
      :key="item.key"
      :item="item"
    />
  </v-list>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import HistoryItem from '~/models/history-item'
import HistoryListItem from '~/components/HistoryListItem.vue'

@Component({
  components: {
    HistoryListItem
  }
})
export default class HistoryList extends Vue {
  @Prop({ type: Array, default: () => [] }) readonly items!: HistoryItem[]
}
</script>
