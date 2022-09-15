import store from '@/store'
import config from '@/admin.config.js'

export function initInterceptor() {
    uni.addInterceptor('navigateTo', {
        invoke(params) {
            if (!store.getters['user/isTokenValid']) {
				const pages = getCurrentPages()

                uni.showModal({
                    content: '登录状态失效，请重新登录',
                    showCancel: false,
                    success() {
                        const redirect = pages.length ? pages[pages.length - 1].route: ''
                        const url = redirect ? `${url}?redirect=/${redirect}`: url
                        uni.reLaunch({
					        url
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
                    url: config.error.url + '?errMsg=' + errMsg
                })
            }
        }
    })
}
