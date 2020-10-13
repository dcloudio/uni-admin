const {
    Controller
} = require('uni-cloud-router')
const uniId = require('uni-id')
module.exports = class PermissionController extends Controller {
    async add() {
        const permission = this.ctx.data
        if(!permission.permissionID){
            this.throw({
                code:'VALIDATE_ERROR',
                message: 'permissionID不可为空'
            })
        }
        return uniId.addPermission(permission)
    }

    async getList() {
        const data = this.ctx.data
        return uniId.getPermissionList(data)
    }

	async update() {
	    const data = this.ctx.data
	    return uniId.updatePermission(data)
	}

    async deletePermission() {
        const data = this.ctx.data
        return uniId.deletePermission(data)
    }
}
