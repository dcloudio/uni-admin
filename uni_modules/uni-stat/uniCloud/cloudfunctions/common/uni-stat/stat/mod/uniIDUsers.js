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
		
		const condition = {
			'register_env.appid': appid,//DCloud appid
			'register_env.uniPlatform': platform,//平台
			'register_env.channel': channel ? channel : undefined,//渠道/场景值
			'register_env.appVersionCode': version ? version : undefined//app版本号
		}
		
		//注册时间
		if(registerTime) {
			condition.register_date = registerTime
		}
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
		const condition = {
			'register_env.appid': appid,//DCloud appid
			'register_env.uniPlatform': platform,//平台
			'register_env.channel': channel ? channel : undefined,//渠道/场景值
			'register_env.appVersionCode': version ? version : undefined//app版本号
		}
		
		//注册时间
		if(registerTime) {
			condition.register_date = registerTime
		}
		
		let uids = []
		const uidsRes = await this.selectAll(this.tableName, conditon, {
			_id: 1
		}, this.tablePrefix)
		
		for (const u in uidsRes.data) {
			uids.push(uidsRes.data[u]._id)
		}
		
		return uids
	}
	
}
