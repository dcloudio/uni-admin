// 用户
const BaseMod = require('./base')
const {
	DateTime
} = require('../lib')
module.exports = class Users extends BaseMod {
	
	constructor() {
		super()
		this.tableName = 'users'
		this.cacheKeyPre = 'uni-stat-users-'
		this.platforms = []
		this.channels = []
		this.versions = []
	}
	
	//同步用户，将当前访问的uni-id用户 同步至uni统计用户中，此举主要是解决原uni-id用户未关联 渠道、版本的问题（将uni-id用户划分至对应的应用、平台、渠道、版本下）
	async syncUser(params) {
		
		if(!params.uid) {
			return false
		}
		
		const userRes = await this.getUserByUid(params.uid)
		if(userRes.length === 0) {
			
			if(this.debug) {
				console.log('userRes', userRes)
			}
			
			//查询用户
			const uniIduserRes = await this.getCollection('uni-id-users', false).where({
				_id: params.uid
			}).orderBy('create_time', 'desc').limit(1).get()
			
			if(!uniIduserRes || uniIduserRes.data.length === 0) {
				console.error('Not found this user:' + params.uid)
				return false
			} else {
				const nowTime = new DateTime().getTime()
				//是否为新用户, 注册时间在1小时内的认为是新用户
				let isNew = 0
				if(uniIduserRes.data[0].register_date > nowTime - 3600000) {
					isNew = 1
				}
				
				const userParam = {
					appid: params.appid,
					version: params.version,
					platform: params.platform,
					channel: params.channel,
					uid: params.uid,
					is_new: isNew,
					create_time: nowTime
				}
				
				const res = await this.insert(this.tableName, userParam)
				
				if(!res || !res.id) {
					console.error('Add user faild by param:', userParam)
					return false
				}
			}
		}
		
		return true
	}
	
	async getUserByUid(uid) {
		const cacheKey = this.cacheKeyPre + uid
		let userData = await this.getCache(cacheKey)
		if(!userData) {
			const userRes = await this.getCollection(this.tableName).where({
				uid: uid
			}).get()
			userData = []
			if(userRes.data.length > 0) {
				userData = userRes.data[0]
				await this.setCache(cacheKey, userData)
			}
		}
		
		return userData
	}
	
}
