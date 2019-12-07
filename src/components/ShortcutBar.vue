<template>
  <v-autocomplete
    v-if="shortcutBar"
    ref="autocomplete"
    class="shortcut-bar body-2"
    name="shortcut"
    solo
    dense
    item-text="title"
    item-value="id"
    autofocus
    auto-select-first
    hide-details
    no-data-text="No results found"
    :items="tabs"
    :filter="filter"
    :menu-props="menuProps"
    @change="onChange"
  >
    <template v-slot:item="{ item }">
      <v-list-item-icon class="mr-3 align-self-center">
        <favicon :url="item.favicon" :loading="item.loading" />
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title
          class="font-weight-regular caption"
          v-text="item.title"
        />
      </v-list-item-content>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import { VAutocomplete } from 'vuetify/lib'
import { Vue, Component, Ref, Watch } from 'vue-property-decorator'
import { layoutStore, tabStore } from '~/store'
import Tab from '~/models/tab'
import Favicon from '~/components/Favicon.vue'

@Component({
  components: {
    Favicon
  }
})
export default class ShortcutBar extends Vue {
  @Ref() readonly autocomplete!: typeof VAutocomplete

  width = 0

  get filter() {
    return (item: Tab, queryText: string, itemText: string) => {
      return (
        itemText.toLocaleLowerCase().includes(queryText.toLocaleLowerCase()) ||
        item.host.toLocaleLowerCase().includes(queryText.toLocaleLowerCase())
      )
    }
  }

  get menuProps() {
    return {
      closeOnClick: false,
      closeOnContentClick: false,
      openOnClick: false,
      maxHeight: 480,
      offsetY: true,
      offsetOverflow: true,
      transition: false,
      maxWidth: this.width
    }
  }

  get shortcutBar() {
    return layoutStore.shortcutBar
  }

  get tabs() {
    return tabStore.recentTabs
  }

  @Watch('shortcutBar')
  onShortcutBarChanged(value: boolean) {
    if (value) {
      this.$nextTick(() => {
        this.$el.querySelector('input')!.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            layoutStore.hideShortcutBar()
          }
        })
        this.width = (this.$el as HTMLElement).offsetWidth
      })
    }
  }

  mounted() {
    this.width = (this.$el as HTMLElement).offsetWidth
    this.$eventBus.$on('focusShortcut', this.focus)
  }

  destroyed() {
    this.$eventBus.$off('focusShortcut', this.focus)
  }

  focus() {
    this.$nextTick(() => {
      const el = this.$el.querySelector('input')
      if (el) {
        el.focus()
        el.select()
      }
      ;(this.autocomplete as any).isMenuActive = true
    })
  }

  onChange(value: string) {
    tabStore.activateTab({ id: value, viewId: tabStore.activeViewId })
    layoutStore.hideShortcutBar()
  }
}
</script>

<style lang="scss" scoped>
.shortcut-bar {
  border-radius: 0;
}
::v-deep .v-list-item {
  min-height: 36px;
  .v-list-item__icon {
    height: unset;
    min-width: unset;
  }
}
</style>
