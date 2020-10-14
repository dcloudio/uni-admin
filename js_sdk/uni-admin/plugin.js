import {
    initApi
} from './api.js'
import {
    initUtil
} from './util.js'
import {
    initError
} from './error.js'
import {
    initRequest
} from './request.js'
import {
    initPermission
} from './permission.js'
import {
    initInterceptor
} from './interceptor.js'
export default {
    install(Vue) {
        initUtil(Vue)
        initError(Vue)
        initRequest(Vue)
        initPermission(Vue)

        initApi()
        initInterceptor()
    }
}
