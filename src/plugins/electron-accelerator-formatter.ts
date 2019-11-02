import Vue from 'vue'
const electronAcceleratorFormatter = require('@fiahfy/electron-accelerator-formatter')
  .default

Vue.filter('accelerator', (title: string, accelerator: string): string => {
  return `${title} (${electronAcceleratorFormatter(accelerator)})`
})
