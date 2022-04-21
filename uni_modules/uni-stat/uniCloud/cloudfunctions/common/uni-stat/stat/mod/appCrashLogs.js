// 错误日志
const BaseMod = require('./base')
const {DateTime, UniCrypto} = require('../lib')
module.exports = class AppCrashLogs extends BaseMod {
	constructor () {
	  super()
	  this.tableName = 'app-crash-logs'
	}
	
	// 清理数据
	async clean (days = 7) {
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