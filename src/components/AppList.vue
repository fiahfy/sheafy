<template>
  <div class="app-list">
    <draggable v-model="model" animation="150">
      <v-sheet v-for="app in model" :key="app.host" tile>
        <app-tab-list :app="app" />
      </v-sheet>
    </draggable>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import AppTabList from '~/components/AppTabList'

export default {
  components: {
    AppTabList
  },
  props: {
    apps: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    model: {
      get() {
        return this.apps
      },
      set(apps) {
        const hosts = apps.map((app) => app.host)
        this.sortApps({ hosts })
      }
    }
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
