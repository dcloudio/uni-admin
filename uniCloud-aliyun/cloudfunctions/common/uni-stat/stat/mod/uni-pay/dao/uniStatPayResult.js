/**
 * 数据库操作
 */
const BaseMod = require('../../base');
const dbName = require("./config");

class Dao extends BaseMod {

	constructor() {
		super()
		this.tablePrefix = false; // 不使用表前缀
	}

	async list(data) {
		let {
			whereJson,
		} = data;
		const dbRes = await this.getCollection(dbName.uniStatPayResult).where(whereJson).get();
		return dbRes.data;
	}

	async del(data) {
		let {
			whereJson
		} = data;
		const dbRes = await this.delete(dbName.uniStatPayResult, whereJson);
		return dbRes.deleted;
	}

	async adds(saveList) {
		return await this.batchInsert(dbName.uniStatPayResult, saveList);
	}
}


module.exports = new Dao();
