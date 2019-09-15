<template>
  <v-app-bar
    class="explorer-toolbar"
    app
    clipped-left
    flat
    dense
    extension-height="1"
  >
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
    <v-text-field
      v-model="query"
      outlined
      hide-details
      class="ml-2"
      name="query"
      @focus="onFocus"
      @keydown.enter="onKeydownEnter"
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
        return this.activeTab.query
      },
      set(value) {
        this.updateTab({ id: this.activeTab.id, query: value })
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
    onFocus(e) {
      e.target.select()
    },
    onKeydownEnter(e) {
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
  }
}
</style>
