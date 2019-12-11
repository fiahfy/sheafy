<template>
  <div class="app-list">
    <draggable v-model="model" animation="150">
      <app-list-item v-for="app in model" :key="app.host" :app="app" />
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

  set model(value) {
    const hosts = value.map((app) => app.host)
    tabStore.sortApps({ hosts })
  }
}
</script>

<style lang="scss" scoped>
.app-list {
  .app-list-item.sortable-ghost {
    opacity: 0;
  }
}
</style>
