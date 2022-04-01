/**
 *  以下为 uni-stat 的工具方法
 */

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

// 将查询条件拼接为字符串
function stringifyQuery(query, dimension = false) {
	const queryArr = []
	const keys = Object.keys(query)
	const time = query.start_time
	keys.forEach(key => {
		if (key === 'time_range') return
		let val = query[key]
		if (val) {
			if (typeof val === 'string') {
				val = `"${val}"`
			}
			if (key === 'start_time') {
				if (Array.isArray(time) && time.length === 2) {
					queryArr.push(`start_time >= ${time[0]} && start_time <= ${time[1]}`)
				} else {
					queryArr.push(`start_time == ${time}`)
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
	})
	const queryStr = queryArr.join(' && ')

	return queryStr || {}
}

function stringifyField(mapping, goal, prop) {
	if (goal) {
		mapping = mapping.filter(f => f.field === goal)
	}
	if (prop) {
		mapping = mapping.filter(f => f.field && f.hasOwnProperty(prop))
	}
	const fields = mapping.map(f => {
		if (f.stat === -1) {
			return f.field
		} else {
			return `${f.field} as ${ 'temp_' + f.field}`
		}
	}).join()
	return fields
}

function stringifyGroupField(mapping, goal, prop) {
	if (goal) {
		mapping = mapping.filter(f => f.field === goal)
	}
	if (prop) {
		mapping = mapping.filter(f => f.field && f.hasOwnProperty(prop))
	}
	const groupField = mapping.map(f => {
			if (f.stat !== -1) {
				return `${f.stat ? f.stat : 'sum' }(${'temp_' + f.field}) as ${f.field}`
			}
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

function format(num, type = ',') {
	if (!type) return num
	if (typeof num !== 'number') return num
	if (type === '%') {
		// 注意浮点数精度
		// num = Number.parseFloat(num).toPrecision(4)
		num = (num * 100).toFixed(2)
		return num + type
	} else if (type === '%%') {
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
		if (String(num).indexOf('.') > -1) {
			num = num.toFixed(2)
		}
		return num.toLocaleString()
	} else {
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
		const first = d.getDate() - d.getDay(); // First day is the day of the month - the day of the week
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
			disable
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
					if (dividend && divisor) {
						const val = format(division(dividend, divisor), formatter)
						if (hasValue && field === goal.field) {
							goal[prop] = val
						} else {
							goal[field] = val
						}
					}
				} else {
					if (value) {
						const val = format(value, formatter)
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

function getCurrentTotalUser(query = this.query, field = "total_users") {
	let currentTotalUser
	if (typeof query === 'object') {
		query = stringifyQuery(query)
	}
	const db = uniCloud.database()
	return db.collection('opendb-stat-result')
		.where(query)
		.field(`${stringifyField(this.fieldsMap, field)}, start_time`)
		.groupBy('start_time')
		.groupField(stringifyGroupField(this.fieldsMap, field))
		.orderBy('start_time', 'desc')
		.get()
		.then(cur => {
			const data = cur.result.data
			currentTotalUser = data.length && Math.max(...data.map(item => item.total_users))
			currentTotalUser = format(currentTotalUser)
			this.panelData.forEach(item => {
				if (item.field === 'total_users') {
					item.value = currentTotalUser
				}
			})
			return Promise.resolve(currentTotalUser)
		})
}

function debounce(fn, time = 0) {
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

	getCurrentTotalUser
}
