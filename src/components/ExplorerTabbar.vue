<template>
  <v-navigation-drawer class="explorer-tabbar" permanent app clipped>
    <v-list class>
      <v-list-item
        v-for="tab in tabs"
        :key="tab.id"
        :input-value="isActiveTab(tab)"
        @click="activateTab({ id: tab.id })"
      >
        <v-list-item-action>
          <v-img :src="tab.favicon" height="24" width="24" contain />
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ tab.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item class="mt-4" @click="newTab">
        <v-list-item-action>
          <v-icon color="grey darken-1">add_circle_outline</v-icon>
        </v-list-item-action>
        <v-list-item-title class="grey--text text--darken-1"
          >New Tab</v-list-item-title
        >
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'

export default {
  computed: {
    ...mapState('tab', ['tabs']),
    ...mapGetters('tab', ['isActiveTab'])
  },
  methods: {
    isActive(tab) {
      return tab.id === this.activeTabId
    },
    ...mapMutations('tab', ['newTab', 'activateTab'])
  }
}
</script>
