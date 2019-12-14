<template>
  <div class="tab-pane d-flex flex-column">
    <v-toolbar tile dense flat class="flex-grow-0" height="36">
      <span class="overline user-select-none">
        tabs
      </span>
      <chip class="ml-3" :num="tabs.length" />
    </v-toolbar>
    <div ref="container" class="flex-grow-1 overflow-y-scroll scrollbar">
      <tab-list :tabs="tabs" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Ref } from 'vue-property-decorator'
import { tabStore } from '~/store'
import Chip from '~/components/Chip.vue'
import TabList from '~/components/TabList.vue'

@Component({
  components: {
    Chip,
    TabList
  }
})
export default class TabPane extends Vue {
  @Ref() readonly container!: HTMLDivElement

  get tabs() {
    return tabStore.sortedTabs
  }
}
</script>

<style lang="scss" scoped>
.tab-pane {
  > div {
    position: relative;
  }
  .theme--light & .v-toolbar {
    background-color: #fafafa;
  }
  .theme--dark & .v-toolbar {
    background-color: #303030;
  }
}
</style>
