/**
 *  以下方法为 uni-stat 的工具方法
 */

// 获取指定日期当天或 n 天前零点的时间戳，丢弃时分秒
function getTimeOfSomeDayAgo(days = 0, date = Date.now()) {
	const d = new Date(date)
	const oneDayTime = 24 * 60 * 60 * 1000
	let ymd = [d.getFullYear(), d.getMonth() + 1, d.getDate()].join('-')
	ymd = ymd + ' 00:00:00'
	const someDaysAgoTime = new Date(ymd).getTime() - oneDayTime * days
	return someDaysAgoTime
}

// 将查询条件拼接为字符串
function stringifyQuery(query, customQuery) {
	const queryArr = []
	if (customQuery && typeof customQuery === 'string') {
		queryArr.push(customQuery)
	}
	const range = query.stat_time_range
	const keys = Object.keys(query)
	keys.forEach(key => {
		if (key === 'stat_time_range') return
		let val = query[key]
		if (val) {
			if (typeof val === 'string') {
				val = `"${val}"`
			}
			if (key === 'stat_time') {
				if (Array.isArray(range) && range.length === 2) {
					queryArr.push(`stat_time >= ${range[0]} && stat_time <= ${range[1]}`)
				} else {
					queryArr.push(`stat_time >= ${getTimeOfSomeDayAgo(val)}`)
				}

			} else {
				queryArr.push(`${key} == ${val}`)
			}
		}
	})
	const queryStr = queryArr.join(' && ')

	return queryStr || {}
}


function division(dividend, divisor) {
	if (divisor) {
		return dividend / divisor
	} else {
		return 0
	}
}

function format(num, type=',') {
	if (typeof num !== 'number') return num
	if (type === '%') {
		return num.toFixed(4) * 100 + type
	} else if (type === ':') {
		num = Math.ceil(num)
		let h, m, s
		h = m = s = 0
		const wunH = 60 * 60,
			wunM = 60 // 单位秒
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
	}
}

export {
	stringifyQuery,
	getTimeOfSomeDayAgo,
	division,
	format
}
