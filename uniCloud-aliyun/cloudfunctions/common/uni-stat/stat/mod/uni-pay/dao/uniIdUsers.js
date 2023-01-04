/**
 * 数据库操作
 */
const dbName = require("./config");

let db = uniCloud.database();
let _ = db.command;
let $ = _.aggregate;

class Dao {
	async count(whereJson) {
		let dbRes = await db.collection(dbName.uniIdUsers).where(whereJson).count()
		return dbRes && dbRes.total ? dbRes.total : 0;
	}

	async countNewUserOrder(obj) {
		let {
			whereJson,
			status
		} = obj;
		let dbRes = await db.collection(dbName.uniIdUsers).aggregate()
			.match(whereJson)
			.lookup({
				from: dbName.uniPayOrders,
				let: {
					user_id: '$_id',
				},
				pipeline: $.pipeline()
					.match(_.expr($.and([
						$.eq(['$user_id', '$$user_id']),
						$.in(['$status', status])
					])))
					.limit(1)
					.done(),
				as: 'order',
			})
			.unwind({
				path: '$order',
			})
			.group({
				_id: null,
				count: {
					$addToSet: '$_id'
				},
			})
			.addFields({
				count: {
					$size: '$count'
				}
			})
			.end()
		try {
			return dbRes.data[0].count;
		} catch (err) {
			return 0;
		}

	}
}


module.exports = new Dao();
