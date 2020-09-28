import http from '../../js_sdk/utils/http.js'

export default {
    namespaced: true,
    state: {
        sidebar: {
            opened: true
        },
        navMenu: []
    },
    mutations: {
        TOGGLE_SIDEBAR: state => {
            state.sidebar.opened = !state.sidebar.opened
        },
        CLOSE_SIDEBAR: state => {
            state.sidebar.opened = false
        },
        SET_NAV_MENU: (state, navMenu) => {
            state.navMenu = navMenu
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
                    } = res.result
                    commit('SET_NAV_MENU', navMenu)
                    commit('user/SET_USER_INFO', userInfo, {
                        root: true
                    })
                })
        }
    }
}
