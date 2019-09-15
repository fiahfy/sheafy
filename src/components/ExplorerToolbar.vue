<template>
  <v-app-bar class="explorer-toolbar" app clipped-left flat dense>
    <v-btn
      icon
      width="36"
      height="36"
      class="mr-1"
      :disabled="!activeTab.canGoBack"
      @click="goBack"
    >
      <v-icon>arrow_back</v-icon>
    </v-btn>
    <v-btn
      icon
      width="36"
      height="36"
      class="mr-1"
      :disabled="!activeTab.canGoForward"
      @click="goForward"
    >
      <v-icon>arrow_forward</v-icon>
    </v-btn>
    <v-btn
      v-if="activeTab.loading"
      icon
      width="36"
      height="36"
      class="mr-1"
      @click="reload"
    >
      <v-icon>close</v-icon>
    </v-btn>
    <v-btn v-else icon width="36" height="36" class="mr-1" @click="reload">
      <v-icon>refresh</v-icon>
    </v-btn>
    <v-text-field outlined hide-details class="ml-2" />
  </v-app-bar>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('tab', ['activeTab'])
  },
  methods: {
    goBack() {
      this.$root.$emit('goBack')
    },
    goForward() {
      this.$root.$emit('goForward')
    },
    reload() {
      this.$root.$emit('reload')
    }
  }
}
</script>

<style lang="scss" scoped>
.explorer-toolbar
  ::v-deep
  .v-text-field--outlined
  > .v-input__control
  > .v-input__slot {
  min-height: unset;
}
</style>
