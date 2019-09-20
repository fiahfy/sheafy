<template>
  <v-system-bar v-if="titleBar" class="title-bar caption px-0" app height="16">
    <v-card flat tile class="spacer">
      <div>{{ title }}</div>
    </v-card>
  </v-system-bar>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['title', 'titleBar'])
  }
}
</script>

<style lang="scss" scoped>
.title-bar {
  user-select: none;
  z-index: 9999;
  -webkit-app-region: drag;
  > .v-card {
    position: relative;
    height: 16px;
    padding: 0 72px;
    min-width: 0;
    > div {
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
    }
  }
}
</style>
