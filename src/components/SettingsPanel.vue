<template>
  <div class="settings-panel d-flex flex-column">
    <v-toolbar tile dense flat class="flex-grow-0">
      <span class="subtitle-2 text-uppercase text-truncate user-select-none">
        settings
      </span>
      <v-spacer />
    </v-toolbar>
    <div class="flex-grow-1 overflow-y-scroll scrollbar">
      <div class="pa-5">
        <v-checkbox v-model="darkTheme" class="mt-0" label="Dark Theme" />
        <v-select
          v-model="sideBarLocation"
          :items="sideBarLocations"
          label="Side Bar Location"
        />
        <v-checkbox
          v-if="darwin"
          v-model="swipeToNavigate"
          class="mt-0"
          label="Swipe to Navigate"
          messages="Navigate between pages using 3-finger swipe horizontally."
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      sideBarLocations: [
        { text: 'Left', value: 'left' },
        { text: 'Right', value: 'right' }
      ]
    }
  },
  computed: {
    darwin() {
      return process.platform === 'darwin'
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
    },
    swipeToNavigate: {
      get() {
        return this.$store.state.settings.swipeToNavigate
      },
      set(value) {
        this.$store.commit('settings/setSwipeToNavigate', {
          swipeToNavigate: value
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
