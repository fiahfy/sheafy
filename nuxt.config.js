import pkg from './package'

module.exports = {
  /*
   ** Build configuration
   */
  build: {
    extend(config, ctx) {
      // Extend only webpack config for client-bundle
      if (ctx.isClient) {
        config.target = 'electron-renderer'
      }
      // Set relative path
      config.output.publicPath = './_nuxt/'
    }
  },

  /*
   ** Global CSS
   */
  css: ['@mdi/font/css/materialdesignicons.css', 'typeface-roboto/index.css'],

  /*
   ** Generate configuration
   */
  generate: {
    dir: 'app'
  },

  /*
   ** Customize the progress-bar color
   */
  loading: false,

  /*
   ** Headers of the page
   */
  head: {
    title: pkg.productName,
    meta: [{ hid: 'charset', charset: 'utf-8' }]
  },

  /*
   ** SPA or Universal
   */
  mode: 'spa',

  /*
   ** Nuxt.js modules
   */
  modules: [
    [
      '@nuxtjs/vuetify',
      {
        customVariables: ['~/assets/variables.scss'],
        defaultAssets: false
      }
    ]
  ],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~/plugins/electron-accelerator-formatter',
    '~/plugins/electron-context-menu',
    '~/plugins/event-bus',
    '~/plugins/ipc',
    '~/plugins/vue-draggable',
    '~/plugins/vue-long-press'
  ],

  /*
   ** Router configuration
   */
  router: {
    mode: 'hash'
  },

  /*
   ** Source directory
   */
  srcDir: 'src',

  /*
   ** Vue configuration
   */
  vue: {
    config: {
      productionTip: false
    }
  }
}
