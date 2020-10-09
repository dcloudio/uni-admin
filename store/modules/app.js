import http from '@/js_sdk/uni-admin/http.js'

export default {
    namespaced: true,
    state: {
        inited: false,
        sidebar: {
            opened: true
        },
        navMenu: [],
        active: ''
    },
    mutations: {
        TOGGLE_SIDEBAR: state => {
            state.sidebar.opened = !state.sidebar.opened
        },
        CLOSE_SIDEBAR: state => {
            state.sidebar.opened = false
        },
        SET_NAV_MENU: (state, navMenu) => {
            state.inited = true
            state.navMenu = navMenu
        },
        TOGGLE_MENU_ACTIVE: (state, menuId) => {
          state.active = menuId
        }
    },
    actions: {
        toggleSideBar({
            commit
        }) {
            commit('TOGGLE_SIDEBAR')
        },
        closeSideBar({
            commit
        }) {
            commit('CLOSE_SIDEBAR')
        },
        init({
            commit
        }) {
            http('system/init')
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
        changeMenuActive({ commit }, menuId) {
            commit('TOGGLE_MENU_ACTIVE', menuId)
        }
    }
}
