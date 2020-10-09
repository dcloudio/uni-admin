export default {
    namespaced: true,
    state: {
        logs: []
    },
    mutations: {
        ADD_ERROR_LOG: (state, log) => {
            state.logs.unshift(log)
        },
        CLEAR_ERROR_LOG: (state) => {
            state.logs.splice(0)
        }
    },
    actions: {
        add({
            commit
        }, log) {
            commit('ADD_ERROR_LOG', log)
        },
        clear({
            commit
        }) {
            commit('CLEAR_ERROR_LOG')
        }
    }
}
