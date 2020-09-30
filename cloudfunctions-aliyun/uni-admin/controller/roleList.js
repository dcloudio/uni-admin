const {
    Controller
} = require('uni-cloud-router')
const uniId = require('uni-id')
module.exports = class RoleListController extends Controller {
    async getList() {
        const data = this.ctx.data
        return uniId.getRoleList(data)
    }
}
