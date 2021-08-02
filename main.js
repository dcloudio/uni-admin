import App from './App'
import store from './store'
import plugin from './js_sdk/uni-admin/plugin'

// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
Vue.use(plugin)
App.mpType = 'app'
const app = new Vue({
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
