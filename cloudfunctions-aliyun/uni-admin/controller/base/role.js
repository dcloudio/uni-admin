const {
    Controller
} = require('uni-cloud-router')
const uniId = require('uni-id')
module.exports = class RoleController extends Controller {
    async add() {
        const role = this.ctx.data
        if(!role.roleID){
            this.throw({
                code:'VALIDATE_ERROR',
                message: 'roleID不可为空'
            })
        }
        return uniId.addRole(role)
    }

    async getList() {
        const data = this.ctx.data
        return uniId.getRoleList(data)
    }

	async update() {
	    const data = this.ctx.data
	    return uniId.updateRole(data)
	}

    async deleteRole() {
        const data = this.ctx.data
        return uniId.deleteRole(data)
    }
}
