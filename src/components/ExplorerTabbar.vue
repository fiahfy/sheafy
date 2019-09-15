<template>
  <v-navigation-drawer class="explorer-tabbar" permanent app clipped>
    <v-list dense>
      <v-list-item-group v-model="active">
        <explorer-tabbar-item v-for="tab in tabs" :key="tab.id" :tab="tab" />
      </v-list-item-group>
      <v-list-item class="mt-4" @click="newTab">
        <v-list-item-icon class="mr-4 px-1 align-self-center">
          <v-icon small color="grey darken-1">add_circle_outline</v-icon>
        </v-list-item-icon>
        <v-list-item-title class="grey--text text--darken-1"
          >New Tab</v-list-item-title
        >
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import ExplorerTabbarItem from '~/components/ExplorerTabbarItem'

export default {
  components: {
    ExplorerTabbarItem
  },
  computed: {
    active: {
      get() {
        return this.activeTabId
      },
      set(value) {
        this.activateTab({ id: value })
      }
    },
    ...mapState('tab', ['tabs', 'activeTabId'])
  },
  methods: {
    ...mapActions('tab', ['newTab', 'activateTab'])
  }
}
</script>
