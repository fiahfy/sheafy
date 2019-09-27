<template>
  <div class="explorer-tab-bar">
    <draggable v-model="groups" animation="150" handle=".draggable">
      <v-sheet
        v-for="group in groups"
        :key="group.host"
        :class="{ draggable: group.host }"
        tile
      >
        <explorer-tab-bar-list :group="group" />
      </v-sheet>
    </draggable>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import ExplorerTabBarList from '~/components/ExplorerTabBarList'

export default {
  components: {
    ExplorerTabBarList
  },
  computed: {
    groups: {
      get() {
        return this.$store.getters['tab/groups']
      },
      set(groups) {
        const hosts = groups.map((group) => group.host)
        this.sortGroups({ hosts })
      }
    }
  },
  methods: {
    ...mapActions('tab', ['sortGroups'])
  }
}
</script>

<style lang="scss" scoped>
.explorer-tab-bar .v-sheet.sortable-ghost {
  opacity: 0;
}
</style>
