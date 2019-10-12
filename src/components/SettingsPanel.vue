<template>
  <div class="settings-panel d-flex flex-column">
    <v-toolbar tile dense flat class="flex-grow-0">
      <span class="subtitle-2 text-uppercase text-truncate user-select-none">
        settings
      </span>
      <v-spacer />
    </v-toolbar>
    <div class="flex-grow-1 overflow-y-auto">
      <div class="pa-5">
        <v-checkbox v-model="darkTheme" class="mt-0" label="Dark Theme" />
        <v-select
          v-model="sideBarLocation"
          :items="sideBarLocations"
          label="Side Bar Location"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    sideBarLocations() {
      return [
        { text: 'Left', value: 'left' },
        { text: 'Right', value: 'right' }
      ]
    },
    darkTheme: {
      get() {
        return this.$store.state.settings.darkTheme
      },
      set(value) {
        this.$store.commit('settings/setDarkTheme', { darkTheme: value })
      }
    },
    sideBarLocation: {
      get() {
        return this.$store.state.settings.sideBarLocation
      },
      set(value) {
        this.$store.commit('settings/setSideBarLocation', {
          sideBarLocation: value
        })
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
