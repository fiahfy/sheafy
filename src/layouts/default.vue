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
import { mapActions, mapState } from 'vuex'

export default {
  components: {
    TitleBar
  },
  computed: {
    ...mapState('settings', ['darkTheme'])
  },
  mounted() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideShortcutBar()
      }
    })
    this.$vuetify.theme.dark = this.darkTheme
  },
  methods: {
    onContextMenu() {
      this.$contextMenu.show()
    },
    ...mapActions(['hideShortcutBar'])
  }
}
</script>

<style lang="scss">
@import '~/assets/app.scss';
</style>
