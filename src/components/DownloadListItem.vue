<template>
  <v-list-item
    class="download-list-item"
    :title="item.filename"
    @click="onClickItem"
    @contextmenu.stop="onContextMenu"
  >
    <v-list-item-avatar class="my-0 mr-3">
      <v-icon v-text="icon" />
    </v-list-item-avatar>

    <v-list-item-content>
      <v-list-item-title class="d-flex">
        <span class="text-truncate mr-3" v-text="item.filename" />
        <v-spacer />
        <span class="secondary--text" v-text="startedAt" />
      </v-list-item-title>
      <v-list-item-subtitle>
        <span class="text--primary" v-text="sizeText" />
        <span v-if="statusText" class="text-capitalize">
          — {{ statusText }}
        </span>
      </v-list-item-subtitle>
    </v-list-item-content>

    <v-list-item-action class="flex-row align-center my-0">
      <v-btn
        v-if="canPause"
        icon
        width="32"
        height="32"
        title="Pause"
        class="ml-1"
        @click.stop="onClickPause"
      >
        <v-icon size="20">mdi-pause</v-icon>
      </v-btn>
      <v-btn
        v-if="canResume"
        icon
        width="32"
        height="32"
        title="Resume"
        class="ml-1"
        @click.stop="onClickResume"
      >
        <v-icon size="20">mdi-play</v-icon>
      </v-btn>
      <v-btn
        v-if="canCancel"
        icon
        width="32"
        height="32"
        title="Cancel"
        class="ml-1"
        @click.stop="onClickCancel"
      >
        <v-icon size="20">mdi-cancel</v-icon>
      </v-btn>
      <v-btn
        v-if="canShowInFolder"
        icon
        width="32"
        height="32"
        title="Show in Folder"
        class="ml-1"
        @click.stop="onClickShowInFolder"
      >
        <v-icon size="20">mdi-folder-outline</v-icon>
      </v-btn>
      <v-btn
        v-if="canRetry"
        icon
        width="32"
        height="32"
        title="Retry"
        class="ml-1"
        @click.stop="onClickRetry"
      >
        <v-icon size="20">mdi-refresh</v-icon>
      </v-btn>
      <v-btn
        v-if="canDelete"
        icon
        width="32"
        height="32"
        title="Delete"
        class="ml-1"
        @click.stop="onClickDelete"
      >
        <v-icon size="20">mdi-close</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { ipcRenderer, shell, MenuItemConstructorOptions } from 'electron'
import prettyBytes from 'pretty-bytes'
import { downloadStore, tabStore } from '~/store'
import DownloadItem from '~/models/download-item'

@Component
export default class DownloadListItem extends Vue {
  @Prop({ type: Object, required: true }) readonly item!: DownloadItem

  get icon() {
    switch (this.item.status) {
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
  }

  get startedAt() {
    return new Date(this.item.startTime).toLocaleDateString()
  }

  get sizeText() {
    if (['progressing', 'paused', 'interrupted'].includes(this.item.status)) {
      return (
        prettyBytes(this.item.receivedBytes ?? 0) +
        ' of ' +
        prettyBytes(this.item.totalBytes ?? 0)
      )
    }
    return prettyBytes(this.item.receivedBytes ?? 0)
  }

  get statusText() {
    return ['paused', 'interrupted', 'cancelled', 'failed'].includes(
      this.item.status
    )
      ? this.item.status
      : ''
  }

  get canPause() {
    return downloadStore.canPause({ id: this.item.id })
  }

  get canResume() {
    return downloadStore.canResume({ id: this.item.id })
  }

  get canCancel() {
    return downloadStore.canCancel({ id: this.item.id })
  }

  get canShowInFolder() {
    return downloadStore.canShowInFolder({ id: this.item.id })
  }

  get canRetry() {
    return downloadStore.canRetry({ id: this.item.id })
  }

  get canDelete() {
    return downloadStore.canDelete({ id: this.item.id })
  }

  onClickItem() {
    if (this.item.status === 'completed') {
      shell.openItem(this.item.filepath)
    }
  }

  onClickPause() {
    ipcRenderer.send('pauseDownload', this.item.id)
  }

  onClickResume() {
    ipcRenderer.send('resumeDownload', this.item.id)
  }

  onClickCancel() {
    ipcRenderer.send('cancelDownload', this.item.id)
  }

  onClickShowInFolder() {
    shell.showItemInFolder(this.item.filepath)
  }

  onClickRetry() {
    this.$eventBus.$emit('download', {
      viewId: tabStore.activeViewId,
      url: this.item.url
    })
  }

  onClickDelete() {
    downloadStore.deleteDownloadItem({ id: this.item.id })
  }

  onContextMenu() {
    let template: MenuItemConstructorOptions[] = []

    if (this.item.status === 'completed') {
      template = [
        ...template,
        {
          label: 'Open File',
          click: () => shell.openItem(this.item.filepath)
        }
      ]
    }
    if (downloadStore.canPause({ id: this.item.id })) {
      template = [
        ...template,
        {
          label: 'Pause',
          click: () => ipcRenderer.send('pauseDownload', this.item.id)
        }
      ]
    }
    if (downloadStore.canResume({ id: this.item.id })) {
      template = [
        ...template,
        {
          label: 'Resume',
          click: () => ipcRenderer.send('resumeDownload', this.item.id)
        }
      ]
    }
    if (downloadStore.canCancel({ id: this.item.id })) {
      template = [
        ...template,
        {
          label: 'Cancel',
          click: () => ipcRenderer.send('cancelDownload', this.item.id)
        }
      ]
    }
    if (downloadStore.canShowInFolder({ id: this.item.id })) {
      template = [
        ...template,
        {
          label: 'Show in Folder',
          click: () => shell.showItemInFolder(this.item.filepath)
        }
      ]
    }
    if (downloadStore.canRetry({ id: this.item.id })) {
      template = [
        ...template,
        {
          label: 'Retry',
          click: () =>
            this.$eventBus.$emit('download', {
              viewId: tabStore.activeViewId,
              url: this.item.url
            })
        }
      ]
    }
    if (downloadStore.canDelete({ id: this.item.id })) {
      template = [
        ...template,
        { type: 'separator' },
        {
          label: 'Delete',
          click: () => downloadStore.deleteDownloadItem({ id: this.item.id })
        }
      ]
    }

    this.$contextMenu.open(template, { vuetify: true })
  }
}
</script>

<style lang="scss" scoped>
.download-list-item {
  &:hover ::v-deep .v-list-item__title > .secondary--text {
    display: none;
  }
  &:not(:hover) ::v-deep .v-list-item__action {
    display: none;
  }
  .theme--light & {
    background: #eeeeee;
  }
  .theme--dark & {
    background: #212121;
  }
}
</style>
