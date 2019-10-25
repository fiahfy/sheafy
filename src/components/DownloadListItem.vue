<template>
  <v-list-item class="download-list-item" @click="onClickItem">
    <v-list-item-avatar class="my-0 mr-3">
      <v-icon v-text="icon" />
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

    <v-list-item-action class="flex-row align-center my-0">
      <v-btn
        v-if="canPause"
        icon
        small
        title="Pause"
        class="ml-2"
        @click.stop="onClickPause"
      >
        <v-icon small>mdi-pause</v-icon>
      </v-btn>
      <v-btn
        v-if="canResume"
        icon
        small
        title="Resume"
        class="ml-2"
        @click.stop="onClickResume"
      >
        <v-icon small>mdi-play</v-icon>
      </v-btn>
      <v-btn
        v-if="canCancel"
        icon
        small
        title="Cancel"
        class="ml-2"
        @click.stop="onClickCancel"
      >
        <v-icon small>mdi-cancel</v-icon>
      </v-btn>
      <v-btn
        v-if="canShowInFolder"
        icon
        small
        title="Show in Folder"
        class="ml-2"
        @click.stop="onClickShowInFolder"
      >
        <v-icon small>mdi-folder-outline</v-icon>
      </v-btn>
      <v-btn
        v-if="canRetry"
        icon
        small
        title="Retry"
        class="ml-2"
        @click.stop="onClickRetry"
      >
        <v-icon small>mdi-refresh</v-icon>
      </v-btn>
      <v-btn
        v-if="canDelete"
        icon
        small
        title="Delete"
        class="ml-2"
        @click.stop="onClickDelete"
      >
        <v-icon small>mdi-close</v-icon>
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
    icon() {
      return ['cancelled', 'failed'].includes(this.download.status)
        ? 'mdi-image-broken-variant'
        : 'mdi-file-outline'
    },
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
