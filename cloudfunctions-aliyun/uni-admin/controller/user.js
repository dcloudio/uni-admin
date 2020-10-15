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
        let {
            data: admin
        } = await this.db.collection('uni-id-users').where({
            role: 'admin'
        }).limit(1000).get()

        return admin
    }

    async logout() {
        return this.service.user.logout(this.ctx.event.uniIdToken)
    }


}
