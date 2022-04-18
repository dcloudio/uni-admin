import {
	request
} from '@/js_sdk/uni-admin/request.js'

// #ifndef VUE3
const statConfig = require('uni-stat-config').default || require('uni-stat-config');
// #endif

export default {
	namespaced: true,
	state: {
		inited: false,
		navMenu: [],
		routes: [],
		appName: process.env.VUE_APP_NAME || process.env.UNI_APP_NAME || '',
		// #ifndef VUE3
		appid: statConfig && statConfig.appid || ''
		// #endif
		// #ifdef VUE3
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
			commit
		}) {
			return request('getCurrentUserInfo', {}, {
				functionName: 'uni-id-cf'
			}).then(res => {
					const {
						navMenu,
						userInfo
					} = res
					// commit('SET_NAV_MENU', navMenu)
					commit('user/SET_USER_INFO', userInfo, {
						root: true
					})
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
