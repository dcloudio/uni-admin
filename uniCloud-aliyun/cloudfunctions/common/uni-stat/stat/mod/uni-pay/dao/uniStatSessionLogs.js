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
			whereJson,
		} = data;
		const dbRes = await this.aggregate(dbName.uniStatSessionLogs, {
			match: whereJson,
			group: {
				_id: {
					appid: '$appid',
					version: '$version',
					platform: '$platform',
					channel: '$channel',
				},
				// 设备数（去重复）
				device_count: {
					$addToSet: '$device_id'
				},

				create_time: {
					$min: '$create_time'
				}
			},
			addFields: {
				device_count: {
					$size: '$device_count'
				}
			},
			// 按创建时间排序
			sort: {
				create_time: 1
			},
			getAll: true
		});

		return dbRes.data;
	}

	async groupCount(whereJson) {
		const dbRes = await this.aggregate(dbName.uniStatSessionLogs, {
			match: whereJson,
			group: {
				_id: null,
				// 设备数（去重复）
				count: {
					$addToSet: '$device_id'
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
