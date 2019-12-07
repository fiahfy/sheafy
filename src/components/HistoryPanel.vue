<template>
  <div class="history-panel d-flex flex-column">
    <v-toolbar
      tile
      dense
      flat
      class="flex-grow-0 pr-2"
      height="36"
      extended
      extension-height="36"
    >
      <span class="subtitle-2 text-uppercase text-truncate user-select-none">
        history
      </span>
      <chip v-if="items.length" class="ml-3" :num="items.length" />
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
      <template slot="extension">
        <v-text-field
          v-model="searchText"
          class="body-2"
          clearable
          clear-icon="mdi-close-circle-outline"
          prepend-inner-icon="mdi-magnify"
          placeholder="Search"
          outlined
          dense
          hide-details
        />
      </template>
    </v-toolbar>
    <div
      id="scroll-target"
      ref="container"
      class="flex-grow-1 overflow-y-scroll scrollbar"
    >
      <history-list
        v-if="pagingItems.length"
        v-scroll:#scroll-target="onScroll"
        :items="pagingItems"
      />
      <div v-else class="d-flex justify-center caption py-5">
        <div>No history</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Ref, Watch } from 'vue-property-decorator'
import { debounce } from 'debounce'
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
  @Ref() readonly container!: HTMLDivElement

  searchText = ''
  lazySearchText = ''
  debounced = debounce(this.lazySearch, 500)
  page = 1
  perPage = 100

  get items() {
    const items = historyStore.sortedHistoryItems
    if (!this.lazySearchText) {
      return items
    }
    const words = this.lazySearchText.replace(/\s+/, ' ').split(' ')
    return items.filter((item) => {
      return words.every((word) => {
        return (
          (item.url || '').includes(word) || (item.title || '').includes(word)
        )
      })
    })
  }

  get pagingItems() {
    return this.items.slice(0, this.page * this.perPage)
  }

  @Watch('searchText')
  onSearchTextChanged() {
    this.debounced()
  }

  onClickClearAll() {
    historyStore.clearHistoryItems()
  }

  onScroll(e: Event) {
    const top = (e.target as HTMLDivElement).scrollTop
    if (
      top + this.container.offsetHeight >
        this.container.scrollHeight - this.container.offsetHeight / 2 &&
      this.page <= Math.ceil(this.items.length / this.perPage)
    ) {
      this.page++
    }
  }

  lazySearch() {
    this.lazySearchText = this.searchText
    this.container.scrollTop = 0
    this.page = 1
  }
}
</script>

<style lang="scss" scoped>
.history-panel {
  .v-text-field ::v-deep .v-input__control > .v-input__slot {
    min-height: unset;
    padding: 0 8px;
    > .v-input__prepend-inner {
      margin-top: 0;
      padding-right: 8px;
      align-self: center;
    }
    > .v-input__append-inner {
      margin-top: 0;
      padding-left: 8px;
      align-self: center;
    }
  }
}
</style>
