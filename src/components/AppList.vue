<template>
  <div class="app-list py-1">
    <draggable
      v-if="modelApps.length"
      v-model="modelApps"
      animation="150"
      handle=".draggable"
    >
      <v-sheet
        v-for="app in modelApps"
        :key="app.host"
        :class="{ draggable: app.host }"
        tile
      >
        <app-list-item :app="app" />
      </v-sheet>
    </draggable>
    <div
      v-else
      class="d-flex justify-center caption py-3 grey--text text--darken-1"
    >
      <div>No Apps</div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import AppListItem from '~/components/AppListItem'

export default {
  components: {
    AppListItem
  },
  computed: {
    modelApps: {
      get() {
        return this.apps
      },
      set(apps) {
        const hosts = apps.map((app) => app.host)
        this.sortApps({ hosts })
      }
    },
    ...mapGetters('tab', ['apps'])
  },
  methods: {
    ...mapActions('tab', ['sortApps'])
  }
}
</script>

<style lang="scss" scoped>
.app-list .v-sheet {
  color: inherit;
  &.sortable-ghost {
    opacity: 0;
  }
}
</style>
