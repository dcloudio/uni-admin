// #ifndef VUE3
const statConfig = require('uni-stat-config').default || require('uni-stat-config');
// #endif

export default {
	namespaced: true,
	state: {
		inited: false,
		navMenu: [],
		routes: [],
		// #ifndef VUE3
		appName: process.env.VUE_APP_NAME || '',
		appid: statConfig && statConfig.appid || ''
		// #endif
		// #ifdef VUE3
		appName: process.env.UNI_APP_NAME || '',
		appid: process.env.UNI_APP_ID || ''
		// #endif
	},
	mutations: {
		SET_APP_NAME: (state, appName) => {
			state.appName = appName
		},
		SET_NAV_MENU: (state, navMenu) => {
			state.inited = true
			state.navMenu = navMenu
		},
		SET_ROUTES: (state, routes) => {
			state.routes = routes
		}
	},
	actions: {
		init({
			commit,
		 	dispatch
		 }) {
			// 初始化获取用户信息
			dispatch('user/getUserInfo', null, {
				root: true
			})
		},
		setAppName({
			commit
		}, appName) {
			commit('SET_APP_NAME', appName)
		},
		setRoutes({
			commit
		}, routes) {
			commit('SET_ROUTES', routes)
		}
	}
}
