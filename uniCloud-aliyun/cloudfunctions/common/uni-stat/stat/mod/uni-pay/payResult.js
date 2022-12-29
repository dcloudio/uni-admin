/**
 * @class ActiveDevices 活跃设备模型 - 每日跑批合并，仅添加本周/本月首次访问的设备。
 */
const BaseMod = require('../base')
const Platform = require('../platform')
const Channel = require('../channel')
const Version = require('../version')

const {
	DateTime,
	UniCrypto
} = require('../../lib')

const dao = require('./dao')

let db = uniCloud.database();
let _ = db.command;
let $ = _.aggregate;

module.exports = class PayResult extends BaseMod {
	constructor() {
		super()
		this.platforms = []
		this.channels = []
		this.versions = []
	}

	/**
		支付金额：统计时间内，成功支付的订单金额之和（不剔除退款订单）。
		支付笔数：统计时间内，成功支付的订单数，一个订单对应唯一一个订单号。（不剔除退款订单。）
		支付人数：统计时间内，成功支付的人数（不剔除退款订单）。
		支付设备数：统计时间内，成功支付的设备数（不剔除退款订单）。
		下单金额：统计时间内，成功下单的订单金额（不剔除退款订单）。
		下单笔数：统计时间内，成功下单的订单笔数（不剔除退款订单）。
		下单人数：统计时间内，成功下单的客户数，一人多次下单记为一人（不剔除退款订单）。
		下单设备数：统计时间内，成功下单的设备数，一台设备多次访问被计为一台（不剔除退款订单）。
		访问人数：统计时间内，访问人数，一人多次访问被计为一人（只统计已登录的用户）。
		访问设备数：统计时间内，访问设备数，一台设备多次访问被计为一台（包含未登录的用户）。
	 * @desc 支付统计（按日统计）
	 * @param {string} type 统计范围 hour：按小时统计，day：按天统计，week：按周统计，month：按月统计 quarter：按季度统计 year：按年统计
	 * @param {date|time} date
	 * @param {bool} reset
	 */
	async stat(type, date, reset, config = {}) {
		if (!date) date = Date.now();

		// 以下是测试代码-----------------------------------------------------------
		//reset = true;
		//date = 1667318400000;
		// 以上是测试代码-----------------------------------------------------------
		let res = await this.run(type, date, reset, config); // 每小时
		if (type === "hour" && config.timely) {
			/**
			 * 如果是小时纬度统计，则还需要再统计（今日实时数据）
			 * 2022-11-01 01:00:00 统计的是 2022-11-01 的天维度数据（即该天0点-1点数据）
			 * 2022-11-01 02:00:00 统计的是 2022-11-01 的天维度数据（即该天0点-2点数据）
			 * 2022-11-01 23:00:00 统计的是 2022-11-01 的天维度数据（即该天0点-23点数据）
			 * 2022-11-02 00:00:00 统计的是 2022-11-01 的天维度数据（即该天最终数据）
			 * 2022-11-02 01:00:00 统计的是 2022-11-02 的天维度数据（即该天0点-1点数据）
			 */
			date -= 1000 * 3600; // 需要减去1小时
			let tasks = [];
			tasks.push(this.run("day", date, true, 0)); // 今日
			// 以下数据每6小时刷新一次
			const dateTime = new DateTime();
			const timeInfo = dateTime.getTimeInfo(date);
			if ((timeInfo.nHour + 1) % 6 === 0) {
				tasks.push(this.run("week", date, true, 0)); // 本周
				tasks.push(this.run("month", date, true, 0)); // 本月
				tasks.push(this.run("quarter", date, true, 0)); // 本季度
				tasks.push(this.run("year", date, true, 0)); // 本年度
			}
			await Promise.all(tasks);
		}
		return res;
	}
	/**
	 * @desc 支付统计
	 * @param {string} type 统计范围 hour：按小时统计，day：按天统计，week：按周统计，month：按月统计 quarter：按季度统计 year：按年统计
	 * @param {date|time} date 哪个时间节点计算（默认已当前时间计算）
	 * @param {bool} reset 如果统计数据已存在，是否需要重新统计
	 */
	async run(type, date, reset, offset = -1) {
		let dimension = type;
		const dateTime = new DateTime();
		// 获取统计的起始时间和截止时间
		const dateDimension = dateTime.getTimeDimensionByType(dimension, offset, date);
		let start_time = dateDimension.startTime;
		let end_time = dateDimension.endTime;

		let runStartTime = Date.now();
		let debug = true;
		if (debug) {
			console.log(`-----------------支付统计开始（${dimension}）-----------------`);
			console.log('本次统计时间：', dateTime.getDate('Y-m-d H:i:s', start_time), "-", dateTime.getDate('Y-m-d H:i:s', end_time))
			console.log('本次统计参数：', 'type:' + type, 'date:' + date, 'reset:' + reset)
		}
		this.startTime = start_time;
		let pubWhere = {
			start_time,
			end_time
		};
		// 查看当前时间段数据是否已存在,防止重复生成

		if (!reset) {
			let list = await dao.uniStatPayResult.list({
				whereJson: {
					...pubWhere,
					dimension
				}
			});
			if (list.length > 0) {
				console.log('data have exists')
				if (debug) {
					let runEndTime = Date.now();
					console.log(`耗时：${((runEndTime - runStartTime ) / 1000).toFixed(3)} 秒`)
					console.log(`-----------------支付统计结束（${dimension}）-----------------`);
				}
				return {
					code: 1003,
					msg: 'Pay data in this time have already existed'
				}
			}
		} else {
			let delRes = await dao.uniStatPayResult.del({
				whereJson: {
					...pubWhere,
					dimension
				}
			});
			console.log('Delete old data result:', JSON.stringify(delRes))
		}
		// 支付订单分组（已下单）
		let statPayOrdersList1 = await dao.uniPayOrders.group({
			...pubWhere,
			status: "已下单"
		});
		// 支付订单分组（且已付款，含退款）
		let statPayOrdersList2 = await dao.uniPayOrders.group({
			...pubWhere,
			status: "已付款"
		});
		// 支付订单分组（已退款）
		let statPayOrdersList3 = await dao.uniPayOrders.group({
			...pubWhere,
			status: "已退款"
		});
		let statPayOrdersList = statPayOrdersList1.concat(statPayOrdersList2).concat(statPayOrdersList3)
		let res = {
			code: 0,
			msg: 'success'
		}
		// 将支付订单分组查询结果组装
		let statDta = {};
		if (statPayOrdersList.length > 0) {
			for (let i = 0; i < statPayOrdersList.length; i++) {
				let item = statPayOrdersList[i];
				let {
					appid,
					version,
					platform,
					channel,
				} = item._id;
				let {
					status_str
				} = item;
				let key = `${appid}-${version}-${platform}-${channel}`;
				if (!statDta[key]) {
					statDta[key] = {
						appid,
						version,
						platform,
						channel,
						status: {}
					};
				}
				let newItem = JSON.parse(JSON.stringify(item));
				delete newItem._id;
				statDta[key].status[status_str] = newItem;
			}
		}
		if (this.debug) console.log('statDta: ', statDta)

		let saveList = [];
		for (let key in statDta) {
			let item = statDta[key];
			let {
				appid,
				version,
				platform,
				channel,
				status: statusData,
			} = item;
			if (!channel) channel = item.scene;

			let fieldData = {
				pay_total_amount: 0,
				pay_order_count: 0,
				pay_user_count: 0,
				pay_device_count: 0,
				create_total_amount: 0,
				create_order_count: 0,
				create_user_count: 0,
				create_device_count: 0,
				refund_total_amount: 0,
				refund_order_count: 0,
				refund_user_count: 0,
				refund_device_count: 0,
			};


			for (let status in statusData) {
				let statusItem = statusData[status];
				if (status === "已下单") {
					// 已下单
					fieldData.create_total_amount += statusItem.total_fee;
					fieldData.create_order_count += statusItem.order_count;
					fieldData.create_user_count += statusItem.user_count;
					fieldData.create_device_count += statusItem.device_count;
				} else if (status === "已付款") {
					// 已付款
					fieldData.pay_total_amount += statusItem.total_fee;
					fieldData.pay_order_count += statusItem.order_count;
					fieldData.pay_user_count += statusItem.user_count;
					fieldData.pay_device_count += statusItem.device_count;
				} else if (status === "已退款") {
					// 已退款
					fieldData.refund_total_amount += statusItem.total_fee;
					fieldData.refund_order_count += statusItem.order_count;
					fieldData.refund_user_count += statusItem.user_count;
					fieldData.refund_device_count += statusItem.device_count;
				}
			}
			// 平台信息
			let platformInfo = null;
			if (this.platforms && this.platforms[platform]) {
				// 从缓存中读取数据
				platformInfo = this.platforms[platform]
			} else {
				const platformObj = new Platform()
				platformInfo = await platformObj.getPlatformAndCreate(platform, null)
				if (!platformInfo || platformInfo.length === 0) {
					platformInfo._id = ''
				}
				this.platforms[platform] = platformInfo;
			}
			// 渠道信息
			let channelInfo = null
			const channelKey = appid + '_' + platformInfo._id + '_' + channel;
			if (this.channels && this.channels[channelKey]) {
				channelInfo = this.channels[channelKey];
			} else {
				const channelObj = new Channel()
				channelInfo = await channelObj.getChannelAndCreate(appid, platformInfo._id, channel)
				if (!channelInfo || channelInfo.length === 0) {
					channelInfo._id = ''
				}
				this.channels[channelKey] = channelInfo
			}
			// 版本信息
			let versionInfo = null
			const versionKey = appid + '_' + platform + '_' + version
			if (this.versions && this.versions[versionKey]) {
				versionInfo = this.versions[versionKey]
			} else {
				const versionObj = new Version()
				versionInfo = await versionObj.getVersionAndCreate(appid, platform, version)
				if (!versionInfo || versionInfo.length === 0) {
					versionInfo._id = ''
				}
				this.versions[versionKey] = versionInfo
			}
			let countWhereJson = {
				create_time: _.gte(start_time).lte(end_time),
				appid,
				version,
				platform: _.in(getUniPlatform(platform)),
				channel,
			};
			// 活跃设备数量
			let activity_device_count = await dao.uniStatSessionLogs.groupCount(countWhereJson);
			// 活跃用户数量
			let activity_user_count = await dao.uniStatUserSessionLogs.groupCount(countWhereJson);

			/*
			// TODO 此处有问题，暂不使用
			// 新设备数量
			let new_device_count = await dao.uniStatSessionLogs.groupCount({
				...countWhereJson,
				is_first_visit: 1,
			});
			// 新注册用户数量
			let new_user_count = await dao.uniIdUsers.count({
				register_date: _.gte(start_time).lte(end_time),
				register_env: {
					appid,
					app_version: version,
					uni_platform: _.in(getUniPlatform(platform)),
					channel,
				}
			});


			// 新注册用户中下单的人数
			let new_user_create_order_count = await dao.uniIdUsers.countNewUserOrder({
				whereJson: {
					register_date: _.gte(start_time).lte(end_time),
					register_env: {
						appid,
						app_version: version,
						uni_platform: _.in(getUniPlatform(platform)),
						channel,
					}
				},
				status: [-1, 0]
			});
			// 新注册用户中支付成功的人数
			let new_user_pay_order_count = await dao.uniIdUsers.countNewUserOrder({
				whereJson: {
					register_date: _.gte(start_time).lte(end_time),
					register_env: {
						appid,
						app_version: version,
						uni_platform: _.in(getUniPlatform(platform)),
						channel,
					}
				},
				status: [1, 2, 3]
			}); */


			saveList.push({
				appid,
				platform_id: platformInfo._id,
				channel_id: channelInfo._id,
				version_id: versionInfo._id,
				dimension,
				create_date: Date.now(), // 记录下当前时间
				start_time,
				end_time,
				stat_date: getNowDate(start_time, 8, dimension),
				...fieldData,
				activity_user_count,
				activity_device_count,
				// new_user_count,
				// new_device_count,
				// new_user_create_order_count,
				// new_user_pay_order_count,
			});
		}
		if (this.debug) console.log('saveList: ', saveList)
		//return;
		if (saveList.length > 0) {
			res = await dao.uniStatPayResult.adds(saveList);
		}
		if (debug) {
			let runEndTime = Date.now();
			console.log(`耗时：${((runEndTime - runStartTime ) / 1000).toFixed(3)} 秒`)
			console.log(`本次共添加：${saveList.length } 条记录`)
			console.log(`-----------------支付统计结束（${dimension}）-----------------`);
		}
		return res
	}

}


