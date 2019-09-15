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

export default {
  components: {
    TitleBar
  },
  methods: {
    onContextMenu() {
      this.$contextMenu.show()
    }
  }
}
</script>

<style lang="scss">
@import '~/assets/app.scss';
</style>
