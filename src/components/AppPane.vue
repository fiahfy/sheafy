<template>
  <div class="app-pane d-flex flex-column">
    <v-toolbar tile dense flat class="flex-grow-0" height="36">
      <span class="overline user-select-none">
        apps
      </span>
      <chip class="ml-3" :num="apps.length" />
      <v-spacer />
      <v-btn icon small title="Expand Apps" class="ml-1" @click="onClickExpand">
        <v-icon small>mdi-expand-all</v-icon>
      </v-btn>
      <v-btn
        icon
        small
        title="Collapse Apps"
        class="ml-1 mr-0"
        @click="onClickCollapse"
      >
        <v-icon small>mdi-collapse-all</v-icon>
      </v-btn>
    </v-toolbar>
    <div ref="container" class="flex-grow-1 overflow-y-scroll scrollbar">
      <app-list :apps="apps" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Ref } from 'vue-property-decorator'
import { tabStore } from '~/store'
import AppList from '~/components/AppList.vue'
import Chip from '~/components/Chip.vue'

@Component({
  components: {
    AppList,
    Chip
  }
})
export default class AppPane extends Vue {
  @Ref() readonly container!: HTMLDivElement

  get apps() {
    return tabStore.sortedApps
  }

  onClickExpand() {
    this.$eventBus.$emit('expandApps')
  }

  onClickCollapse() {
    this.$eventBus.$emit('collapseApps')
  }
}
</script>

<style lang="scss" scoped>
.app-pane {
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