function getUniPlatform(platform) {
	let list = [];
	if (["h5", "web"].indexOf(platform) > -1) {
		list = ["h5", "web"];
	} else if (["app-plus", "app"].indexOf(platform) > -1) {
		list = ["app-plus", "app"];
	} else {
		list = [platform];
	}
	return list;
}

function getNowDate(date = new Date(), targetTimezone = 8, dimension) {
	if (typeof date === "string" && !isNaN(date)) date = Number(date);
	if (typeof date == "number") {
		if (date.toString().length == 10) date *= 1000;
		date = new Date(date);
	}
	const {
		year,
		month,
		day,
		hour,
		minute,
		second
	} = getFullTime(date);
	// 现在的时间
	let date_str;
	if (dimension === "month") {
		date_str = timeFormat(date, "yyyy-MM", targetTimezone);
	} else if (dimension === "quarter") {
		date_str = timeFormat(date, "yyyy-MM", targetTimezone);
	} else if (dimension === "year") {
		date_str = timeFormat(date, "yyyy", targetTimezone);
	} else {
		date_str = timeFormat(date, "yyyy-MM-dd", targetTimezone);
	}
	return {
		date_str,
		year,
		month,
		day,
		hour,
		//minute,
		//second,
	};
}

function getFullTime(date = new Date(), targetTimezone = 8) {
	if (!date) {
		return "";
	}
	if (typeof date === "string" && !isNaN(date)) date = Number(date);
	if (typeof date == "number") {
		if (date.toString().length == 10) date *= 1000;
		date = new Date(date);
	}
	const dif = date.getTimezoneOffset();
	const timeDif = dif * 60 * 1000 + (targetTimezone * 60 * 60 * 1000);
	const east8time = date.getTime() + timeDif;
	date = new Date(east8time);

	let YYYY = date.getFullYear() + '';
	let MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
	let DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
	let hh = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours());
	let mm = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes());
	let ss = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds());
	return {
		YYYY: Number(YYYY),
		MM: Number(MM),
		DD: Number(DD),
		hh: Number(hh),
		mm: Number(mm),
		ss: Number(ss),

		year: Number(YYYY),
		month: Number(MM),
		day: Number(DD),
		hour: Number(hh),
		minute: Number(mm),
		second: Number(ss),
	};
};


