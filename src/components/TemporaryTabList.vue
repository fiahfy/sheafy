<template>
  <v-list class="temporary-tab-list primary--text" dense>
    <v-subheader class="text-uppercase" v-text="'Temporary Tabs'" />
    <draggable v-if="modelTabs.length" v-model="modelTabs" animation="150">
      <v-sheet v-for="tab in modelTabs" :key="tab.id" tile>
        <tab-list-item :tab="tab" temporary />
      </v-sheet>
    </draggable>
    <div
      v-else
      class="d-flex justify-center caption py-3 grey--text text--darken-1"
    >
      <div>No Temporary Tabs</div>
    </div>
  </v-list>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import TabListItem from '~/components/TabListItem'

export default {
  components: {
    TabListItem
  },
  computed: {
    modelTabs: {
      get() {
        return this.temporaryTabs
      },
      set(tabs) {
        const ids = tabs.map((tab) => tab.id)
        this.sortTabs({ ids })
      }
    },
    ...mapGetters('tab', ['temporaryTabs'])
  },
  methods: {
    ...mapActions('tab', ['sortTabs'])
  }
}
</script>

<style lang="scss" scoped>
.temporary-tab-list .v-sheet {
  color: inherit;
  &.sortable-ghost {
    opacity: 0;
  }
}
</style>
