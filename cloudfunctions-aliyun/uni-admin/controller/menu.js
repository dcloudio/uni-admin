const {
    Controller
} = require('uni-cloud-router')
module.exports = class UserController extends Controller {
    async getMenu() {
        return this.service.menu.getMenu()
    }
}
