const {
    Controller
} = require('uni-cloud-router')
const uniID = require('uni-id')
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

    async register() {
        const {
            username,
            password
        } = this.ctx.data
        return uniID.register({
            username,
            password
        })
    }

    async hasAdmin() {
        const {
            total
        } = await this.db.collection('uni-id-users').where({
            role: 'admin'
        }).count()

        return !!total
    }

    async logout() {
        return this.service.user.logout(this.ctx.event.uniIdToken)
    }


}
