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
    auto-select-first
    hide-details
    no-data-text="No results found"
    :items="tabs"
    :filter="filter"
    :menu-props="menuProps"
    @change="onChange"
  />
</template>

<script>
import { mapActions, mapState } from 'vuex'
export default {
  data() {
    return {
      width: 0
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
    menuProps() {
      console.log({
        closeOnClick: false,
        closeOnContentClick: false,
        openOnClick: false,
        maxHeight: 300,
        offsetY: true,
        offsetOverflow: true,
        transition: false,
        maxWidth: this.width
      })
      return {
        closeOnClick: false,
        closeOnContentClick: false,
        openOnClick: false,
        maxHeight: 300,
        offsetY: true,
        offsetOverflow: true,
        transition: false,
        maxWidth: this.width
      }
    },
    ...mapState(['shortcutBar']),
    ...mapState('tab', ['tabs'])
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
          this.width = this.$el.offsetWidth
        })
      }
    }
  },
  mounted() {
    this.width = this.$el.offsetWidth
  },
  methods: {
    onChange(value) {
      this.activateTab({ id: value })
      this.hideShortcutBar()
    },
    ...mapActions(['hideShortcutBar']),
    ...mapActions('tab', ['activateTab'])
  }
}
</script>

<style lang="scss" scoped>
.shortcut-bar {
  border-radius: 0;
}
</style>
