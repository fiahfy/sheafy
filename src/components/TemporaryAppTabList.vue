<template>
  <v-list class="temporary-app-tab-list primary--text py-1" dense>
    <draggable v-model="model" animation="150">
      <v-sheet v-for="tab in model" :key="tab.id" tile>
        <app-tab-list-item :tab="tab" temporary />
      </v-sheet>
    </draggable>
  </v-list>
</template>

<script>
import { mapActions } from 'vuex'
import AppTabListItem from '~/components/AppTabListItem'

export default {
  components: {
    AppTabListItem
  },
  props: {
    tabs: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    model: {
      get() {
        return this.tabs
      },
      set(tabs) {
        const ids = tabs.map((tab) => tab.id)
        this.sortTabs({ ids })
      }
    }
  },
  methods: {
    ...mapActions('tab', ['sortTabs'])
  }
}
</script>

<style lang="scss" scoped>
.temporary-app-tab-list .v-sheet {
  color: inherit;
  &.sortable-ghost {
    opacity: 0;
  }
}
</style>
