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

	async group(data) {
		let {
			whereJson
		} = data;
		const dbRes = await this.aggregate(dbName.uniStatUserSessionLogs, {
			match: whereJson,
			group: {
				_id: {
					appid: '$appid',
					version: '$version',
					platform: '$platform',
					channel: '$channel',
				},
				// 用户数（去重复）
				user_count: {
					$addToSet: '$uid'
				},

				create_time: {
					$min: '$create_time'
				}
			},
			addFields: {
				user_count: {
					$size: '$user_count'
				}
			},
			// 按创建时间排序
			sort: {
				create_time: 1
			},
			getAll: true
		});

		let list = dbRes.data;
		return list;
	}

	async groupCount(whereJson) {
		const dbRes = await this.aggregate(dbName.uniStatUserSessionLogs, {
			match: whereJson,
			group: {
				_id: null,
				// 设备数（去重复）
				count: {
					$addToSet: '$uid'
				},
			},
			addFields: {
				count: {
					$size: '$count'
				}
			},
			getAll: true
		});
		try {
			return dbRes.data[0].count;
		} catch (err) {
			return 0;
		}
	}
}


module.exports = new Dao();
