import Vue from 'vue'
import App from './App'
import store from './store'
import plugin from './plugin'
import http from './js_sdk/utils/http.js'

Vue.config.productionTip = false

Vue.prototype.$http = http

Vue.use(plugin)

App.mpType = 'app'

const app = new Vue({
    store,
    ...App
})
app.$mount()
