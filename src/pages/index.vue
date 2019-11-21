<template>
  <v-container class="index" fluid pa-0>
    <activity-bar v-if="!fullScreen" />
    <div
      class="d-flex flex-grow-1 overflow-hidden fill-height"
      :class="classes"
    >
      <tab class="flex-grow-1 overflow-hidden" />
      <sidebar v-if="!fullScreen" />
    </div>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { layoutStore, settingsStore } from '~/store'
import ActivityBar from '~/components/ActivityBar.vue'
import Sidebar from '~/components/Sidebar.vue'
import Tab from '~/components/Tab.vue'

@Component({
  components: {
    ActivityBar,
    Sidebar,
    Tab
  }
})
export default class Index extends Vue {
  get classes() {
    return settingsStore.sideBarLocation === 'right'
      ? 'flex-row'
      : 'flex-row-reverse'
  }
  get fullScreen() {
    return layoutStore.fullScreen
  }
}
</script>
