<template>
  <v-container class="index" fluid pa-0 :class="{ resizing: resizing }">
    <activity-bar v-if="!fullScreen" />
    <div class="d-flex flex-grow-1 fill-height" :class="classes">
      <div class="d-flex flex-grow-1 flex-column white">
        <toolbar v-if="!fullScreen" class="flex-grow-0" />
        <div class="wrapper flex-grow-1 overflow-hidden">
          <webview v-for="tab in tabs" :key="tab.id" :tab="tab" />
          <shortcut-bar />
          <finding-bar />
          <status-bar />
        </div>
      </div>
      <sidebar v-if="!fullScreen" :resizing.sync="resizing" />
    </div>
  </v-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import ActivityBar from '~/components/ActivityBar'
import FindingBar from '~/components/FindingBar'
import ShortcutBar from '~/components/ShortcutBar'
import Sidebar from '~/components/Sidebar'
import StatusBar from '~/components/StatusBar'
import Toolbar from '~/components/Toolbar'
import Webview from '~/components/Webview'

export default {
  components: {
    ActivityBar,
    FindingBar,
    ShortcutBar,
    Sidebar,
    StatusBar,
    Toolbar,
    Webview
  },
  data() {
    return {
      resizing: false
    }
  },
  computed: {
    classes() {
      return this.sideBarLocation === 'right' ? 'flex-row' : 'flex-row-reverse'
    },
    ...mapState(['fullScreen']),
    ...mapState('settings', ['sideBarLocation']),
    ...mapState('tab', ['tabs'])
  },
  created() {
    this.newTabIfEmpty()
  },
  methods: {
    ...mapActions('tab', ['newTabIfEmpty'])
  }
}
</script>

<style lang="scss" scoped>
.index {
  &.resizing ::v-deep webview {
    pointer-events: none;
  }
  .wrapper {
    position: relative;
  }
  .finding-bar {
    position: absolute;
    top: 0;
    right: 0;
    width: 384px;
    max-width: 100%;
  }
  .shortcut-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 512px;
    max-width: 100%;
    margin: 0 auto;
    z-index: 1;
  }
  .status-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    max-width: 100%;
  }
}
</style>
