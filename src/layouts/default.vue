<template>
  <v-app :class="classes">
    <title-bar />
    <v-content class="fill-height">
      <router-view class="fill-height" />
    </v-content>
    <context-menu />
  </v-app>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { layoutStore, settingsStore, tabStore } from '~/store'
import ContextMenu from '~/components/ContextMenu.vue'
import TitleBar from '~/components/TitleBar.vue'

@Component({
  components: {
    ContextMenu,
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
}
</script>

<style lang="scss">
@import '~/assets/app.scss';
</style>
