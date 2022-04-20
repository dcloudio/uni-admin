const {
	getConfig
} = require('../../shared')
//基类
module.exports = class BaseMod {
	constructor() {
		//配置信息
		this.config = getConfig('config')
		//开启/关闭debug
		this.debug = this.config.debug
		//主键
		this.primaryKey = '_id'
		//单次查询最多返回 500 条数据(阿里云500，腾讯云1000，这里取最小值)
		this.selectMaxLimit = 500
		//数据表前缀
		this.tablePrefix = 'uni-stat'
		//数据表连接符
		this.tableConnectors = '-'
		//数据表名
		this.tableName = ''
		//参数
		this.params = {}
		//数据库连接
		this._dbConnection()
		//redis连接
		this._redisConnection()
	}

	// 数据库链接
	_dbConnection() {
		if (!this.db) {
			try {
				this.db = uniCloud.database()
				this.dbCmd = this.db.command
				this.dbAggregate = this.dbCmd.aggregate
			} catch (e) {
				console.error('database connection failed: ' + e)
				throw new Error('database connection failed: ' + e)
			}
		}
	}

	// redis链接
	_redisConnection() {
		if (this.config.redis && !this.redis) {
			try {
				this.redis = uniCloud.redis()
			} catch (e) {
				console.log('redis server connection failed: ' + e)
			}
		}
	}

	// 获取配置项
	getConfig(key) {
		return this.config[key]
	}

	// 获取表名
	getTableName(tab) {
		tab = tab || this.tableName
		const table = (this.tablePrefix && tab.indexOf(this.tablePrefix) !== 0) ? this.tablePrefix + this.tableConnectors + tab : tab
		return table
	}

	// 获取数据集
	getCollection(tab, useDbPre = true) {
		return useDbPre ? this.db.collection(this.getTableName(tab)) : this.db.collection(tab)
	}

	// 获取reids缓存
	async getCache(key) {
		if (!this.redis || !key) {
			return false
		}
		let cacheResult = await this.redis.get(key)
		
		if (this.debug) {
			console.log('get cache result by key:' + key, cacheResult)
		}
		
		if (cacheResult) {
			try {
				cacheResult = JSON.parse(cacheResult)
			} catch (e) {
				if (this.debug) {
					console.log('json parse error: ' + e)
				}
			}
		}
		return cacheResult
	}

	// 设置redis缓存
	async setCache(key, val, expireTime) {
		if (!this.redis || !key) {
			return false
		}

		if (val instanceof Object) {
			val = JSON.stringify(val)
		}

		if (this.debug) {
			console.log('set cache result by key:' + key, val)
		}

		return await this.redis.set(key, val, 'EX', expireTime || this.config.cachetime)
	}

	// 清除redis缓存
	async clearCache(key) {
		if (!this.redis || !key) {
			return false
		}

		if (this.debug) {
			console.log('delete cache by key:' + key)
		}

		return await this.redis.del(key)
	}

	// 通过_id获取数据
	async getById(tab, id) {
		const condition = {}
		condition[this.primaryKey] = id
		const info = await this.getCollection(this.getTableName(tab)).where(condition).get()
		return (info && info.data.length > 0) ? info.data[0] : []
	}

	// 插入数据
	async insert(tab, params) {
		params = params || this.params
		return await this.getCollection(this.getTableName(tab)).add(params)
	}

	// 修改数据
	async update(tab, params, condition) {
		params = params || this.params
		return await this.getCollection(this.getTableName(tab)).where(condition).update(params)
	}

	// 删除数据
	async delete(tab, condition) {
		if (!condition) {
			return false
		}
		return await this.getCollection(this.getTableName(tab)).where(condition).remove()
	}

	// 批量插入 - 云服务空间对单条mongo语句执行时间有限制，所以批量插入需限制每次执行条数
	async batchInsert(tab, data) {
		let batchInsertNum = this.getConfig('batchInsertNum') || 3000
		batchInsertNum = Math.min(batchInsertNum, 5000)
		const insertNum = Math.ceil(data.length / batchInsertNum)
		let start;
		let end;
		let fillData;
		let insertRes;
		const res = {
			code: 0,
			msg: 'success',
			data: {
				inserted: 0
			}
		}
		for (let p = 0; p < insertNum; p++) {
			start = p * batchInsertNum
			end = Math.min(start + batchInsertNum, data.length)
			fillData = []
			for (let i = start; i < end; i++) {
				fillData.push(data[i])
			}
			if (fillData.length > 0) {
				insertRes = await this.insert(tab, fillData)
				if (insertRes && insertRes.inserted) {
					res.data.inserted += insertRes.inserted
				}
			}
		}
		return res
	}

	// 批量删除 - 云服务空间对单条mongo语句执行时间有限制，所以批量删除需限制每次执行条数
	async batchDelete(tab, condition) {
		const batchDeletetNum = 5000;
		let deleteIds;
		let delRes;
		let thisCondition
		const res = {
			code: 0,
			msg: 'success',
			data: {
				deleted: 0
			}
		}
		let run = true
		while (run) {
			const dataRes = await this.getCollection(tab).where(condition).limit(batchDeletetNum).get()
			if (dataRes && dataRes.data.length > 0) {
				deleteIds = []
				for (let i = 0; i < dataRes.data.length; i++) {
					deleteIds.push(dataRes.data[i][this.primaryKey])
				}
				if (deleteIds.length > 0) {
					thisCondition = {}
					thisCondition[this.primaryKey] = {
						$in: deleteIds
					}
					delRes = await this.delete(tab, thisCondition)
					if (delRes && delRes.deleted) {
						res.data.deleted += delRes.deleted
					}
				}
			} else {
				run = false
			}
		}
		return res
	}
	
	// mongo 查询
	async select(tab, params) {
		const {
			where,
			field,
			skip,
			limit,
			orderBy,
			count
		} = params
		const query = this.getCollection(tab)

		if (where) {
			if (where.length > 0) {
				where.forEach(key => {
					query.where(where[key])
				})
			} else {
				query.where(where)
			}
		}

		if (orderBy) {
			Object.keys(orderBy).forEach(key => {
				query.orderBy(key, orderBy[key])
			})
		}

		if (skip) {
			query.skip(skip)
		}

		if (limit) {
			query.limit(limit)
		}

		if (field) {
			query.field(field)
		}

		if (count) {
			return await query.count()
		}

		return await query.get()
	}

	// 查询全部数据
	async selectAll(tab, condition, field = {}) {
		const countRes = await this.getCollection(tab).where(condition).count()
		if (countRes && countRes.total > 0) {
			const pageCount = Math.ceil(countRes.total / this.selectMaxLimit)
			let res, returnData
			for (let p = 0; p < pageCount; p++) {
				res = await this.getCollection(tab).where(condition).orderBy(this.primaryKey, 'asc').skip(p *
					this.selectMaxLimit).limit(this.selectMaxLimit).field(field).get()
				if (!returnData) {
					returnData = res
				} else {
					returnData.affectedDocs += res.affectedDocs
					for (const i in res.data) {
						returnData.data.push(res.data[i])
					}
				}
			}
			return returnData
		}
		return {
			affectedDocs: 0,
			data: []
		}
	}

	// 聚合查询
	async aggregate(tab, params) {
		const {
			project,
			match,
			lookup,
			group,
			skip,
			limit,
			sort,
			getAll
		} = params

		const query = this.getCollection(tab).aggregate()

		if (project) {
			query.project(project)
		}

		if (match) {
			query.match(match)
		}

		if (lookup) {
			query.lookup(lookup)
		}

		if (group) {
			if (group.length > 0) {
				for (const gi in group) {
					query.group(group[gi])
				}
			} else {
				query.group(group)
			}
		}

		if (sort) {
			query.sort(sort)
		}

		if (skip) {
			query.skip(skip)
		}

		if (limit) {
			query.limit(limit)
		} else if (!getAll) {
			query.limit(this.selectMaxLimit)
		}

		if (!getAll) {
			return await query.end()
		}

		const resCount = await query.group({
			_id: {},
			aggregate_count: {
				$sum: 1
			}
		}).end()

		if (resCount && resCount.data.length > 0 && resCount.data[0].aggregate_count > 0) {
			const total = resCount.data[0].aggregate_count
			const pageCount = Math.ceil(total / this.selectMaxLimit)
			let res, returnData
			params.limit = this.selectMaxLimit
			params.getAll = false
			for (let p = 0; p < pageCount; p++) {
				params.skip = p * params.limit
				res = await this.aggregate(tab, params)
				if (!returnData) {
					returnData = res
				} else {
					returnData.affectedDocs += res.affectedDocs
					for (const i in res.data) {
						returnData.data.push(res.data[i])
					}
				}
			}
			return returnData
		} else {
			return {
				affectedDocs: 0,
				data: []
			}
		}
	}
}
