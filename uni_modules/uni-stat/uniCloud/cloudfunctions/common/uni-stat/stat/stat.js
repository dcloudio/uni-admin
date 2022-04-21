//uni统计-数据统计调度模块
const {
	DateTime
} = require('./lib')

const {
	BaseMod,
	SessionLog,
	PageLog,
	EventLog,
	ShareLog,
	ErrorLog,
	StatResult,
	ActvieDevices,
	PageResult,
	EventResult,
	ErrorResult,
	Loyalty,
	RunErrors,
} = require('./mod')


class UniStat {
	
	// 定时触发
	async statCron(context) {
		const baseMod = new BaseMod()
		const dateTime = new DateTime()
		console.log('Cron start time: ', dateTime.getDate('Y-m-d H:i:s'))
		//获取运行参数
		const timeInfo = dateTime.getTimeInfo(null, false)
		const cronConfig = baseMod.getConfig('cron')
		const cronMin = baseMod.getConfig('cronMin')
		const realtimeStat = baseMod.getConfig('realtimeStat')
		// 数据跑批
		let res = null
		if (cronConfig && cronConfig.length > 0) {
			for (var mi in cronConfig) {
				const cronType = cronConfig[mi].type
				const cronTime = cronConfig[mi].time.split(' ')
				
				//未开启分钟级定时任务，则设置为小时级定时任务
				if (cronTime.length === 4 && !cronMin) {
					cronTime.splice(3, 1)
				}
				
				if (baseMod.debug) {
					console.log('cronTime', cronTime)
				}
				//精度为分钟级的定时任务
				if (cronTime.length === 4) {
					if (cronTime[0] !== '*') {
						//周统计任务
						if (timeInfo.nWeek == cronTime[0] && timeInfo.nHour == cronTime[2] && timeInfo.nMinutes ==
							cronTime[3]) {
							console.log(cronType + '--week run')
							res = await this.stat({
								type: cronType,
								dimension: 'week'
							})
						}
					} else if (cronTime[1] !== '*') {
						//月统计任务
						if (timeInfo.nDay == cronTime[1] && timeInfo.nHour == cronTime[2] && timeInfo.nMinutes ==
							cronTime[3]) {
							console.log(cronType + '--month run')
							res = await this.stat({
								type: cronType,
								dimension: 'month'
							})
						}
					} else if (cronTime[2] !== '*') {
						//日统计任务
						if (timeInfo.nHour == cronTime[2] && timeInfo.nMinutes == cronTime[3]) {
							console.log(cronType + '--day run')
							res = await this.stat({
								type: cronType,
								dimension: 'day'
							})
						}
					} else if (cronTime[3] !== '*') {
						//实时统计任务
						if (timeInfo.nMinutes == cronTime[3] && realtimeStat) {
							console.log(cronType + '--hour run')
							res = await this.stat({
								type: cronType,
								dimension: 'hour'
							})
						}
					}
				}
				//精度为小时级的定时任务
				else if (cronTime.length === 3) {
					if (cronTime[0] !== '*') {
						//周统计任务
						if (timeInfo.nWeek == cronTime[0] && timeInfo.nHour == cronTime[2]) {
							console.log(cronType + '--week run')
							res = await this.stat({
								type: cronType,
								dimension: 'week'
							})
						}
					} else if (cronTime[1] !== '*') {
						//月统计任务
						if (timeInfo.nDay == cronTime[1] && timeInfo.nHour == cronTime[2]) {
							console.log(cronType + '--month run')
							res = await this.stat({
								type: cronType,
								dimension: 'month'
							})
						}
					} else if (cronTime[2] !== '*') {
						//日统计任务
						if (timeInfo.nHour == cronTime[2]) {
							console.log(cronType + '--day run')
							res = await this.stat({
								type: cronType,
								dimension: 'day'
							})
						}
					} else {
						//实时统计任务
						if (realtimeStat) {
							console.log(cronType + '--hour run')
							res = await this.stat({
								type: cronType,
								dimension: 'hour'
							})
						}
					}
				} else {
					console.error('Cron configuration error')
				}
			}
		}
		console.log('Cron end time: ', dateTime.getDate('Y-m-d H:i:s'))
		return {
			code: 0,
			msg: 'Task have done',
			lastCronResult: res
		}
	}

