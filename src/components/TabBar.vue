<template>
  <div class="tab-bar">
    <draggable v-model="groups" animation="150" handle=".draggable">
      <v-sheet
        v-for="group in groups"
        :key="group.host"
        :class="{ draggable: group.host }"
        tile
      >
        <tab-bar-list :group="group" />
      </v-sheet>
    </draggable>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import TabBarList from '~/components/TabBarList'

export default {
  components: {
    TabBarList
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
.tab-bar .v-sheet.sortable-ghost {
  opacity: 0;
}
</style>
