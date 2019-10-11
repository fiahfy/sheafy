<template>
  <v-app @contextmenu.native="onContextMenu">
    <title-bar />
    <v-content class="fill-height">
      <router-view class="fill-height" />
    </v-content>
  </v-app>
</template>

<script>
import TitleBar from '~/components/TitleBar'
import { mapActions } from 'vuex'

export default {
  components: {
    TitleBar
  },
  mounted() {
    document.addEventListener('keydown', (e) => {
      if (e.keyCode === 27) {
        this.hideShortcutBar()
      }
    })
  },
  methods: {
    onContextMenu() {
      this.$contextMenu.show()
    },
    ...mapActions('tab', ['hideShortcutBar'])
  }
}
</script>

<style lang="scss">
@import '~/assets/app.scss';
</style>
