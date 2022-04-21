const {
	createApi
} = require('./shared/index')

let uniReport, uniStat
module.exports = {
	//uni统计数据上报模块初始化
	initReport: (options = {}) => {
		if(!uniReport) {
			uniReport = require('./stat/report')
		}
		options.clientType = options.clientType || __ctx__.PLATFORM
		return createApi(uniReport, options)
	},
	//uni统计数据统计模块初始化
	initStat: (options = {}) => {
		if(!uniStat) {
			uniStat = require('./stat/stat')
		}
		options.clientType = options.clientType || __ctx__.PLATFORM
		return createApi(uniStat, options)
	}
}