	// 统计相关
	async stat(params) {
		const {
			type,
			dimension,
			date,
			reset
		} = params
		let res = {
			code: 0,
			msg: 'success'
		}

		try {
			switch (type) {
				// 基础统计
				case 'stat': {
					const resultStat = new StatResult()
					res = await resultStat.stat(dimension, date, reset)
					break
				}
				// 周活跃设备表归集
				case 'active-device': {
					const activeDevices = new ActvieDevices()
					res = await activeDevices.stat(date, reset)
					break
				}
				// 留存统计
				case 'retention': {
					const retentionStat = new StatResult()
					res = await retentionStat.retentionStat(dimension, date, reset)
					break
				}
				// 页面统计
				case 'page': {
					const pageStat = new PageResult()
					res = await pageStat.stat(dimension, date, reset)
					break
				}
				// 事件统计
				case 'event': {
					const eventStat = new EventResult()
					res = await eventStat.stat(dimension, date, reset)
					break
				}
				// 错误统计
				case 'error': {
					const errorStat = new ErrorResult()
					res = await errorStat.stat(dimension, date, reset)
					break
				}
				// 设备忠诚度统计
				case 'loyalty': {
					const loyaltyStat = new Loyalty()
					res = await loyaltyStat.stat(dimension, date, reset)
					break
				}
				// 日志清理
				case 'clean': {
					res = await this.cleanLog()
				}
			}
		} catch (e) {
			
			//报错则重新尝试2次
			const maxTryTimes = 2
			if (!this.tryTimes) {
				this.tryTimes = 1
			} else {
				this.tryTimes ++
			}

			if (this.tryTimes <= maxTryTimes) {
				params.reset = true
				res = await this.stat(params)
			} else {
				// 2次尝试失败后记录错误
				console.error('server error: ' + e)
				const runError = new RunErrors()
				runError.create({
					mod: 'stat',
					params: params,
					error: e,
					create_time: new DateTime().getTime()
				})
				
				res = {
					code: 500,
					msg: 'server error' + e
				}
			}
		}
		return res
	}

	// 日志清理
	async cleanLog() {
		const baseMod = new BaseMod()
		const cleanLog = baseMod.getConfig('cleanLog')
		if (!cleanLog || !cleanLog.open) {
			return {
				code: 100,
				msg: 'The log cleanup service has not been turned on'
			}
		}

		const res = {
			code: 0,
			msg: 'success',
			data: {}
		}

		// 会话日志
		if (cleanLog.reserveDays.sessionLog > 0) {
			const sessionLog = new SessionLog()
			res.data.sessionLog = await sessionLog.clean(cleanLog.reserveDays.sessionLog)
		}

		// 页面日志
		if (cleanLog.reserveDays.pageLog > 0) {
			const pageLog = new PageLog()
			res.data.pageLog = await pageLog.clean(cleanLog.reserveDays.pageLog)
		}

		// 事件日志
		if (cleanLog.reserveDays.eventLog > 0) {
			const eventLog = new EventLog()
			res.data.eventLog = await eventLog.clean(cleanLog.reserveDays.eventLog)
		}

		// 分享日志
		if (cleanLog.reserveDays.shareLog > 0) {
			const shareLog = new ShareLog()
			res.data.shareLog = await shareLog.clean(cleanLog.reserveDays.shareLog)
		}

		// 错误日志
		if (cleanLog.reserveDays.errorLog > 0) {
			const errorLog = new ErrorLog()
			res.data.errorLog = await errorLog.clean(cleanLog.reserveDays.errorLog)
		}

		// 活跃设备日志
		const activeDevicesLog = new ActvieDevices()
		res.data.actvieDevicesLog = await activeDevicesLog.clean()
		
		// 活跃用户日志
		const activeUsersLog = new ActvieUsers()
		res.data.activeUsersLog = await activeUsersLog.clean()

		// 实时统计日志
		const resultHourLog = new StatResult()
		res.data.resultHourLog = await resultHourLog.cleanHourLog()
		
		//原生应用崩溃日志
		const appCrashLogs = new AppCrashLogs()
		res.data.appCrashLogs = await appCrashLogs.clean()

		return res
	}
}

module.exports = UniStat
