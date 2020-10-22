import config from '@/admin.config.js'

import {
	request
} from '@/js_sdk/uni-admin/request.js'

function findLaunchPath(navMenu) {
	if (navMenu && navMenu.length) {
		for (let i = 0; i < navMenu.length; i++) {
			const menu = navMenu[i]
			const children = menu.children
			const hasChildren = children && children.length
			if (!hasChildren && menu.url) {
				return menu.url
			}
			if (hasChildren) {
				const url = findLaunchPath(children)
				if (url) {
					return url
				}
			}
		}
	}
}

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
					return config.launch_path || // 手动配置的首页
						findLaunchPath(navMenu) || // 动态菜单首页
						findLaunchPath(config.sideBar && config.sideBar.staticMenu) || // 静态菜单首页
						'/' // fallback 至首页
				})
		},
		changeMenuActive({
			commit
		}, url) {
			commit('TOGGLE_MENU_ACTIVE', url)
		}
	}
}
