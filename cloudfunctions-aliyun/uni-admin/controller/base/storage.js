const {
    Controller
} = require('uni-cloud-router')
module.exports = class StorageController extends Controller {
    async report() {
        return this.service.storage.report(this.ctx.data)
    }

    async list() {
        return this.service.storage.list(this.ctx.data)
    }

    async delete() {
        return this.service.storage.delete(this.ctx.data.fileID)
    }
}