/**
 * 日期格式化
 */
function timeFormat(time, fmt = 'yyyy-MM-dd hh:mm:ss', targetTimezone = 8) {
	try {
		if (!time) {
			return "";
		}
		if (typeof time === "string" && !isNaN(time)) time = Number(time);
		// 其他更多是格式化有如下:
		// yyyy-MM-dd hh:mm:ss|yyyy年MM月dd日 hh时MM分等,可自定义组合
		let date;
		if (typeof time === "number") {
			if (time.toString().length == 10) time *= 1000;
			date = new Date(time);
		} else {
			date = time;
		}

		const dif = date.getTimezoneOffset();
		const timeDif = dif * 60 * 1000 + (targetTimezone * 60 * 60 * 1000);
		const east8time = date.getTime() + timeDif;

		date = new Date(east8time);
		let opt = {
			"M+": date.getMonth() + 1, //月份
			"d+": date.getDate(), //日
			"h+": date.getHours(), //小时
			"m+": date.getMinutes(), //分
			"s+": date.getSeconds(), //秒
			"q+": Math.floor((date.getMonth() + 3) / 3), //季度
			"S": date.getMilliseconds() //毫秒
		};
		if (/(y+)/.test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
		}
		for (let k in opt) {
			if (new RegExp("(" + k + ")").test(fmt)) {
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (opt[k]) : (("00" + opt[k]).substr(("" + opt[k]).length)));
			}
		}
		return fmt;
	} catch (err) {
		// 若格式错误,则原值显示
		return time;
	}
};
