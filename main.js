import App from './App'
import store from './store'
import plugin from './js_sdk/uni-admin/plugin'
import VueI18n from 'vue-i18n'
import messages from './i18n/index.js'

Vue.use(VueI18n)

// 通过选项创建 VueI18n 实例
const i18n = new VueI18n({
  locale: 'zh-Hans', // 设置地区
  messages, // 设置地区信息
})


// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false

Vue.use(plugin)
App.mpType = 'app'
const app = new Vue({
  i18n,
  store,
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  app.use(plugin)
  app.use(store)
  return {
    app
  }
}
// #endif
