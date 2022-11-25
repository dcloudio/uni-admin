import pagesJson from '@/pages.json'
const uniIdCo = uniCloud.importObject("uni-id-co")
const db = uniCloud.database();
const usersTable = db.collection('uni-id-users')



let hostUserInfo = uni.getStorageSync('uni-id-pages-userInfo')||{}
console.log( hostUserInfo);
const data = {
	userInfo: hostUserInfo,
	hasLogin: Object.keys(hostUserInfo).length != 0
}

console.log('data', data);
// 定义 mutations, 修改属性
export const mutations = {
	// data不为空，表示传递要更新的值(注意不是覆盖是合并),什么也不传时，直接查库获取更新
	async updateUserInfo(data = false) {
		if (data) {
			usersTable.where('_id==$env.uid').update(data).then(e => {
				console.log(e);
				if (e.result.updated) {
					uni.showToast({
						title: "更新成功",
						icon: 'none'
					});
					this.setUserInfo(data)
				} else {
					uni.showToast({
						title: "没有改变",
						icon: 'none'
					});
				}
			})

		} else {
			try {
				let res = await usersTable.where("'_id' == $cloudEnv_uid")
						.field('mobile,nickname,username,email,avatar_file')
						.get()
				console.log('fromDbData',res.result.data);
				this.setUserInfo(res.result.data[0])
			} catch (e) {
				this.setUserInfo({},{cover:true})
				console.error(e.message, e.errCode);
			}
		}
	},
	async setUserInfo(data, {cover}={cover:false}) {
		console.log('set-userInfo', data);
		let userInfo = cover?data:Object.assign(store.userInfo,data)
		store.userInfo = Object.assign({},userInfo)
		store.hasLogin = Object.keys(store.userInfo).length != 0
		console.log('store.userInfo', store.userInfo);
		uni.setStorage({
			key: "uni-id-pages-userInfo",
			data:store.userInfo
		})
		return data
	},
	async logout() {
		await uniIdCo.logout()
		uni.removeStorageSync('uni_id_token');
		uni.setStorageSync('uni_id_token_expired', 0)
		uni.redirectTo({
			url: `/${pagesJson.uniIdRouter?.loginPage ?? 'uni_modules/uni-id-pages/pages/login/login-withoutpwd'}`,
		});
		uni.$emit('uni-id-pages-logout')
		this.setUserInfo({},{cover:true})
	},
	loginSuccess(e = {}){
		const {
			showToast = true, toastText = '登录成功', autoBack = true, uniIdRedirectUrl = ''
		} = e
		console.log({
			toastText,
			autoBack
		});
		if (showToast) {
			uni.showToast({
				title: toastText,
				icon: 'none'
			});
		}
		this.updateUserInfo()
		uni.$emit('uni-id-pages-login-success')
		if (autoBack) {
			let delta = 0; //判断需要返回几层
			let pages = getCurrentPages();
			// console.log(pages);
			pages.forEach((page, index) => {
				if (pages[pages.length - index - 1].route.split('/')[3] == 'login') {
					delta++
				}
			})
			// console.log('判断需要返回几层:', delta);
			if (uniIdRedirectUrl) {
				return uni.reLaunch({
					url: uniIdRedirectUrl
				})
			}
			// #ifdef H5
			if (e.loginType == 'weixin') {
				console.log('window.history', window.history);
				return window.history.go(-3)
			}
			// #endif

			if (delta) {
				const page = pagesJson.pages[0]
				return uni.reLaunch({
					url: `/${page.path}`
				})
			}

			uni.navigateBack({
				delta
			})
		}
	}

}

// #ifdef VUE2
import Vue from 'vue'
// 通过Vue.observable创建一个可响应的对象
export const store = Vue.observable(data)
// #endif

// #ifdef VUE3
import {
	reactive
} from 'vue'
// 通过Vue.observable创建一个可响应的对象
export const store = reactive(data)
// #endif
