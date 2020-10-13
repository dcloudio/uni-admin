const {
    Controller
} = require('uni-cloud-router')
const uniID = require('uni-id')
module.exports = class RoleController extends Controller {
    async add() {
        const role = this.ctx.data
        if(!role.roleID){
            this.throw({
                code:'VALIDATE_ERROR',
                message: 'roleID不可为空'
            })
        }
        return uniID.addRole(role)
    }

    async getList() {
        const data = this.ctx.data
        return uniID.getRoleList(data)
    }

    async getRole() {
        const data = this.ctx.data
        console.log(Object.keys(uniID))
        return uniID.getRoleInfo(data.roleID)
    }

	async update() {
	    const data = this.ctx.data
	    return uniID.updateRole(data)
	}

    async deleteRole() {
        const data = this.ctx.data
        return uniID.deleteRole(data)
    }
}
