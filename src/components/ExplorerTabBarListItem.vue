<template>
  <v-list-item
    class="exporer-tab-bar-list-item"
    :title="tab.title"
    :input-value="isActiveTab(tab)"
    @click="activateTab({ id: tab.id })"
  >
    <v-list-item-icon class="mr-4 px-1 align-self-center">
      <v-progress-circular
        v-if="tab.loading"
        indeterminate
        size="16"
        width="2"
        color="primary"
      />
      <template v-else>
        <v-icon v-if="error" small color="grey darken-1">mdi-earth</v-icon>
        <v-img
          v-else
          :src="tab.favicon"
          height="16"
          width="16"
          contain
          @error="error = true"
        />
      </template>
    </v-list-item-icon>
    <v-list-item-content>
      <v-list-item-title v-text="tab.title" />
    </v-list-item-content>
    <v-chip
      v-if="tab.badge"
      class="caption ml-3 px-2"
      color="error"
      v-text="badge"
    />
    <v-list-item-action class="my-0">
      <v-btn icon small @click.stop="closeTab({ id: tab.id })">
        <v-icon small>mdi-close</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

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
  computed: {
    badge() {
      return this.tab.badge > 99 ? '99+' : String(this.tab.badge)
    },
    ...mapGetters('tab', ['isActiveTab'])
  },
  watch: {
    tab(newValue, prevValue) {
      if (newValue.loading && !prevValue.loading) {
        this.error = false
      }
    }
  },
  methods: {
    ...mapActions('tab', ['closeTab', 'activateTab'])
  }
}
</script>

<style lang="scss" scoped>
.exporer-tab-bar-list-item {
  .v-chip {
    pointer-events: none;
    height: 18px;
    padding: 0 6px !important;
  }
  &:not(.v-list-item--active):not(:hover) ::v-deep .v-list-item__action {
    opacity: 0;
  }
}
</style>
