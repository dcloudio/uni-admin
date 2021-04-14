const {
	Controller
} = require('uni-cloud-router')
module.exports = class PermissionController extends Controller {
	async remove() {
		const {
			id
		} = this.ctx.data

		return this.ctx.uniID.deletePermission({
			permissionID: id
		})
	}
}
