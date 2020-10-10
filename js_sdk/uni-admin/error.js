import store from '@/store'
import config from '@/admin.config.js'
export function initError(Vue) {
    const debugOptions = config.navBar.debug
    if (debugOptions && debugOptions.enable === true) {
        const oldErrorHandler = Vue.config.errorHandler
        Vue.config.errorHandler = function errorHandler(err, vm, info) {
            const route = vm.$page && vm.$page.route
            store.dispatch('error/add', {
                err: err.toString(),
                info,
                route,
                time: new Date().toLocaleTimeString()
            })
            return oldErrorHandler(err, vm, info)
        }
    }
}
