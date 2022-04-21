/**
 * @class Platform 应用平台模型
 */
const BaseMod = require('./base')
const {
	DateTime
} = require('../lib')
module.exports = class Platform extends BaseMod {
	constructor() {
		super()
		this.tableName = 'app-platforms'
	}

	/**
	 * 获取平台信息
	 * @param {String} platform 平台代码
	 * @param {String} os 系统
	 */
	async getPlatform(platform, os) {
		const cacheKey = 'uni-stat-platform-' + platform + '-' + os
		let platformData = await this.getCache(cacheKey)
		if (!platformData) {
			const platformCode = this.getPlatformCode(platform, os)
			const platformInfo = await this.getCollection(this.tableName).where({
				code: platformCode
			}).limit(1).get()
			platformData = []
			if (platformInfo.data.length > 0) {
				platformData = platformInfo.data[0]
				await this.setCache(cacheKey, platformData)
			}
		}
		return platformData
	}

	/**
	 * 获取平台信息没有则创建
	 * @param {String} platform 平台代码
	 * @param {String} os 系统
	 */
	async getPlatformAndCreate(platform, os) {
		if (!platform) {
			return false
		}
		const platformInfo = await this.getPlatform(platform, os)

		if (platformInfo.length === 0) {
			const platformCode = this.getPlatformCode(platform, os)
			const insertParam = {
				code: platformCode,
				name: platformCode,
				create_time: new DateTime().getTime()
			}
			const res = await this.insert(this.tableName, insertParam)
			if (res && res.id) {
				return Object.assign(insertParam, {
					_id: res.id
				})
			}
		}
		return platformInfo
	}

	/**
	 * 获取平台代码
	 * @param {String} platform 平台代码
	 * @param {String} os 系统
	 */
	getPlatformCode(platform, os) {
		let platformCode = platform
		if (platform === 'n' || platform === 'app-plus') {
			if (os === 'i' || os === 'ios') {
				platformCode = 'ios'
			} else {
				platformCode = 'android'
			}
		}
		return platformCode
	}
}
