<template>
  <v-container class="index" fluid pa-0>
    <activity-bar v-if="!fullScreen" />
    <div
      class="d-flex flex-grow-1 overflow-hidden fill-height"
      :class="classes"
    >
      <tab-content class="flex-grow-1 overflow-hidden" />
      <sidebar v-if="!fullScreen" />
      <shortcut-bar />
    </div>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { layoutStore, settingsStore } from '~/store'
import ActivityBar from '~/components/ActivityBar.vue'
import ShortcutBar from '~/components/ShortcutBar.vue'
import Sidebar from '~/components/Sidebar.vue'
import TabContent from '~/components/TabContent.vue'

@Component({
  components: {
    ActivityBar,
    ShortcutBar,
    Sidebar,
    TabContent
  }
})
export default class Index extends Vue {
  get classes() {
    return settingsStore.sidebarLocation === 'right'
      ? 'flex-row'
      : 'flex-row-reverse'
  }
  get fullScreen() {
    return layoutStore.fullScreen
  }
}
</script>
<style lang="scss" scoped>
.index > div {
  position: relative;
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
}
</style>
