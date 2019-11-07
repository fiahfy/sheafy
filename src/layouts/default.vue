<template>
  <v-app @contextmenu.native="onContextMenu">
    <title-bar />
    <v-content class="fill-height">
      <router-view class="fill-height" />
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
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

  mounted() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        layoutStore.hideShortcutBar()
      }
    })
    this.$vuetify.theme.dark = this.darkTheme
  }

  created() {
    tabStore.newTabIfEmpty()
  }

  onContextMenu() {
    this.$contextMenu.show()
  }
}
</script>

<style lang="scss">
@import '~/assets/app.scss';
</style>
