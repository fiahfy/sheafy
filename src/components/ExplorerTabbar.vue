<template>
  <v-navigation-drawer class="explorer-tabbar" permanent app clipped>
    <v-list dense>
      <v-list-item-group v-model="active">
        <v-list-item
          v-for="tab in tabs"
          :key="tab.id"
          :value="tab.id"
          :title="tab.title"
          transition="slide-y-transition"
        >
          <v-list-item-icon class="mr-4 px-1 align-self-center">
            <v-progress-circular
              v-if="tab.loading"
              indeterminate
              size="16"
              width="2"
              color="primary"
            />
            <v-img v-else :src="tab.favicon" height="16" width="16" contain />
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ tab.title }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action class="my-0">
            <v-btn icon small @click="closeTab({ id: tab.id })">
              <v-icon small>close</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
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
import { mapMutations, mapState } from 'vuex'

export default {
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
    ...mapMutations('tab', ['newTab', 'activateTab', 'closeTab'])
  }
}
</script>

<style lang="scss" scoped>
.explorer-tabbar .v-list-item:not(:hover) ::v-deep .v-list-item__action {
  display: none;
}
</style>
