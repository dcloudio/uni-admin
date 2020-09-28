export default {
    namespaced: true,
    state: {
        token: uni.getStorageSync('uni_id_token'),
        tokenExpired: uni.getStorageSync('uni_id_token_expired'),
        userInfo: {}
    },
    getters: {
        isTokenValid(state) {
            return !!state.token && state.tokenExpired > Date.now()
        }
    },
    mutations: {
        SET_TOKEN: (state, {
            token,
            tokenExpired
        }) => {
            state.token = token
            state.tokenExpired = tokenExpired
            uni.setStorageSync('uni_id_token', token)
            uni.setStorageSync('uni_id_token_expired', tokenExpired)
        },
        REMOVE_TOKEN: (state) => {
            state.token = ''
            state.tokenExpired = 0
            state.userInfo = {}
            uni.removeStorageSync('uni_id_token')
            uni.removeStorageSync('uni_id_token_expired')
        },
        SET_USER_INFO: (state, userInfo) => {
            state.userInfo = userInfo
        }
    },
    actions: {}
}
