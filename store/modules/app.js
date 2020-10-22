import {
	request
} from '@/js_sdk/uni-admin/request.js'

export default {
	namespaced: true,
	state: {
		inited: false,
		navMenu: [],
		active: ''
	},
	mutations: {
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
			return request('app/init')
				.then(res => {
					const {
						navMenu,
						userInfo
					} = res
					commit('SET_NAV_MENU', navMenu)
					commit('user/SET_USER_INFO', userInfo, {
						root: true
					})
				})
		},
		changeMenuActive({
			commit
		}, url) {
			commit('TOGGLE_MENU_ACTIVE', url)
		}
	}
}
