export default {
    namespaced: true,
    state: {
        userInfo: {}
    },
    mutations: {
        SET_USER_INFO: (state, userInfo) => {
            state.userInfo = userInfo
        }
    },
    actions: {
		getUserInfo ({commit}) {
			const db = uniCloud.database()
			return db
				.collection('uni-id-users')
				.where('_id==$cloudEnv_uid')
				.field('username,nickname')
				.get()
				.then(({result}) => {
					const [userInfo] = result.data

					commit('SET_USER_INFO', userInfo)

					return Promise.resolve(userInfo)
				})
		}
	}
}
