module.exports = class DateTime {

	constructor() {
		this.defaultDateFormat = 'Y-m-d H:i:s'
		this.defaultTimezone = 8
		this.setTimeZone(this.defaultTimezone)
	}

	//设置时区
	setTimeZone(timezone) {
		if (timezone) {
			this.timezone = parseInt(timezone)
		}
		return this
	}

	//获取date对象
	getDateObj(time) {
		return time ? new Date(time) : new Date()
	}

	//获取时间戳
	getTime(datetime, showSenconds) {
		let time = this.getDateObj(datetime).getTime()
		if (showSenconds) {
			time = Math.trunc(time / 1000)
		}
		return time
	}

	//获取日期
	getDate(dateFormat, time) {
		return this.dateFormat(dateFormat, time)
	}

	//获取日期在不同时区下的时间戳
	getTimeByTimeZone(time, timezone) {
		this.setTimeZone(timezone)
		const thisDate = time ? new Date(time) : new Date()
		const localTime = thisDate.getTime()
		const offset = thisDate.getTimezoneOffset()
		const utc = offset * 60000 + localTime
		return utc + (3600000 * this.timezone)
	}

	//获取时间信息
	getTimeInfo(time, full = true) {
		time = this.getTimeByTimeZone(time)
		const date = this.getDateObj(time)
		const retData = {
			nYear: date.getFullYear(),
			nMonth: date.getMonth() + 1,
			nWeek: date.getDay() || 7,
			nDay: date.getDate(),
			nHour: date.getHours(),
			nMinutes: date.getMinutes(),
			nSeconds: date.getSeconds()
		}

		if (full) {
			for (const k in retData) {
				if (retData[k] < 10) {
					retData[k] = '0' + retData[k]
				}
			}
		}
		return retData
	}

	//时间格式转换
	dateFormat(format, time) {
		const timeInfo = this.getTimeInfo(time)
		format = format || this.defaultDateFormat
		let date = format
		if (format) {
			date = date.replace(/Y/, timeInfo.nYear)
		}
		if (format.indexOf('m') !== false) {
			date = date.replace(/m/, timeInfo.nMonth)
		}
		if (format.indexOf('d') !== false) {
			date = date.replace(/d/, timeInfo.nDay)
		}
		if (format.indexOf('H') !== false) {
			date = date.replace(/H/, timeInfo.nHour)
		}
		if (format.indexOf('i') !== false) {
			date = date.replace(/i/, timeInfo.nMinutes)
		}
		if (format.indexOf('s') !== false) {
			date = date.replace(/s/, timeInfo.nSeconds)
		}
		return date
	}

	//获取utc格式时间
	getUTC(datetime) {
		return this.getDateObj(datetime).toUTCString()
	}


	//获取ISO 格式时间
	getISO(datetime) {
		return this.getDateObj(datetime).toISOString()
	}

	// 获取两时间相差天数
	getDiffDays(time1, time2) {
		if (!time1) {
			return false
		}
		time2 = time2 ? time2 : this.getTime()

		let diffTime = time2 - time1
		if (diffTime < 0) {
			diffTime = Math.abs(diffTime)
		}

		return Math.ceil(diffTime / 86400000)
	}

	// 字符串转时间戳
	strToTime(str) {
		if (Array.from(str).length === 10) {
			str += '000'
		}
		return this.getTime(parseInt(str))
	}

	// 根据设置的天数获取时间戳
	getTimeBySetDays(days, time, getAll = false) {
		const date = this.getDateObj(time)
		date.setDate(date.getDate() + days)
		let startTime = date.getTime()
		if (!getAll) {
			const realdate = this.getDate('Y-m-d 00:00:00', startTime)
			startTime = this.getTimeByDateAndTimezone(realdate)
		}
		return startTime
	}

	// 根据设置的小时数获取时间戳
	getTimeBySetHours(hours, time, getAll = false) {
		const date = this.getDateObj(time)
		date.setHours(date.getHours() + hours)
		let startTime = date.getTime()
		if (!getAll) {
			const realdate = this.getDate('Y-m-d H:00:00', startTime)
			startTime = this.getTimeByDateAndTimezone(realdate)
		}
		return startTime
	}

	// 根据设置的周获取时间戳
	getTimeBySetWeek(weeks, time, getAll = false) {
		const date = this.getDateObj(time)
		const dateInfo = this.getTimeInfo(time)
		const day = dateInfo.nWeek
		const offsetDays = 1 - day
		if (weeks) {
			weeks = weeks * 7 + offsetDays
		}
		date.setDate(date.getDate() + weeks)
		let startTime = date.getTime()
		if (!getAll) {
			const realdate = this.getDate('Y-m-d 00:00:00', startTime)
			startTime = this.getTimeByDateAndTimezone(realdate)
		}
		return startTime
	}

	// 根据设置的月份获取时间戳
	getTimeBySetMonth(monthes, time, getAll = false) {
		const date = this.getDateObj(time)
		date.setMonth(date.getMonth() + monthes)
		let startTime = date.getTime()
		if (!getAll) {
			const realdate = this.getDate('Y-m-01 00:00:00', startTime)
			startTime = this.getTimeByDateAndTimezone(realdate)
		}
		return startTime
	}

	// 根据时区获取指定时间的偏移时间
	getTimeByDateAndTimezone(date, timezone) {
		if (!timezone) {
			timezone = this.timezone
		}
		const thisDate = this.getDateObj(date)
		const thisTime = thisDate.getTime()
		const offset = thisDate.getTimezoneOffset()
		const offsetTime = offset * 60000 + timezone * 3600000
		return thisTime - offsetTime
	}

	// 根据类型获取时间范围
	getTimeDimensionByType(type, offset = 0, thistime, getAll = false) {
		let startTime = 0
		let endTime = 0
		switch (type) {
			case 'hour': {
				startTime = this.getTimeBySetHours(offset, thistime, getAll)
				endTime = getAll ? startTime : startTime + 3599999
				break
			}
			case 'day': {
				startTime = this.getTimeBySetDays(offset, thistime, getAll)
				endTime = getAll ? startTime : startTime + 86399999
				break
			}
			case 'week': {
				startTime = this.getTimeBySetWeek(offset, thistime, getAll)
				endTime = getAll ? startTime + 86400000 * 6 : startTime + 86400000 * 6 + 86399999
				break
			}
			case 'month': {
				startTime = this.getTimeBySetMonth(offset, thistime, getAll)
				const date = this.getDateObj(this.getDate('Y-m-d H:i:s', startTime))
				const nextMonthFirstDayTime = new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime()
				endTime = getAll ? nextMonthFirstDayTime - 86400000 : this.getTimeByDateAndTimezone(
					nextMonthFirstDayTime) - 1
				break
			}
		}
		return {
			startTime,
			endTime
		}
	}
}
