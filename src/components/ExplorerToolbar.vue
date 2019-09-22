<template>
  <v-app-bar
    class="explorer-toolbar"
    app
    clipped-left
    flat
    dense
    height="44"
    extension-height="1"
  >
    <v-btn
      icon
      width="36"
      height="36"
      class="mr-1"
      title="Go Back"
      :disabled="!activeTab || !activeTab.canGoBack"
      @click="goBack"
    >
      <v-icon size="20">mdi-arrow-left</v-icon>
    </v-btn>
    <v-btn
      icon
      width="36"
      height="36"
      class="mr-1"
      title="Go Forward"
      :disabled="!activeTab || !activeTab.canGoForward"
      @click="goForward"
    >
      <v-icon size="20">mdi-arrow-right</v-icon>
    </v-btn>
    <v-btn
      v-if="activeTab && activeTab.loading"
      icon
      width="36"
      height="36"
      class="mr-1"
      title="Stop"
      @click="stop"
    >
      <v-icon size="20">mdi-close</v-icon>
    </v-btn>
    <v-btn
      v-else
      icon
      width="36"
      height="36"
      class="mr-1"
      title="Reload"
      @click="reload"
    >
      <v-icon size="20">mdi-refresh</v-icon>
    </v-btn>
    <v-text-field
      v-model="query"
      outlined
      hide-details
      class="ml-1 body-2"
      name="query"
      @focus="onFocus"
      @keydown.enter="onKeyDownEnter"
    />
    <v-divider slot="extension" />
  </v-app-bar>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    query: {
      get() {
        return this.activeTab && this.activeTab.query
      },
      set(value) {
        if (this.activeTab) {
          this.updateTab({ id: this.activeTab.id, query: value })
        }
      }
    },
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
    },
    stop() {
      this.$root.$emit('stop')
    },
    onFocus(e) {
      e.target.select()
    },
    onKeyDownEnter(e) {
      e.target.blur()
      this.$root.$emit('load')
    },
    ...mapActions('tab', ['updateTab'])
  }
}
</script>

<style lang="scss" scoped>
.explorer-toolbar ::v-deep {
  .v-toolbar__extension {
    padding: 0;
  }
  .v-text-field--outlined > .v-input__control > .v-input__slot {
    min-height: unset;
    > .v-text-field__slot > input {
      padding: 4px 0;
    }
  }
}
</style>
