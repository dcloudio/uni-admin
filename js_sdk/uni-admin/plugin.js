import store from '@/store'
import config from '@/admin.config.js'
import http from './http.js'
export default {
    install(Vue) {
        Vue.prototype.$http = http
        Vue.prototype.$hasPermission = function hasPermission(name) {
            const permission = store.getters['user/userInfo'].permission || []
            return permission.includes(name)
        }
        uni.addInterceptor('navigateTo', {
            invoke(params) {
                if (!store.getters['user/isTokenValid']) {
                    uni.showModal({
                        content: '登录状态失效，请重新登录',
                        showCancel: false,
                        success() {
                            uni.reLaunch({
                                url: config.loginPageUrl
                            })
                        }
                    })
                }
            },
            fail: ({
                errMsg
            }) => {
                if (errMsg.indexOf('is not found') !== -1) { // 404
                    uni.navigateTo({
                        url: config.notFoundPageUrl + '?errMsg=' + errMsg
                    })
                }
            }
        })
    }
}
