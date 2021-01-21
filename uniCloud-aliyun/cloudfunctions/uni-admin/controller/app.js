const {
	Controller
} = require('uni-cloud-router')
module.exports = class UserController extends Controller {
	async init() {
		const getCurrentUserInfoRes = await this.service.user.getCurrentUserInfo(['_id','username'])
		return {
			userInfo: {
				...getCurrentUserInfoRes.userInfo,
				...this.ctx.auth.userInfo,
				token: undefined,
				password: undefined,
				permission: this.ctx.auth.permission
			},
			navMenu: await this.service.menu.getMenu()
		}
	}
}
