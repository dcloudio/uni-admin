const {
    Service
} = require('uni-cloud-router')

const db = uniCloud.database()
const storageCollection = db.collection('opendb-admin-storage')

module.exports = class StorageService extends Service {
    async report({
        name,
        fileID,
        catagory,
        type,
        size
    }) {
        if (!fileID) {
            this.ctx.throw('INVALID_STORAGE_FILEID', '缺少fileID')
        }
        await storageCollection.add({
            name,
            file_id: fileID,
            catagory,
            type,
            size,
            create_date: Date.now()
        })
        return {
            msg: '上报成功'
        }
    }

    async list({
        catagory,
        type,
        pageSize,
        currentPage
    }) {
        let query
        if (type || catagory) {
            query = {
                type,
                catagory
            }
        }
        let queryExec = storageCollection
        let countExec = storageCollection
        if (query) {
            queryExec = queryExec.where(query)
            countExec = countExec.where(query)
        } else {
            // 阿里云即将修复count必须带条件的Bug
            countExec = countExec.where({
                _id: db.command.exists(true)
            })
        }
        const {
            data: list
        } = await queryExec
            .orderBy('create_date', 'desc')
            .skip(pageSize * (currentPage - 1))
            .limit(pageSize)
            .get()
        const {
            total
        } = await countExec.count()
        return {
            list,
            total
        }
    }

    async delete(fileID) {
        if (!fileID) {
            this.ctx.throw('INVALID_STORAGE_FILEID', '缺少fileID')
        }
        await uniCloud.deleteFile({
            fileList: [fileID]
        })
        await storageCollection.where({
            file_id: fileID,
        }).remove()
        return {
            msg: '删除成功'
        }
    }
}
