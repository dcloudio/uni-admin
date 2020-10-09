import {
    initApi
} from './api.js'
import {
    initHttp
} from './http.js'
import {
    initError
} from './error.js'
import {
    initPermission
} from './permission.js'
import {
    initInterceptor
} from './interceptor.js'
export default {
    install(Vue) {
        initHttp(Vue)
        initError(Vue)
        initPermission(Vue)

        initApi()
        initInterceptor()
    }
}
