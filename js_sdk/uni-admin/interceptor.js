import config from '@/admin.config.js'

export function initInterceptor() {
    uni.addInterceptor('navigateTo', {
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
