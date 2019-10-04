<template>
  <div class="tab-list">
    <draggable v-model="modelTabs" animation="150">
      <v-sheet v-for="tab in modelTabs" :key="tab.id" tile>
        <tab-list-item :tab="tab" sub-group />
      </v-sheet>
    </draggable>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import TabListItem from '~/components/TabListItem'

export default {
  components: {
    TabListItem
  },
  props: {
    tabs: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    modelTabs: {
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
.tab-list .v-sheet {
  color: inherit;
  &.sortable-ghost {
    opacity: 0;
  }
}
</style>
