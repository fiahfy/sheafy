<template>
  <v-app :class="classes" @contextmenu.native="onContextMenu">
    <title-bar />
    <v-content class="fill-height">
      <router-view class="fill-height" />
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { layoutStore, settingsStore, tabStore } from '~/store'
import TitleBar from '~/components/TitleBar.vue'

@Component({
  components: {
    TitleBar
  }
})
export default class Layout extends Vue {
  get darkTheme() {
    return settingsStore.darkTheme
  }

  get classes() {
    return {
      resizing: layoutStore.resizing
    }
  }

  created() {
    this.$vuetify.theme.dark = this.darkTheme
    ;(window as any).onNuxtReady(() => {
      tabStore.newTabIfEmpty()
    })
  }

  mounted() {
    document.addEventListener('keydown', this.onKeyDown)
  }

  destroyed() {
    document.removeEventListener('keydown', this.onKeyDown)
  }

  @Watch('darkTheme')
  onDarkThemeChanged(value: boolean) {
    this.$vuetify.theme.dark = value
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      layoutStore.hideShortcutBar()
    }
  }

  onContextMenu() {
    this.$contextMenu.open()
  }
}
</script>

<style lang="scss">
@import '~/assets/app.scss';
</style>
