<template>
  <v-autocomplete
    v-if="shortcutBar"
    class="shortcut-bar body-2"
    name="shortcut"
    solo
    dense
    item-text="title"
    item-value="id"
    autofocus
    hide-details
    no-data-text="No results found"
    :items="tabs"
    :filter="filter"
    @change="onChange"
  />
</template>

<script>
import { mapActions, mapState } from 'vuex'
export default {
  data() {
    return {
      selected: null
    }
  },
  computed: {
    filter() {
      return (item, queryText, itemText) => {
        return (
          itemText
            .toLocaleLowerCase()
            .includes(queryText.toLocaleLowerCase()) ||
          item.host.toLocaleLowerCase().includes(queryText.toLocaleLowerCase())
        )
      }
    },
    ...mapState('tab', ['tabs', 'shortcutBar'])
  },
  watch: {
    shortcutBar(value) {
      if (value) {
        this.$nextTick(() => {
          this.$el.querySelector('input').addEventListener('keydown', (e) => {
            if (e.keyCode === 27) {
              this.hideShortcutBar()
            }
          })
        })
      }
    }
  },
  methods: {
    onChange(value) {
      this.activateTab({ id: value })
      this.hideShortcutBar()
    },
    ...mapActions('tab', ['activateTab', 'hideShortcutBar'])
  }
}
</script>

<style lang="scss" scoped>
.shortcut-bar {
  border-radius: 0;
}
</style>
