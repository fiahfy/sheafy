<template>
  <v-list-item
    class="download-list-item"
    :title="download.filename"
    @click="onClickItem"
    @contextmenu.stop="onContextMenu"
  >
    <v-list-item-avatar class="my-0 mr-3">
      <v-icon v-text="icon" />
    </v-list-item-avatar>

    <v-list-item-content>
      <v-list-item-title class="d-flex">
        <span class="text-truncate mr-3" v-text="download.filename" />
        <v-spacer />
        <span class="secondary--text" v-text="startedAt" />
      </v-list-item-title>
      <v-list-item-subtitle>
        <span class="text--primary">{{ sizeText }}</span>
        <span v-if="statusText" class="text-capitalize">
          &mdash; {{ statusText }}
        </span>
      </v-list-item-subtitle>
    </v-list-item-content>

    <v-list-item-action class="flex-row align-center my-0">
      <v-btn
        v-if="canPause({ id: download.id })"
        icon
        width="36"
        height="36"
        title="Pause"
        class="ml-1"
        @click.stop="onClickPause"
      >
        <v-icon size="20">mdi-pause</v-icon>
      </v-btn>
      <v-btn
        v-if="canResume({ id: download.id })"
        icon
        width="36"
        height="36"
        title="Resume"
        class="ml-1"
        @click.stop="onClickResume"
      >
        <v-icon size="20">mdi-play</v-icon>
      </v-btn>
      <v-btn
        v-if="canCancel({ id: download.id })"
        icon
        width="36"
        height="36"
        title="Cancel"
        class="ml-1"
        @click.stop="onClickCancel"
      >
        <v-icon size="20">mdi-cancel</v-icon>
      </v-btn>
      <v-btn
        v-if="canShowInFolder({ id: download.id })"
        icon
        width="36"
        height="36"
        title="Show in Folder"
        class="ml-1"
        @click.stop="onClickShowInFolder"
      >
        <v-icon size="20">mdi-folder-outline</v-icon>
      </v-btn>
      <v-btn
        v-if="canRetry({ id: download.id })"
        icon
        width="36"
        height="36"
        title="Retry"
        class="ml-1"
        @click.stop="onClickRetry"
      >
        <v-icon size="20">mdi-refresh</v-icon>
      </v-btn>
      <v-btn
        v-if="canDelete({ id: download.id })"
        icon
        width="36"
        height="36"
        title="Delete"
        class="ml-1"
        @click.stop="onClickDelete"
      >
        <v-icon size="20">mdi-close</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import { ipcRenderer, shell } from 'electron'
import { mapActions, mapGetters } from 'vuex'
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
      switch (this.download.status) {
        case 'progressing':
        case 'paused':
        case 'interrupted':
          return 'mdi-file-download-outline'
        case 'cancelled':
        case 'failed':
          return 'mdi-file-alert-outline'
        default:
          return 'mdi-file-outline'
      }
    },
    startedAt() {
      return new Date(this.download.startTime).toLocaleDateString()
    },
    sizeText() {
      if (
        ['progressing', 'paused', 'interrupted'].includes(this.download.status)
      ) {
        return (
          prettyBytes(this.download.receivedBytes || 0) +
          ' of ' +
          prettyBytes(this.download.totalBytes || 0)
        )
      }
      return prettyBytes(this.download.receivedBytes || 0)
    },
    statusText() {
      return ['paused', 'interrupted', 'cancelled', 'failed'].includes(
        this.download.status
      )
        ? this.download.status
        : ''
    },
    ...mapGetters('download', [
      'canPause',
      'canResume',
      'canCancel',
      'canShowInFolder',
      'canRetry',
      'canDelete'
    ])
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
    onContextMenu() {
      let template = []

      if (this.download.status === 'completed') {
        template = [
          ...template,
          {
            label: 'Open File',
            click: () => shell.openItem(this.download.filepath)
          }
        ]
      }
      if (this.canPause({ id: this.download.id })) {
        template = [
          ...template,
          {
            label: 'Pause',
            click: () => ipcRenderer.send('pauseDownload', this.download.id)
          }
        ]
      }
      if (this.canResume({ id: this.download.id })) {
        template = [
          ...template,
          {
            label: 'Resume',
            click: () => ipcRenderer.send('resumeDownload', this.download.id)
          }
        ]
      }
      if (this.canCancel({ id: this.download.id })) {
        template = [
          ...template,
          {
            label: 'Cancel',
            click: () => ipcRenderer.send('cancelDownload', this.download.id)
          }
        ]
      }
      if (this.canShowInFolder({ id: this.download.id })) {
        template = [
          ...template,
          {
            label: 'Show in Folder',
            click: () => shell.showItemInFolder(this.download.filepath)
          }
        ]
      }
      if (this.canRetry({ id: this.download.id })) {
        template = [
          ...template,
          {
            label: 'Retry',
            click: () => this.$eventBus.$emit('download', this.download.url)
          }
        ]
      }
      if (this.canDelete({ id: this.download.id })) {
        template = [
          ...template,
          { type: 'separator' },
          {
            label: 'Delete',
            click: () => this.deleteDownload({ id: this.download.id })
          }
        ]
      }

      this.$contextMenu.show(template)
    },
    ...mapActions('download', ['deleteDownload'])
  }
}
</script>

<style></style>
