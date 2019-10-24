<template>
  <div
    class="download-panel flex-column"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
  >
    <v-toolbar tile dense flat class="flex-grow-0">
      <span class="subtitle-2 text-uppercase text-truncate user-select-none">
        downloads
      </span>
    </v-toolbar>
    <div ref="container" class="flex-grow-1 overflow-y-scroll scrollbar"></div>
  </div>
</template>

<script>
export default {
  components: {},
  computed: {},
  methods: {}
}
</script>
