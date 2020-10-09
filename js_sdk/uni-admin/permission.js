import store from '@/store'
export function initPermission(Vue) {
    Vue.prototype.$hasPermission = function hasPermission(name) {
        const permission = store.getters['user/userInfo'].permission || []
        return permission.indexOf(name) > -1
    }
    Vue.prototype.$hasRole = function hasRole(name) {
        const role = store.getters['user/userInfo'].role || []
        return role.indexOf(name) > -1
    }
}
