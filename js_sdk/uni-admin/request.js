import store from '@/store'
import config from '@/admin.config.js'
const debugOptions = config.navBar.debug
export function request(action, data, {
    functionName = 'uni-admin',
    showModal = true
} = {}) {
    return uniCloud.callFunction({
        name: functionName,
        data: {
            action,
            data
        }
    }).then(res => {
        if (res.result.code) {
            if (typeof res.result.code === 'string' && res.result.code.indexOf('TOKEN_INVALID') === 0) {
                uni.reLaunch({
                    url: config.login.url
                })
            }
            return Promise.reject(new Error(res.result.message))
        }
        const {
            token,
            tokenExpired
        } = res.result
        if (token && tokenExpired) {
            store.commit('user/SET_TOKEN', {
                token,
                tokenExpired
            })
        }
        return Promise.resolve(res.result)
    }).catch(err => {
        showModal && uni.showModal({
            content: '请求服务失败:' + err.message,
            showCancel: false
        })
        if (debugOptions && debugOptions.enable === true) {
            store.dispatch('error/add', {
                err: err.toString(),
                info: '$request("' + action + '")',
                route: '',
                time: new Date().toLocaleTimeString()
            })
        }
        return Promise.reject(new Error(err.message))
    })
}

export function initRequest(Vue) {
    Vue.prototype.$request = request
}
