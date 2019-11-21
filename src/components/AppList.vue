<template>
  <div class="app-list">
    <draggable v-model="model" animation="150" @end="onEnd">
      <v-sheet v-for="app in model" :key="app.host" tile>
        <app-list-item :app="app" />
      </v-sheet>
    </draggable>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { tabStore } from '~/store'
import App from '~/models/app'
import AppListItem from '~/components/AppListItem.vue'

@Component({
  components: {
    AppListItem
  }
})
export default class AppList extends Vue {
  @Prop({ type: Array, default: () => [] }) readonly apps!: App[]

  get model() {
    return this.apps
  }
  set model(apps) {
    const hosts = apps.map((app) => app.host)
    tabStore.sortApps({ hosts })
  }

  onEnd() {
    // Remove ripples if stop sorting
    this.$el.querySelectorAll('.v-ripple__container').forEach((el) => {
      el.remove()
    })
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
