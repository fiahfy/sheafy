<template>
  <div class="settings-panel d-flex flex-column">
    <v-toolbar tile dense flat class="flex-grow-0">
      <span class="subtitle-2 text-uppercase text-truncate user-select-none">
        settings
      </span>
      <v-spacer />
    </v-toolbar>
    <div ref="container" class="flex-grow-1 overflow-y-auto">
      <div class="pa-5">
        <v-checkbox v-model="darkTheme" class="mt-0" label="Dark Theme" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    darkTheme: {
      get() {
        return this.$store.state.settings.darkTheme
      },
      set(value) {
        this.$store.commit('settings/setDarkTheme', { darkTheme: value })
      }
    }
  },
  watch: {
    darkTheme(value) {
      this.$vuetify.theme.dark = value
    }
  }
}
</script>
