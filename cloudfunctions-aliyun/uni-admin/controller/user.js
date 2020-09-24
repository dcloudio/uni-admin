const {
    Controller
} = require('uni-cloud-router')
module.exports = class UserController extends Controller {
    async login() {
        // TODO
        return this.service.user.login()
    }
}
