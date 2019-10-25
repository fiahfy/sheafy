<template>
  <v-list-item class="download-list-item" @click="onClickItem">
    <v-list-item-avatar>
      <v-icon>mdi-file-outline</v-icon>
    </v-list-item-avatar>

    <v-list-item-content>
      <v-list-item-title v-text="download.filename" />
      <v-list-item-subtitle>
        <span class="text--primary">{{ sizeText }}</span>
        <span v-if="statusText" class="text-capitalize">
          &mdash; {{ statusText }}
        </span>
      </v-list-item-subtitle>
    </v-list-item-content>

    <v-list-item-action class="flex-row align-center">
      <v-btn v-if="canPause" icon class="ml-1" @click.stop="onClickPause">
        <v-icon title="Pause">mdi-pause-circle</v-icon>
      </v-btn>
      <v-btn v-if="canResume" icon class="ml-1" @click.stop="onClickResume">
        <v-icon title="Resume">mdi-play-circle</v-icon>
      </v-btn>
      <v-btn v-if="canCancel" icon class="ml-1" @click.stop="onClickCancel">
        <v-icon title="Cancel">mdi-cancel</v-icon>
      </v-btn>
      <v-btn
        v-if="canShowInFolder"
        icon
        class="ml-1"
        @click.stop="onClickShowInFolder"
      >
        <v-icon title="Show in Folder">mdi-folder</v-icon>
      </v-btn>
      <v-btn v-if="canRetry" icon class="ml-1" @click.stop="onClickRetry">
        <v-icon title="Retry">mdi-file-download</v-icon>
      </v-btn>
      <v-btn v-if="canDelete" icon class="ml-1" @click.stop="onClickDelete">
        <v-icon title="Delete">mdi-close-circle</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import { ipcRenderer, shell } from 'electron'
import { mapActions } from 'vuex'
import prettyBytes from 'pretty-bytes'

export default {
  props: {
    download: {
      type: Object,
      required: true
    }
  },
  computed: {
    sizeText() {
      if (
        ['progressing', 'paused', 'interrupted'].includes(this.download.status)
      ) {
        return (
          prettyBytes(this.download.receivedBytes) +
          ' of ' +
          prettyBytes(this.download.totalBytes)
        )
      }
      return prettyBytes(this.download.receivedBytes)
    },
    statusText() {
      return ['paused', 'interrupted', 'cancelled', 'failed'].includes(
        this.download.status
      )
        ? this.download.status
        : ''
    },
    canPause() {
      return ['progressing'].includes(this.download.status)
    },
    canResume() {
      return ['paused', 'interrupted'].includes(this.download.status)
    },
    canCancel() {
      return ['progressing', 'paused', 'interrupted'].includes(
        this.download.status
      )
    },
    canShowInFolder() {
      return ['completed'].includes(this.download.status)
    },
    canRetry() {
      return ['cancelled', 'failed'].includes(this.download.status)
    },
    canDelete() {
      return ['completed', 'cancelled', 'failed'].includes(this.download.status)
    }
  },
  methods: {
    onClickItem() {
      if (this.download.status === 'completed') {
        shell.openItem(this.download.filepath)
      }
    },
    onClickPause() {
      ipcRenderer.send('pauseDownload', this.download.id)
    },
    onClickResume() {
      ipcRenderer.send('resumeDownload', this.download.id)
    },
    onClickCancel() {
      ipcRenderer.send('cancelDownload', this.download.id)
    },
    onClickShowInFolder() {
      shell.showItemInFolder(this.download.filepath)
    },
    onClickRetry() {
      this.$eventBus.$emit('download', this.download.url)
    },
    onClickDelete() {
      this.deleteDownload({ id: this.download.id })
    },
    ...mapActions('download', ['deleteDownload'])
  }
}
</script>

<style></style>
