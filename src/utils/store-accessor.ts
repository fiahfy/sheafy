import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import root from '~/store/layout'
import settings from '~/store/settings'
import download from '~/store/download'
import tab from '~/store/tab'

/* eslint-disable import/no-mutable-exports */
let layoutStore: root
let settingsStore: settings
let downloadStore: download
let tabStore: tab
/* eslint-enable import/no-mutable-exports */

function initializeStores(store: Store<any>): void {
  layoutStore = getModule(root, store)
  settingsStore = getModule(settings, store)
  downloadStore = getModule(download, store)
  tabStore = getModule(tab, store)
}

export { initializeStores, layoutStore, settingsStore, downloadStore, tabStore }
