import Vue from 'vue'

Vue.prototype.$eventBus = new Vue()

export default (ctx) => {
  const { app, store } = ctx

  ctx.$eventBus = app.$eventBus = store.$eventBus = Vue.prototype.$eventBus
}
