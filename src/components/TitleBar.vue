<template>
  <v-system-bar
    v-if="titleBar"
    class="title-bar caption"
    app
    color="white"
    height="16"
  >
    <div>
      <span>{{ title }}</span>
    </div>
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
  padding: 0 72px;
  user-select: none;
  z-index: 9999;
  -webkit-app-region: drag;
  > div {
    position: relative;
    height: 16px;
    width: 100%;
    text-align: center;
    > span {
      position: absolute;
      top: 2px;
      left: 0;
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
