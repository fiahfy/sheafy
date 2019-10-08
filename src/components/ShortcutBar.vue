<template>
  <v-autocomplete
    class="shortcut-bar"
    solo
    dense
    :items="components"
    autofocus
    hide-details
  />
</template>

<script>
export default {
  data() {
    return {
      components: [1, 2, 3]
    }
  }
}
</script>

<style lang="scss" scoped>
.shortcut-bar {
  border-radius: 0;
}
</style>
