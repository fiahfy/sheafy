<template>
  <v-list-item class="download-list-item" @click="onClick">
    <v-list-item-avatar>
      <v-icon>mdi-file-outline</v-icon>
    </v-list-item-avatar>

    <v-list-item-content>
      <v-list-item-title v-text="download.filename" />
      <v-list-item-subtitle v-text="detail" />
    </v-list-item-content>

    <v-list-item-action>
      <v-btn icon>
        <v-icon color="grey lighten-1">mdi-close-circle</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import prettyBytes from 'pretty-bytes'

export default {
  props: {
    download: {
      type: Object,
      required: true
    }
  },
  computed: {
    detail() {
      if (this.download.status === 'progressing') {
        return (
          prettyBytes(this.download.receivedBytes) +
          ' of ' +
          prettyBytes(this.download.totalBytes)
        )
      }
      return prettyBytes(this.download.receivedBytes)
    }
  },
  methods: {
    onClick() {}
  }
}
</script>

<style></style>
