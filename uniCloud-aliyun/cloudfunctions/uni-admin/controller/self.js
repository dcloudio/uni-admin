const {
    Controller
} = require('uni-cloud-router')
module.exports = class UserController extends Controller {
    async changePwd() {
        const data = this.ctx.data
        return this.ctx.uniID.updatePwd({
            uid: this.ctx.auth.uid,
            ...data
        })
    }
}
