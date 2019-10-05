<template>
  <div
    class="temporary-app-content d-flex flex-column"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
  >
    <v-toolbar tile dense flat class="flex-grow-0">
      <span class="subtitle-2 text-uppercase">temporary apps</span>
      <v-spacer />
      <v-btn icon width="36" height="36" title="New Tab" @click="newTab">
        <v-icon size="20">mdi-tab-plus</v-icon>
      </v-btn>
      <v-dialog v-model="dialog" max-width="450">
        <template v-slot:activator="{ on }">
          <v-btn icon width="36" height="36" title="Close All" v-on="on">
            <v-icon size="20">mdi-tab-remove</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-title class="headline" v-text="'Close all temporary apps?'" />
          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn text @click="onClickCancel">Cancel</v-btn>
            <v-btn color="error" text @click="onClickClose">Close All</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-toolbar>
    <div ref="container" class="flex-grow-1 overflow-y-auto">
      <temporary-app-tab-list
        v-if="temporaryTabs.length"
        :tabs="temporaryTabs"
      />
      <div
        v-else
        class="d-flex justify-center caption py-3 grey--text text--darken-1"
      >
        <div>No Temporary Apps</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import TemporaryAppTabList from '~/components/TemporaryAppTabList'

export default {
  components: {
    TemporaryAppTabList
  },
  data() {
    return {
      dialog: false
    }
  },
  computed: {
    ...mapGetters('tab', ['activeTab', 'temporaryTabs'])
  },
  watch: {
    activeTab(oldValue, newValue) {
      if (oldValue.id === newValue.id && oldValue.host === newValue.host) {
        return
      }
      this.$nextTick(() => {
        const tab = this.$el.querySelector('.tab-list-item.v-list-item--active')
        if (!tab) {
          return
        }
        if (this.$refs.container.scrollTop > tab.offsetTop) {
          this.$refs.container.scrollTop = tab.offsetTop
        }
        if (
          this.$refs.container.scrollTop + this.$refs.container.offsetHeight <
          tab.offsetTop + tab.offsetHeight
        ) {
          this.$refs.container.scrollTop =
            tab.offsetTop + tab.offsetHeight - this.$refs.container.offsetHeight
        }
      })
    }
  },
  methods: {
    onDragOver(e) {
      e.dataTransfer.dropEffect = 'link'
    },
    onDrop(e) {
      const effectAllowed = e.dataTransfer.effectAllowed
      // Prevent for sorting tabs
      if (effectAllowed === 'move') {
        return
      }
      const url = e.dataTransfer.getData('text')
      if (url) {
        this.newTab({ url })
      }
    },
    onClickCancel() {
      this.dialog = false
    },
    onClickClose() {
      this.closeTemporaryTabs()
      this.dialog = false
    },
    ...mapActions('tab', ['newTab', 'closeTemporaryTabs'])
  }
}
</script>

<style>
.temporary-app-content > div {
  position: relative;
  flex-basis: 0;
}
</style>
