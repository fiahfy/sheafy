<template>
  <v-menu
    v-model="active"
    class="context-menu"
    light
    :position-x="x"
    :position-y="y"
    max-width="512"
    absolute
    :transition="false"
  >
    <v-list dense class="py-1">
      <template v-for="(item, index) in items">
        <v-divider v-if="item.type === 'separator'" :key="index" class="my-1" />
        <v-list-item
          v-else
          :key="index"
          @click="() => onClickItem(item)"
          @mousedown="() => onMouseDownItem()"
          @mouseup="() => onMouseUpItem(item)"
        >
          <v-list-item-icon
            v-if="item.icon"
            class="my-2 mr-2 align-self-center"
          >
            <favicon :url="item.icon" />
          </v-list-item-icon>
          <v-list-item-content class="py-2">
            <v-list-item-title
              class="font-weight-regular caption"
              v-text="item.label"
            />
          </v-list-item-content>
        </v-list-item>
      </template>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { MenuItemConstructorOptions } from 'electron'
import Favicon from '~/components/Favicon.vue'

@Component({
  components: {
    Favicon
  }
})
export default class ContextMenu extends Vue {
  active = false
  x = 0
  y = 0
  items: MenuItemConstructorOptions[] = []
  clicking = false

  mounted() {
    document.addEventListener('click', this.onClick)
    document.addEventListener('contextmenu', this.onContextMenu)
    this.$eventBus.$on('openContextMenu', this.open)
    this.$eventBus.$on('closeContextMenu', this.close)
  }

  destroyed() {
    document.removeEventListener('click', this.onClick)
    document.removeEventListener('contextmenu', this.onContextMenu)
    this.$eventBus.$off('openContextMenu', this.open)
    this.$eventBus.$off('closeContextMenu', this.close)
  }

  open({
    template,
    options: { x, y }
  }: {
    template: MenuItemConstructorOptions[]
    options: { x: number; y: number }
  }) {
    const e = window.event
    if (e instanceof MouseEvent) {
      this.x = e.clientX
      this.y = e.clientY
    } else {
      this.x = x
      this.y = y
    }
    this.items = template
    this.active = true
  }

  close() {
    this.active = false
  }

  onClick() {
    this.active = false
  }

  onContextMenu() {
    this.$contextMenu.open()
  }

  onClickItem(item: any) {
    item.click && item.click()
    this.active = false
  }

  onMouseDownItem() {
    this.clicking = true
  }

  onMouseUpItem(item: any) {
    if (!this.clicking) {
      item.click && item.click()
      this.active = false
    }
    this.clicking = false
  }
}
</script>

<style lang="scss" scoped>
::v-deep .v-list-item {
  min-height: unset;
  > .v-list-item__icon {
    height: unset;
    min-width: unset;
  }
}
</style>
