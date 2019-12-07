<template>
  <v-container class="index" fluid pa-0>
    <activity-bar v-if="!fullScreen" />
    <div
      class="d-flex flex-grow-1 overflow-hidden fill-height"
      :class="classes"
    >
      <sidebar v-if="!fullScreen" />
      <div
        id="wrapper"
        ref="wrapper"
        class="d-flex flex-grow-1 overflow-hidden fill-height"
      >
        <div
          ref="primaryView"
          class="d-flex flex-column white flex-grow-1 overflow-hidden"
          style="min-height: 0; flex-basis: 0;"
        >
          <toolbar v-if="!fullScreen" class="flex-grow-0" view-id="primary" />
          <div ref="primaryInner" class="inner flex-grow-1 overflow-hidden">
            <finding-bar view-id="primary" />
            <status-bar view-id="primary" />
          </div>
        </div>
        <div v-show="multiView" ref="resizer" class="resizer" vertical />
        <div
          v-if="multiView"
          ref="secondaryView"
          class="d-flex flex-column white flex-grow-0 overflow-hidden"
          :style="{ width: `${width * 100}%` }"
        >
          <toolbar v-if="!fullScreen" class="flex-grow-0" view-id="secondary" />
          <div
            ref="secondaryInner"
            class="inner flex-grow-1 overflow-hidden d-flex align-center justify-center"
          >
            <div v-if="duplicatedView" class="text-center">
              <v-icon size="160" class="grey--text">mdi-tab</v-icon>
              <p class="title black--text">Duplicated tab</p>
              <p class="subheading black--text">
                This tab is duplicated and shown in the opposite view.
              </p>
            </div>
            <finding-bar view-id="secondary" />
            <status-bar view-id="secondary" />
          </div>
        </div>
        <webview v-for="tab in tabs" :key="tab.id" :tab="tab" />
      </div>
      <shortcut-bar />
    </div>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Ref, Watch } from 'vue-property-decorator'
import { debounce } from 'debounce'
import { layoutStore, settingsStore, tabStore } from '~/store'
import ActivityBar from '~/components/ActivityBar.vue'
import ShortcutBar from '~/components/ShortcutBar.vue'
import Sidebar from '~/components/Sidebar.vue'
import FindingBar from '~/components/FindingBar.vue'
import StatusBar from '~/components/StatusBar.vue'
import Toolbar from '~/components/Toolbar.vue'
import Webview from '~/components/Webview.vue'

const waitUntil = (callback: Function, timeout = 1000) => {
  return new Promise((resolve) => {
    const expireTime = Date.now() + timeout
    const timer = setInterval(() => {
      const el = callback()
      if (el || Date.now() > expireTime) {
        clearInterval(timer)
        resolve(el)
      }
    }, 10)
  })
}

@Component({
  components: {
    ActivityBar,
    ShortcutBar,
    Sidebar,
    FindingBar,
    StatusBar,
    Toolbar,
    Webview
  }
})
export default class Index extends Vue {
  @Ref() readonly wrapper!: HTMLDivElement
  @Ref() readonly resizer!: HTMLDivElement
  @Ref() readonly primaryView!: HTMLDivElement
  @Ref() readonly secondaryView!: HTMLDivElement
  @Ref() readonly primaryInner!: HTMLDivElement
  @Ref() readonly secondaryInner!: HTMLDivElement

  resizing = false
  debounced = debounce(this.resize, 100)
  observer = new ResizeObserver(() => this.debounced())

  get classes() {
    return settingsStore.sidebarLocation === 'right'
      ? 'flex-row-reverse'
      : 'flex-row'
  }
  get fullScreen() {
    return layoutStore.fullScreen
  }
  get width() {
    return settingsStore.secondaryTabWidthRatio
  }
  set width(value) {
    settingsStore.setSecondaryTabWidthRatio({ secondaryTabWidthRatio: value })
  }
  get multiView() {
    return tabStore.multiView
  }
  get duplicatedView() {
    return tabStore.duplicatedView
  }
  get tabs() {
    return tabStore.tabs
  }
  get activeTabIds() {
    return tabStore.activeTabIds
  }

  @Watch('activeTabIds')
  onChanged() {
    this.debounced()
  }

  mounted() {
    const resize = (e: MouseEvent) => {
      const width =
        settingsStore.sidebarLocation === 'right'
          ? e.clientX - this.secondaryView.getBoundingClientRect().left
          : -e.clientX + this.secondaryView.getBoundingClientRect().right
      if (
        width < 256 ||
        width > window.innerWidth - 256 - settingsStore.sidebarWidth
      ) {
        return
      }
      this.secondaryView.style.width = width + 'px'
    }

    this.resizer.addEventListener('mousedown', () => {
      this.resizing = true
      layoutStore.setResizing({ resizing: true })
      document.body.style.cursor = 'ew-resize'
      document.addEventListener('mousemove', resize)
    })

    document.addEventListener('mouseup', () => {
      if (!this.resizing) {
        return
      }
      this.resizing = false
      layoutStore.setResizing({ resizing: false })
      this.width = this.secondaryView.offsetWidth / this.wrapper.offsetWidth
      document.body.style.cursor = ''
      document.removeEventListener('mousemove', resize)
    })

    this.$nextTick(() => {
      const el = this.$el.querySelector('.inner')
      el && this.observer.observe(el)
    })
  }

  destroyed() {
    const el = this.$el.querySelector('.inner')
    el && this.observer.unobserve(el)
  }

  async resize() {
    const primaryWebview = <HTMLDivElement>(
      await waitUntil(() => this.$el.querySelector('#primary-webview'))
    )
    if (primaryWebview) {
      primaryWebview.style.top = this.primaryInner.offsetTop + 'px'
      primaryWebview.style.left = this.primaryInner.offsetLeft + 'px'
      primaryWebview.style.width = this.primaryInner.offsetWidth + 'px'
      primaryWebview.style.height = this.primaryInner.offsetHeight + 'px'
    }
    if (!this.multiView) {
      return
    }
    const secondaryWebview = <HTMLDivElement>(
      await waitUntil(() => this.$el.querySelector('#secondary-webview'))
    )
    if (secondaryWebview) {
      secondaryWebview.style.top = this.secondaryInner.offsetTop + 'px'
      secondaryWebview.style.left = this.secondaryInner.offsetLeft + 'px'
      secondaryWebview.style.width = this.secondaryInner.offsetWidth + 'px'
      secondaryWebview.style.height = this.secondaryInner.offsetHeight + 'px'
    }
  }
}
</script>

<style lang="scss" scoped>
.index {
  #wrapper {
    position: relative;
    ::v-deep webview {
      display: none;
      position: absolute;
      &#primary-webview,
      &#secondary-webview {
        display: flex !important;
      }
    }
    .resizer {
      height: 100%;
      padding: 0 1px;
      margin: 0 -1px;
      z-index: 5;
      cursor: ew-resize;
    }
  }
  .shortcut-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 600px;
    max-width: 100%;
    margin: 0 auto;
    z-index: 1;
  }
}
</style>
