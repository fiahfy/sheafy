<template>
  <v-system-bar v-if="titleBar" class="title-bar" app>
    <v-spacer />
    <span>{{ title }}</span>
    <v-spacer />
  </v-system-bar>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['title']),
    ...mapGetters(['titleBar'])
  }
}
</script>

<style lang="scss" scoped>
.title-bar {
  -webkit-app-region: drag;
}
</style>
