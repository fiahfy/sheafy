import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import DownloadItem from '~/models/download-item'

@Module({
  name: 'download',
  stateFactory: true,
  namespaced: true
})
export default class DownloadModule extends VuexModule {
  downloadItems: DownloadItem[] = []

  get getDownloadItem() {
    return ({ id }: { id: string }) => {
      return this.downloadItems.find((item) => item.id === id)
    }
  }

  get canPause() {
    return ({ id }: { id: string }): boolean => {
      return ['progressing'].includes(this.getDownloadItem({ id })!.status)
    }
  }

  get canResume() {
    return ({ id }: { id: string }): boolean => {
      return ['paused', 'interrupted'].includes(
        this.getDownloadItem({ id })!.status
      )
    }
  }

  get canCancel() {
    return ({ id }: { id: string }): boolean => {
      return ['progressing', 'paused', 'interrupted'].includes(
        this.getDownloadItem({ id })!.status
      )
    }
  }

  get canShowInFolder() {
    return ({ id }: { id: string }): boolean => {
      return ['completed'].includes(this.getDownloadItem({ id })!.status)
    }
  }

  get canRetry() {
    return ({ id }: { id: string }): boolean => {
      return ['cancelled', 'failed'].includes(
        this.getDownloadItem({ id })!.status
      )
    }
  }

  get canDelete() {
    return ({ id }: { id: string }): boolean => {
      // also clear invalid object
      return !['progressing', 'paused', 'interrupted'].includes(
        this.getDownloadItem({ id })!.status
      )
    }
  }

  @Mutation
  setDownloadItems({ downloadItems }: { downloadItems: DownloadItem[] }) {
    this.downloadItems = downloadItems
  }

  @Action
  upsertDownloadItem({ id, ...params }: Partial<DownloadItem>) {
    let downloadItems: DownloadItem[]
    if (this.downloadItems.find((item) => item.id === id)) {
      downloadItems = this.downloadItems.map((item) => {
        if (item.id !== id) {
          return item
        }
        return {
          ...item,
          ...params
        }
      })
    } else {
      downloadItems = [...this.downloadItems, <DownloadItem>{ ...params, id }]
    }
    this.setDownloadItems({ downloadItems })
  }

  @Action
  deleteDownloadItem({ id }: { id: string }) {
    const downloadItems = this.downloadItems.filter(
      (item) => item.id !== id || !this.canDelete({ id: item.id })
    )
    this.setDownloadItems({ downloadItems })
  }

  @Action
  clearDownloads() {
    const downloadItems = this.downloadItems.filter(
      (item) => !this.canDelete({ id: item.id })
    )
    this.setDownloadItems({ downloadItems })
  }
}
