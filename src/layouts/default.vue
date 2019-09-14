<template>
  <v-app
    @contextmenu.native="onContextMenu"
    @drop.native.prevent="onDrop"
    @dragover.native.prevent
  >
    <title-bar />
    <v-content class="fill-height">
      <router-view />
    </v-content>
  </v-app>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import TitleBar from '~/components/TitleBar'

export default {
  components: {
    TitleBar
  },
  computed: {
    ...mapState('settings', ['darkTheme'])
  },
  created() {},
  methods: {
    onContextMenu() {
      this.$contextMenu.show()
    },
    onDrop(e) {
      const files = Array.from(e.dataTransfer.files)
      if (!files.length) {
        return
      }
      const filepath = files[0].path
      this.open({ filepath })
    },
    ...mapActions(['open'])
  }
}
</script>

<style lang="scss">
@import '~/assets/app.scss';
</style>
