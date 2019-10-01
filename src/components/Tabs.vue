<template>
  <div class="tabs">
    <draggable v-model="groups" animation="150" handle=".draggable">
      <v-sheet
        v-for="group in groups"
        :key="group.host"
        :class="{ draggable: group.host }"
        tile
      >
        <tab-list :group="group" />
      </v-sheet>
    </draggable>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import TabList from '~/components/TabList'

export default {
  components: {
    TabList
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
.tabs .v-sheet.sortable-ghost {
  opacity: 0;
}
</style>
