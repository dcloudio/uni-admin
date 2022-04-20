// 页面
const BaseMod = require('./base')
const {
	parseUrl
} = require('../../shared')
const {
	DateTime
} = require('../lib')
module.exports = class Page extends BaseMod {
	constructor() {
		super()
		this.tableName = 'pages'
	}

	// 获取页面信息
	async getPage(appid, url) {
		const cacheKey = 'uni-stat-page-' + appid + '-' + url
		let pageData = await this.getCache(cacheKey)
		if (!pageData) {
			const pageInfo = await this.getCollection(this.tableName).where({
				appid: appid,
				path: url
			}).limit(1).get()
			pageData = []
			if (pageInfo.data.length > 0) {
				pageData = pageInfo.data[0]
				await this.setCache(cacheKey, pageData)
			}
		}
		return pageData
	}

	// 获取页面信息不存在则创建
	async getPageAndCreate(appid, url, title) {
		//获取url信息
		const urlInfo = parseUrl(url)
		if(!urlInfo) {
			return false
		}
		const baseurl = urlInfo.path
		const pageInfo = await this.getPage(appid, baseurl)
		//页面不存在则创建
		if (pageInfo.length === 0) {
			const thisTime = new DateTime().getTime()
			const insertParam = {
				appid: appid,
				path: baseurl,
				title: title,
				page_params: [],
				create_time: thisTime,
				update_time: thisTime
			}
			const res = await this.insert(this.tableName, insertParam)

			if (res && res.id) {
				return Object.assign(insertParam, {
					_id: res.id
				})
			}
		} else if (!pageInfo.title && title) {
			const cacheKey = 'uni-stat-page-' + appid + '-' + baseurl
			await this.clearCache(cacheKey)
			await this.update(this.tableName, {
				title: title
			}, {
				_id: pageInfo._id
			})
		}

		return pageInfo
	}

	// 获取页面_id
	async getPageId(appid, url) {
		const pageInfo = await this.getPage(appid, url)
		return pageInfo.length > 0 ? pageInfo._id : ''
	}

	getBaseUrl(url) {
		let baseurl = url.split('?')[0]
		if (baseurl !== '/' && baseurl.indexOf('/') === 0) {
			baseurl = baseurl.substr(1)
		}
		return baseurl
	}
}
