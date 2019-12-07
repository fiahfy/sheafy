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

  mounted() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        layoutStore.hideShortcutBar()
      }
    })
    this.$vuetify.theme.dark = this.darkTheme
  }

  @Watch('darkTheme')
  onDarkThemeChanged(value: boolean) {
    this.$vuetify.theme.dark = value
  }

  created() {
    ;(window as any).onNuxtReady(() => {
      tabStore.newTabIfEmpty()
    })
  }

  onContextMenu() {
    this.$contextMenu.show()
  }
}
</script>

<style lang="scss">
@import '~/assets/app.scss';
</style>
