/**
 * @class UniIDUsers uni-id 用户模型
 */
const BaseMod = require('./base')
module.exports = class UniIDUsers extends BaseMod {

	constructor() {
		super()
		this.tableName = 'uni-id-users'
		this.tablePrefix = false
	}

	/**
	 * 获取用户数
	 * @param {String} appid DCloud-appid
	 * @param {String} platform 平台
	 * @param {String} channel 渠道
	 * @param {String} version 版本
	 * @param {Object} registerTime 注册时间范围 例：{$gte:开始日期时间戳, $lte:结束日期时间戳}
	 * @return {Number}
	 */
	async getUserCount(appid, platform, channel, version, registerTime) {
		if(!appid || !platform) {
			return false
		}
		const condition = this.getCondition(appid, platform, channel, version, registerTime)
		let userCount = 0
		const userCountRes = await this.getCollection(this.tableName, this.tablePrefix).where(condition).count()
		if(userCountRes && userCountRes.total > 0) {
			userCount = userCountRes.total
		}
		return userCount
	}

	/**
	 * 获取用户编号列表
	 * @param {String} appid DCloud-appid
	 * @param {String} platform 平台
	 * @param {String} channel 渠道
	 * @param {String} version 版本
	 * @param {Object} registerTime 注册时间范围 例：{$gte:开始日期时间戳, $lte:结束日期时间戳}
	 * @return {Array}
	 */
	async getUserIds(appid, platform, channel, version, registerTime) {
		if(!appid || !platform) {
			return false
		}
		const condition = this.getCondition(appid, platform, channel, version, registerTime)
		let uids = []
		const uidsRes = await this.selectAll(this.tableName, condition, {
			_id: 1
		}, this.tablePrefix)

		for (const u in uidsRes.data) {
			uids.push(uidsRes.data[u]._id)
		}

		return uids
	}

	/**
	 * 获取查询条件
	 * @param {String} appid DCloud-appid
	 * @param {String} platform 平台
	 * @param {String} channel 渠道
	 * @param {String} version 版本
	 * @param {Object} registerTime 注册时间范围 例：{$gte:开始日期时间戳, $lte:结束日期时间戳}
	 */
	getCondition(appid, platform, channel, version, registerTime) {

		let condition = {
			'register_env.appId': appid,//DCloud appid
			'register_env.uniPlatform': platform,//平台
			'register_env.channel': channel ? channel : '1001' //h默认渠道要单独处理一下与uni-id相对应
		}
		
		//原生应用区分版本
		if(['android', 'ios'].includes(platform)) {
			condition['register_env.appVersion'] = version //app版本
		}

		//注册时间
		if(registerTime) {
			condition.register_date = registerTime
		}

		return condition
	}

}
