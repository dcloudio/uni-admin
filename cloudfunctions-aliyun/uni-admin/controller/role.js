const {
    Controller
} = require('uni-cloud-router')
const uniId = require('uni-id')
module.exports = class RoleController extends Controller {
    async add() {
        const role = this.ctx.data
        //  TODO
        if(!role.roleID){
            this.throw({
                code:'VALIDATE_ERROR',
                message: 'roleID不可为空'
            })
        }
        return uniId.addRole(role)
    }
}
