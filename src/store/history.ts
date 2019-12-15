import nanoid from 'nanoid'
import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import HistoryItem from '~/models/history-item'

@Module({
  name: 'history',
  stateFactory: true,
  namespaced: true
})
export default class HistoryModule extends VuexModule {
  historyItems: HistoryItem[] = []

  get sortedHistoryItems() {
    return this.historyItems.slice().sort((a, b) => {
      return a.updatedAt < b.updatedAt ? 1 : -1
    })
  }

  get getHistoryItemWithUrl() {
    return ({ url }: { url: string }) =>
      this.historyItems.find((item) => item.url === url)
  }

  @Mutation
  setHistoryItems({ historyItems }: { historyItems: HistoryItem[] }) {
    this.historyItems = historyItems
  }

  @Action
  upsertHistory({ url, ...params }: Partial<HistoryItem>) {
    if (!url) {
      return
    }
    let historyItems: HistoryItem[]
    if (this.historyItems.find((item) => item.url === url)) {
      historyItems = this.historyItems.map((item) => {
        if (item.url !== url) {
          return item
        }
        return {
          ...item,
          ...params,
          url,
          updatedAt: Date.now()
        }
      })
    } else {
      const id = nanoid()
      const now = Date.now()
      historyItems = [
        ...this.historyItems,
        {
          host: '',
          title: '',
          favicon: '',
          ...params,
          url,
          id,
          createdAt: now,
          updatedAt: now
        }
      ]
    }
    this.setHistoryItems({ historyItems })
  }

  @Action
  deleteHistoryItem({ id }: { id: string }) {
    const historyItems = this.historyItems.filter((item) => item.id !== id)
    this.setHistoryItems({ historyItems })
  }

  @Action
  clearHistoryItems() {
    this.setHistoryItems({ historyItems: [] })
  }
}
