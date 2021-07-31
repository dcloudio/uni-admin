// #ifndef VUE3
export function initPermission(Vue) {
	Vue.prototype.$hasPermission = function hasPermission(name) {
		const permission = this.$store.state.user.userInfo.permission || []
		const role = this.$store.state.user.userInfo.role || []
		return role.indexOf('admin') > -1 || permission.indexOf(name) > -1
	}
	Vue.prototype.$hasRole = function hasRole(name) {
		const role = this.$store.state.user.userInfo.role || []
		return role.indexOf(name) > -1
	}
}
// #endif

// #ifdef VUE3
export function initPermission(app) {
	app.config.globalProperties.$hasPermission = function hasPermission(name) {
		const permission = this.$store.state.user.userInfo.permission || []
		const role = this.$store.state.user.userInfo.role || []
		return role.indexOf('admin') > -1 || permission.indexOf(name) > -1
	}
	app.config.globalProperties.$hasRole = function hasRole(name) {
		const role = this.$store.state.user.userInfo.role || []
		return role.indexOf(name) > -1
	}
}
// #endif
