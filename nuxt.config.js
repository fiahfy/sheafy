import colors from 'vuetify/es5/util/colors'
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
        defaultAssets: false,
        theme: {
          themes: {
            light: {
              primary: colors.blue.darken2,
              accent: colors.grey.darken3,
              secondary: colors.amber.darken3,
              info: colors.teal.lighten1,
              warning: colors.amber.base,
              error: colors.deepOrange.accent4,
              success: colors.green.accent3
            }
          }
        }
      }
    ]
  ],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    '~/plugins/context-menu',
    '~/plugins/event-bus',
    '~/plugins/filter',
    '~/plugins/ipc-listener',
    '~/plugins/vuetify',
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
