import {
    http
} from '@/js_sdk/uni-admin/http.js'

export default {
    namespaced: true,
    state: {
        inited: false,
        sidebar: {
            opened: true
        },
        navMenu: [],
        active: '',
        isPhone: false
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
        TOGGLE_MENU_ACTIVE: (state, url) => {
          state.active = url
        },
        QUERY_MEDIA: (state, matches) => {
            state.isPhone = matches
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
        changeMenuActive({ commit }, url) {
            commit('TOGGLE_MENU_ACTIVE', url)
        },
        queryMedia({ commit }, matches) {
            commit('QUERY_MEDIA', matches)
        }
    }
}
