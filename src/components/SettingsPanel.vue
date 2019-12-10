<template>
  <div class="settings-panel d-flex flex-column">
    <v-toolbar
      tile
      dense
      flat
      color="transparent"
      class="flex-grow-0"
      height="36"
    >
      <span class="subtitle-2 text-uppercase text-truncate user-select-none">
        settings
      </span>
      <v-spacer />
    </v-toolbar>
    <div class="flex-grow-1 overflow-y-scroll scrollbar">
      <div class="pa-5">
        <v-checkbox v-model="darkTheme" class="mt-0" label="Dark Theme" />
        <v-select
          v-model="sidebarLocation"
          :items="sidebarLocations"
          label="Sidebar Location"
          dense
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

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { settingsStore } from '~/store'

@Component
export default class SettingsPanel extends Vue {
  sidebarLocations = [
    { text: 'Left', value: 'left' },
    { text: 'Right', value: 'right' }
  ]

  get darwin() {
    return process.platform === 'darwin'
  }

  get darkTheme() {
    return settingsStore.darkTheme
  }

  set darkTheme(value) {
    settingsStore.setDarkTheme({ darkTheme: value })
  }

  get sidebarLocation() {
    return settingsStore.sidebarLocation
  }

  set sidebarLocation(value) {
    settingsStore.setSidebarLocation({ sidebarLocation: value })
  }

  get swipeToNavigate() {
    return settingsStore.swipeToNavigate
  }

  set swipeToNavigate(value) {
    settingsStore.setSwipeToNavigate({ swipeToNavigate: value })
  }
}
</script>
