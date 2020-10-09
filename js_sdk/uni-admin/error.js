import store from '@/store'
import config from '@/admin.config.js'
export function initError(Vue) {
    const debugOptions = config.navBar.debug
    if (debugOptions && debugOptions.enable === true) {
        const oldErrorHandler = Vue.config.errorHandler
        Vue.config.errorHandler = function errorHandler(err, vm, info) {
            let route = vm.$page && vm.$page.route
            if (!route) {
                const pages = getCurrentPages()
                if (pages.length) {
                    route = pages[pages.length - 1].route
                }
            }
            route = '/' + route
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
