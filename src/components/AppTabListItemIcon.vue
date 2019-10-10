<template>
  <v-list-item-icon class="app-tab-list-item-icon align-self-center">
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
</template>

<script>
export default {
  props: {
    url: {
      type: String,
      required: true
    },
    loading: {
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
  }
}
</script>

<style lang="scss" scoped>
.app-tab-list-item-icon.v-list-item__icon {
  padding: 0 6px;
}
</style>
