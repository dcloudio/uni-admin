/**
 * @class AppCrashLogs 原生应用崩溃日志模型
 * @function clean 原生应用崩溃日志清理函数
 */
const BaseMod = require('./base')
const {
	DateTime,
	UniCrypto
} = require('../lib')
module.exports = class AppCrashLogs extends BaseMod {
	constructor() {
		super()
		this.tableName = 'app-crash-logs'
	}

	/**
	 * 原生应用崩溃日志清理函数
	 * @param {Number} days 保留天数
	 */
	async clean(days = 7) {
		days = Math.max(parseInt(days), 1)
		console.log('clean app crash logs - day:', days)

		const dateTime = new DateTime()

		const res = await this.delete(this.tableName, {
			create_time: {
				$lt: dateTime.getTimeBySetDays(0 - days)
			}
		})

		if (!res.code) {
			console.log('clean app crash log:', res)
		}
		return res
	}
}
