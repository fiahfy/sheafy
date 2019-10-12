<template>
  <v-navigation-drawer
    class="activity-bar"
    permanent
    app
    clipped
    mini-variant
    mini-variant-width="48"
    :right="right"
  >
    <v-list dense class="py-0 primary--text">
      <v-list-item
        v-for="item in items"
        :key="item.id"
        class="py-1"
        :title="item.title"
        :input-value="isActive(item)"
        @click="() => onClick(item)"
      >
        <v-list-item-icon>
          <v-icon v-text="item.icon" />
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title v-text="item.title" />
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

export default {
  data() {
    return {
      items: [
        { id: 'apps', title: 'Apps', icon: 'mdi-tab' },
        { id: 'settings', title: 'Settings', icon: 'mdi-settings' }
      ]
    }
  },
  computed: {
    right() {
      return this.sideBarLocation === 'right'
    },
    ...mapState(['panelId']),
    ...mapState('settings', ['sideBarLocation'])
  },
  methods: {
    isActive({ id }) {
      return id === this.panelId
    },
    onClick({ id }) {
      this.setPanelId({ panelId: id })
    },
    ...mapMutations(['setPanelId'])
  }
}
</script>

<style lang="scss" scoped>
// .activity-bar .v-list-item:last-child {
//   position: absolute;
//   bottom: 0;
//   width: 100%;
// }
</style>
