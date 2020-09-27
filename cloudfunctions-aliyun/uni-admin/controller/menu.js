const {
    Controller
} = require('uni-cloud-router')
module.exports = class UserController extends Controller {
    async getMenu() {
        return {
            navMenu: await this.service.menu.getMenu()
        }
    }
}
