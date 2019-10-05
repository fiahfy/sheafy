<template>
  <v-hover v-slot:default="{ hover }" class="app-tab-list-item-icon">
    <v-list-item-action v-if="hover && !noAction" class="my-0">
      <v-btn
        icon
        small
        title="Unpin"
        :disabled="!host"
        @click.stop="unpinApp({ host })"
      >
        <v-icon small>mdi-pin-off</v-icon>
      </v-btn>
    </v-list-item-action>
    <v-list-item-icon v-else class="align-self-center">
      <v-progress-circular
        v-if="loading"
        indeterminate
        size="16"
        width="2"
        color="primary"
      />
      <template v-else>
        <v-icon v-if="error" small color="grey darken-1">mdi-earth</v-icon>
        <v-img
          v-else
          :src="url"
          height="16"
          width="16"
          contain
          @error="error = true"
        />
      </template>
    </v-list-item-icon>
  </v-hover>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  props: {
    url: {
      type: String,
      required: true
    },
    host: {
      type: String,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    noAction: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      error: false
    }
  },
  watch: {
    loading(newValue, prevValue) {
      if (newValue && !prevValue) {
        this.error = false
      }
    }
  },
  methods: {
    ...mapActions('tab', ['unpinApp'])
  }
}
</script>

<style lang="scss" scoped>
.app-tab-list-item-icon.v-list-item__icon {
  padding: 0 6px;
}
</style>
