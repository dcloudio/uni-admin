import store from '@/store/index.js'
import config from '@/admin.config.js'
const debugOptions = config.navBar.debug

const db = uniCloud.database()
let hasServer = true
db.catch(res => {
	hasServer = false
})
setTimeout(()=> {
	hasServer && db.on('refreshToken', function({
		token,
		tokenExpired
	}) {
		store.commit('user/SET_TOKEN', {
			token,
			tokenExpired
		})
	})

	hasServer && db.on('error', function({
		code, // 错误码详见https://uniapp.dcloud.net.cn/uniCloud/clientdb?id=returnvalue
		message
	}) {
		reLaunchToLogin(code)
	})

}, 16)

export function request (action, params, options) {
	const {objectName, functionName, showModal, ...objectOptions} = Object.assign({
		objectName: 'uni-id-co',
		functionName: '',
		showModal: false,
		
		customUI: true,
		loadingOptions: {
			title: 'xxx'
		},
	}, options)

	// 兼容 云函数 与 云对象 请求，默认为云对象
	let call
	if (functionName) {
		call = uniCloud.callFunction({
			name: functionName,
			data: {
				action,
				params
			}
		})
	} else {
		const uniCloudObject = uniCloud.importObject(objectName, objectOptions)
		call = uniCloudObject[action](params)
	}

	return call.then(result => {
		if (!result) {
			return Promise.resolve(result)
		}

		if (result.errCode) {
			reLaunchToLogin(result.errCode)
			return Promise.reject(result)
		}

		const {
			token,
			tokenExpired
		} = result.newToken ?? {}
		if (token && tokenExpired) {
			store.commit('user/SET_TOKEN', {
				token,
				tokenExpired
			})
		}
		return Promise.resolve(result)

	}).catch(err => {
		showModal && uni.showModal({
			content: err.errMsg || '请求服务失败',
			showCancel: false
		})
		// #ifdef H5
		const noDebugPages = ['/pages/login/login', '/pages/init/init']
		const path = location.hash.split('#')[1]
		if (debugOptions && debugOptions.enable === true && noDebugPages.indexOf(path) === -1) {
			store.dispatch('error/add', {
				err: err.toString(),
				info: '$request("' + action + '")',
				route: '',
				time: new Date().toLocaleTimeString()
			})
		}
		// #endif
		return Promise.reject(err)
	})
}

function reLaunchToLogin(code) {
	if (typeof code === 'string' && code.indexOf('TOKEN_INVALID') === 0) {
		uni.reLaunch({
			url: config.login.url
		})
	}
}
// #ifndef VUE3
export function initRequest(Vue) {
	Vue.prototype.$request = request
}
// #endif

// #ifdef VUE3
export function initRequest(app) {
	app.config.globalProperties.$request = request
}
// #endif
