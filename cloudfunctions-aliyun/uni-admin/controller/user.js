const {
    Controller
} = require('uni-cloud-router')
module.exports = class UserController extends Controller {
    async login() {
        const {
            username,
            password
        } = this.ctx.data
        return this.service.user.login({
            username,
            password
        })
    }

    async logout() {
        return this.service.user.logout(this.ctx.event.uniIdToken)
    }
}
