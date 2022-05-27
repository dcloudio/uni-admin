/**
 *  以下为 uni-stat 的工具方法
 */

// 将查询条件拼接为字符串
function stringifyQuery(query, dimension = false) {
	const queryArr = []
	const keys = Object.keys(query)
	const time = query.start_time
	keys.forEach(key => {
		if (key === 'time_range') return
		let val = query[key]
		if (val) {
			if (typeof val === 'string' && val.indexOf(key) > -1) {
				queryArr.push(val)
			} else {
				if (typeof val === 'string') {
					val = `"${val}"`
				}
				if (Array.isArray(val)) {
					if (val.length === 2 && key.indexOf('time')> -1) {
						queryArr.push(`${key} >= ${val[0]} && ${key} <= ${val[1]}`)
					} else {
						val = val.map(item => `${key} == "${item}"`).join(' || ')
						val && queryArr.push(`(${val})`)
					}
				} else if (dimension && key === 'dimension') {
					if (maxDeltaDay(time)) {
						queryArr.push(`dimension == "hour"`)
					} else {
						if (val && val !== `"hour"`) {
							queryArr.push(`${key} == ${val}`)
						} else {
							queryArr.push(`dimension == "day"`)
						}
					}
				} else {
					queryArr.push(`${key} == ${val}`)
				}
			}
		}
	})
	const queryStr = queryArr.join(' && ')
	return queryStr || {}
}

// 根据 fieldsMap 和数据计算、格式化字段
function mapfields(map, data = {}, goal, prefix = '', prop = 'value') {
	const goals = [],
		argsGoal = goal
	map = JSON.parse(JSON.stringify(map))
	const origin = JSON.parse(JSON.stringify(data))
	for (const mapper of map) {
		let {
			field,
			computed,
			formatter,
			disable,
			fix
		} = mapper
		if (!disable) {
			goal = argsGoal || mapper
			const hasValue = goal.hasOwnProperty(prop)
			const preField = prefix + field
			if (data) {
				const value = data[preField]
				if (computed) {
					const computedFields = computed.split('/')
					let [dividend, divisor] = computedFields
					dividend = Number(origin[prefix + dividend])
					divisor = Number(origin[prefix + divisor])
					const val = format(division(dividend, divisor), formatter, fix)
					if (hasValue && field === goal.field) {
						goal[prop] = val
					} else {
						goal[field] = val
					}
				} else {
					if (value) {
						const val = format(value, formatter, fix)
						if (hasValue) {
							if (goal.field === field) {
								goal[prop] = val
							}
						} else {
							goal[field] = val
						}
					}
				}
			}
			if (hasValue) {
				goals.push(goal)
			}
		}
	}
	return goals
}

function stringifyField(mapping, goal, prop) {
	if (goal) {
		mapping = mapping.filter(f => f.field === goal)
	}
	if (prop) {
		mapping = mapping.filter(f => f.field && f.hasOwnProperty(prop))
	}
	const fieldString = mapping.map(f => {
		let fields = []
		if (f.computed) {
			fields = f.computed.split('/')
		} else {
			fields.push(f.field)
		}
		fields = fields.map(field => {
			if (f.stat === -1) {
				return field
			} else {
				return `${field} as ${ 'temp_' + field}`
			}
		})
		return fields.join()
	})
	return fieldString.join()
}

function stringifyGroupField(mapping, goal, prop) {
	if (goal) {
		mapping = mapping.filter(f => f.field === goal)
	}
	if (prop) {
		mapping = mapping.filter(f => f.field && f.hasOwnProperty(prop))
	}
	const groupField = mapping.map(f => {
			const stat = f.stat
			let fields = []
			if (f.computed) {
				fields = f.computed.split('/')
			} else {
				fields.push(f.field)
			}
			fields = fields.map(field => {
				if (stat !== -1) {
					return `${stat ? stat : 'sum' }(${'temp_' + field}) as ${field}`
				}
			})
			return fields.filter(Boolean).join()
		})
		.filter(Boolean)
		.join()

	return groupField
}

function division(dividend, divisor) {
	if (divisor) {
		return dividend / divisor
	} else {
		return 0
	}
}

