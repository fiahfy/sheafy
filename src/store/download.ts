import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import Download from '~/models/download'

@Module({
  name: 'download',
  stateFactory: true,
  namespaced: true
})
export default class DownloadModule extends VuexModule {
  downloads: Download[] = []

  get getDownload() {
    return ({ id }: { id: string }) => {
      return this.downloads.find((download) => download.id === id)
    }
  }
  get canPause() {
    return ({ id }: { id: string }): boolean => {
      return ['progressing'].includes(this.getDownload({ id })!.status)
    }
  }
  get canResume() {
    return ({ id }: { id: string }): boolean => {
      return ['paused', 'interrupted'].includes(
        this.getDownload({ id })!.status
      )
    }
  }
  get canCancel() {
    return ({ id }: { id: string }): boolean => {
      return ['progressing', 'paused', 'interrupted'].includes(
        this.getDownload({ id })!.status
      )
    }
  }
  get canShowInFolder() {
    return ({ id }: { id: string }): boolean => {
      return ['completed'].includes(this.getDownload({ id })!.status)
    }
  }
  get canRetry() {
    return ({ id }: { id: string }): boolean => {
      return ['cancelled', 'failed'].includes(this.getDownload({ id })!.status)
    }
  }
  get canDelete() {
    return ({ id }: { id: string }): boolean => {
      // also clear invalid object
      return !['progressing', 'paused', 'interrupted'].includes(
        this.getDownload({ id })!.status
      )
    }
  }

  @Mutation
  setDownloads({ downloads }: { downloads: Download[] }) {
    this.downloads = downloads
  }

  @Action
  updateDownload({ id, ...params }: Partial<Download>) {
    let downloads: Download[]
    if (this.downloads.find((download) => download.id === id)) {
      downloads = this.downloads.map((download) => {
        if (download.id !== id) {
          return download
        }
        return {
          ...download,
          ...params
        }
      })
    } else {
      downloads = [...this.downloads, { id, ...(<Download>params) }]
    }
    this.setDownloads({ downloads })
  }
  @Action
  deleteDownload({ id }: { id: string }) {
    const downloads = this.downloads.filter(
      (download) => download.id !== id || !this.canDelete({ id: download.id })
    )
    this.setDownloads({ downloads })
  }
  @Action
  clearDownloads() {
    const downloads = this.downloads.filter(
      (download) => !this.canDelete({ id: download.id })
    )
    this.setDownloads({ downloads })
  }
}
