import {
	request
} from '@/js_sdk/uni-admin/request.js'

export default {
	namespaced: true,
	state: {
		inited: false,
		navMenu: [],
		active: '',
		appName: process.env.VUE_APP_NAME || ''
	},
	mutations: {
		SET_APP_NAME: (state, appName) => {
			state.appName = appName
		},
		SET_NAV_MENU: (state, navMenu) => {
			state.inited = true
			state.navMenu = navMenu
		},
		TOGGLE_MENU_ACTIVE: (state, url) => {
			state.active = url
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
		changeMenuActive({
			commit
		}, url) {
			commit('TOGGLE_MENU_ACTIVE', url)
		}
	}
}
