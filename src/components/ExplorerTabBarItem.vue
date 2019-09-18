<template>
  <v-list-item class="exporer-tab-bar-item" :value="tab.id" :title="tab.title">
    <v-list-item-icon class="mr-4 px-1 align-self-center">
      <v-progress-circular
        v-if="tab.loading"
        indeterminate
        size="16"
        width="2"
        color="primary"
      />
      <template v-else>
        <v-icon v-if="error" small color="grey darken-1">public</v-icon>
        <v-img
          v-else
          :src="tab.favicon"
          height="16"
          width="16"
          contain
          @error="onError"
        />
      </template>
    </v-list-item-icon>
    <v-list-item-content>
      <v-list-item-title>{{ tab.title }}</v-list-item-title>
    </v-list-item-content>
    <v-list-item-action class="my-0">
      <v-btn icon small @click="closeTab({ id: tab.id })">
        <v-icon small>close</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  props: {
    tab: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      error: false
    }
  },
  watch: {
    tab(newValue, prevValue) {
      if (newValue.loading && !prevValue.loading) {
        this.error = false
      }
    }
  },
  methods: {
    onError() {
      this.error = true
    },
    ...mapActions('tab', ['closeTab'])
  }
}
</script>

<style lang="scss" scoped>
.exporer-tab-bar-item:not(:hover) ::v-deep .v-list-item__action {
  display: none;
}
</style>