function format(num, type = ',', fix) {
	// if (!type) return num
	if (typeof num !== 'number') return num
	if (type === '%') {
		// 注意浮点数精度
		num = (num * 100)
		if (String(num).indexOf('.') > -1) {
			num = num.toFixed(2)
		}
		num = num ? num + type : num
		return num
	} else if (type === '%%') {
		num = Number(num)
		return num.toFixed(2) + '%'
	} else if (type === '-') {
		return formatDate(num, 'day')
	} else if (type === ':') {
		num = Math.ceil(num)
		let h, m, s
		h = m = s = 0
		const wunH = 60 * 60,
			wunM = 60 // 单位秒, wun 通 one
		if (num >= wunH) {
			h = Math.floor(num / wunH)
			const remainder = num % wunH
			if (remainder >= wunM) {
				m = Math.floor(remainder / wunM)
				s = remainder % wunM
			} else {
				s = remainder
			}
		} else if (wunH >= num && num >= wunM) {
			m = Math.floor(num / wunM)
			s = num % wunM
		} else {
			s = num
		}
		const hms = [h, m, s].map(i => i < 10 ? '0' + i : i)
		return hms.join(type)
	} else if (type === ',') {
		return num.toLocaleString()
	} else {
		if (String(num).indexOf('.') > -1) {
			if (Math.abs(num) > 1) {
				num = num.toFixed(fix || 0)
			} else {
				num = num.toFixed(fix || 2)
			}
		}
		return num
	}
}

function formatDate(date, type) {
	let d = new Date(date)
	if (type === 'hour') {
		let h = d.getHours()
		h = h < 10 ? '0' + h : h
		return `${h}:00 ~ ${h}:59`
	} else if (type === 'week') {
		const first = d.getDate() - d.getDay() +1; // First day is the day of the month - the day of the week
		const last = first + 6; // last day is the first day + 6
		let firstday = new Date(d.setDate(first));
		firstday = parseDateTime(firstday)
		let lastday = new Date(d.setDate(last));
		lastday = parseDateTime(lastday)
		return `${firstday} ~ ${lastday}`
	} else if (type === 'month') {
		let firstday = new Date(d.getFullYear(), d.getMonth(), 1);
		firstday = parseDateTime(firstday)
		let lastday = new Date(d.getFullYear(), d.getMonth() + 1, 0);
		lastday = parseDateTime(lastday)
		return `${firstday} ~ ${lastday}`
	} else {
		return parseDateTime(d)
	}
}

function parseDateTime(datetime, type, splitor = '-') {
	let d = datetime
	if (typeof d !== 'object') {
		d = new Date(d)
	}
	const year = d.getFullYear()
	const month = d.getMonth() + 1
	const day = d.getDate()
	const hour = d.getHours()
	const minute = d.getMinutes()
	const second = d.getSeconds()
	const date = [year, lessTen(month), lessTen(day)].join(splitor)
	const time = [lessTen(hour), lessTen(minute), lessTen(second)].join(':')
	if (type === "dateTime") {
		return date + ' ' + time
	}
	return date
}

function lessTen(item) {
	return item < 10 ? '0' + item : item
}

// 获取指定日期当天或 n 天前零点的时间戳，丢弃时分秒
function getTimeOfSomeDayAgo(days = 0, date = Date.now()) {
	const d = new Date(date)
	const oneDayTime = 24 * 60 * 60 * 1000
	let ymd = [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('/')
	ymd = ymd + ' 00:00:00'
	const someDaysAgoTime = new Date(ymd).getTime() - oneDayTime * days
	return someDaysAgoTime
}

function maxDeltaDay(times, delta = 2) {
	if (!times.length) return true
	const wunDay = 24 * 60 * 60 * 1000
	const [start, end] = times
	const max = end - start < wunDay * delta
	return max
}

function getFieldTotal(query = this.query, field = "total_devices") {
	let fieldTotal
	if (typeof query === 'object') {
		query = stringifyQuery(query)
	}
	const db = uniCloud.database()
	return db.collection('uni-stat-result')
		.where(query)
		.field(`${field} as temp_${field}, start_time`)
		.groupBy('start_time')
		.groupField(`sum(temp_${field}) as ${field}`)
		.orderBy('start_time', 'desc')
		.get()
		.then(cur => {
			const data = cur.result.data
			fieldTotal = data.length && data[0][field]
			fieldTotal = format(fieldTotal)
			this.panelData && this.panelData.forEach(item => {
				if (item.field === field) {
					item.value = fieldTotal
				}
			})
			return Promise.resolve(fieldTotal)
		})
}

function debounce(fn, time = 100) {
	let timer = null
	return function(...args) {
		if (timer) clearTimeout(timer)
		timer = setTimeout(() => {
			fn.apply(this, args)
		}, time)
	}
}

export {
	stringifyQuery,
	stringifyField,
	stringifyGroupField,
	mapfields,
	getTimeOfSomeDayAgo,
	division,
	format,
	formatDate,
	parseDateTime,
	maxDeltaDay,
	debounce,

	getFieldTotal
}
