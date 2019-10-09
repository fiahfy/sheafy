<template>
  <v-app @contextmenu.native="onContextMenu">
    <title-bar />
    <v-content class="fill-height">
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
import TitleBar from '~/components/TitleBar'
import { mapMutations } from 'vuex'

export default {
  components: {
    TitleBar
  },
  mounted() {
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 27) {
        this.setShortcutBar({ shortcutBar: false })
      }
    })
  },
  methods: {
    onContextMenu() {
      this.$contextMenu.show()
    },
    ...mapMutations('tab', ['setShortcutBar'])
  }
}
</script>

<style lang="scss">
@import '~/assets/app.scss';
</style>
