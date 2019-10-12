<template>
  <v-chip class="badge caption px-2" :color="color" v-text="num" />
</template>

<script>
export default {
  props: {
    color: {
      type: String,
      default: null
    },
    num: {
      type: [String, Number],
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.v-chip {
  pointer-events: none;
  height: 18px;
  padding: 0 6px !important;
}
</style>
