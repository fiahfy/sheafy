<template>
  <v-app-bar class="explorer-toolbar" app clipped-left flat dense>
    <v-btn icon @click="goBack">
      <v-icon>arrow_back</v-icon>
    </v-btn>
    <v-btn icon @click="goForward">
      <v-icon>arrow_forward</v-icon>
    </v-btn>
    <v-btn icon @click="reload">
      <v-icon>refresh</v-icon>
    </v-btn>
    <v-text-field outlined hide-details class="ml-3" />
  </v-app-bar>
</template>

<script>
export default {
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
