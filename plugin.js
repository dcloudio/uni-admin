import store from './store'
export default {
    install(Vue) {
        console.log(store);
        Vue.prototype.$hasPermission = function hasPermission(name) {
            // TODO
        }
        uni.addInterceptor('navigateTo', {
            invoke(params) {
                if (!store.getters['user/isTokenValid']) {
                    uni.showModal({
                        content: '登录状态失效，请重新登录',
                        showCancel: false,
                        success() {
                            // uni.reLaunch({
                            //     url: '/pages/login/login'
                            // })
                        }
                    })
                }
                // TODO
            }
        })
    }
}
