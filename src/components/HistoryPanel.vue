<template>
  <div class="history-panel d-flex flex-column">
    <v-toolbar tile dense flat class="flex-grow-0 pr-2" height="36">
      <span class="subtitle-2 text-uppercase text-truncate user-select-none">
        history
      </span>
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
      <history-list v-if="items.length" :items="items" />
      <div v-else class="d-flex justify-center caption py-5">
        <div>No history</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { historyStore } from '~/store'
import Chip from '~/components/Chip.vue'
import HistoryList from '~/components/HistoryList.vue'

@Component({
  components: {
    Chip,
    HistoryList
  }
})
export default class HistoryPanel extends Vue {
  get items() {
    return historyStore.sortedHistoryItems
  }

  onClickClearAll() {
    historyStore.clearHistoryItems()
  }
}
</script>
