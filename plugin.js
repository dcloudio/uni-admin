export default {
    install(Vue) {
        Vue.prototype.$hasPermission = function hasPermission(name) {
            // TODO
        }
        uni.addInterceptor('navigateTo', {
            invoke(params) {
                // TODO
            }
        })
    }
}
