'use strict';
let uniID = require('uni-id')
const uniCaptcha = require('uni-captcha')
const createConfig = require('uni-config-center')
const uniIdConfig = createConfig({
	pluginId: 'uni-id'
}).config()
const db = uniCloud.database()
const dbCmd = db.command
const usersDB = db.collection('uni-id-users')
exports.main = async (event, context) => {
	//UNI_WYQ:这里的uniID换成新的，保证多人访问不会冲突
	uniID = uniID.createInstance({
		context
	})
	console.log('event : ' + JSON.stringify(event))
	/*
	1.event为客户端 uniCloud.callFunction填写的data的值，这里介绍一下其中的属性
	  action：表示要执行的任务名称、比如：登陆login、退出登陆 logout等
	  params：业务数据内容
	  uniIdToken：系统自动传递的token，数据来源客户端的 uni.getStorageSync('uni_id_token')
	*/
	const {
		action,
		uniIdToken,
		inviteCode
	} = event;
	const deviceInfo = event.deviceInfo || {};
	let params = event.params || {};
	/*
	2.在某些操作之前我们要对用户对身份进行校验（也就是要检查用户的token）再将得到的uid写入params.uid
	  校验用到的方法是uniID.checkToken 详情：https://uniapp.dcloud.io/uniCloud/uni-id?id=checktoken

	  讨论，我们假设一个这样的场景，代码如下。
	  如：
		uniCloud.callFunction({
			name:"xxx",
			data:{
				"params":{
					uid:"通过某种方式获取来的别人的uid"
				}
			}
		})
	  用户就这样轻易地伪造了他人的uid传递给服务端，有一句话叫：前端从来的数据是不可信任的
	  所以这里我们需要将uniID.checkToken返回的uid写入到params.uid
	*/
	let noCheckAction = ['register', 'checkToken', 'login', 'logout', 'sendSmsCode', 'createCaptcha',
		'verifyCaptcha', 'refreshCaptcha', 'inviteLogin', 'loginByWeixin', 'loginByUniverify',
		'loginByApple', 'loginBySms', 'resetPwdBySmsCode', 'registerAdmin'
	]
	if (!noCheckAction.includes(action)) {
		if (!uniIdToken) {
			return {
				code: 403,
				msg: '缺少token'
			}
		}
		let payload = await uniID.checkToken(uniIdToken)
		if (payload.code && payload.code > 0) {
			return payload
		}
		params.uid = payload.uid
	}

	//禁止前台用户传递角色
	if (action.slice(0,7) == "loginBy") {
		if (params.role) {
			return {
				code: 403,
				msg: '禁止前台用户传递角色'
			}
		}
	}

	//3.注册成功后创建新用户的积分表方法
	async function registerSuccess(uid) {
		//用户接受邀请
		if(inviteCode){
			await uniID.acceptInvite({inviteCode,uid});
		}
		//添加当前用户设备信息
		await db.collection('uni-id-device').add({
			...deviceInfo,
			user_id: uid
		})
		await db.collection('uni-id-scores').add({
			user_id: uid,
			score: 1,
			type: 1,
			balance: 1,
			comment: "",
			create_date: Date.now()
		})
	}
	//4.记录成功登录的日志方法
	const loginLog = async (res = {}) => {
		if(res.code != 0){
			return false
		}
		const now = Date.now()
		const uniIdLogCollection = db.collection('uni-id-log')
		let logData = {
			deviceId: params.deviceId || context.DEVICEID,
			ip: params.ip || context.CLIENTIP,
			type: res.type,
			ua: context.CLIENTUA,
			create_date: now
		};

		Object.assign(logData,
			res.code === 0 ? {
				user_id: res.uid,
				state: 1
			} : {
				state: 0
			})
		if (res.type == 'register') {
			await registerSuccess(res.uid)
		} else {
			if (Object.keys(deviceInfo).length) {
				console.log(979797,{deviceInfo,user_id: res});
				//更新当前用户设备信息
				await db.collection('uni-id-device').where({
					user_id: res.uid
				}).update(deviceInfo)
			}
		}
		return await uniIdLogCollection.add(logData)
	}

	let res = {}
	switch (action) { //根据action的值执行对应的操作
		case 'bindMobileByUniverify':
			let {
				appid, apiKey, apiSecret
			} = uniIdConfig.service.univerify
			let univerifyRes = await uniCloud.getPhoneNumber({
				provider: 'univerify',
				appid,
				apiKey,
				apiSecret,
				access_token: params.access_token,
				openid: params.openid
			})
			if (univerifyRes.code === 0) {
				res = await uniID.bindMobile({
					uid: params.uid,
					mobile: univerifyRes.phoneNumber
				})
				res.mobile = univerifyRes.phoneNumber
			}
			break;
		case 'bindMobileBySms':
			// console.log({
			// 	uid: params.uid,
			// 	mobile: params.mobile,
			// 	code: params.code
			// });
			res = await uniID.bindMobile({
				uid: params.uid,
				mobile: params.mobile,
				code: params.code
			})
			// console.log(res);
			break;
		case 'register':
			var {username, password, nickname} = params
			if (/^1\d{10}$/.test(username)) {
				return {
					code: 401,
					msg: '用户名不能是手机号'
				}
			};
			if (/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(username)) {
				return {
					code: 401,
					msg: '用户名不能是邮箱'
				}
			}
			res = await uniID.register({username, password, nickname,inviteCode});
			if (res.code === 0) {
				await registerSuccess(res.uid)
			}
			break;
		case 'login':
			//防止黑客恶意破解登录，连续登录失败一定次数后，需要用户提供验证码
			const getNeedCaptcha = async () => {
				//当用户最近“2小时内(recordDate)”登录失败达到2次(recordSize)时。要求用户提交验证码
				const now = Date.now(),
					recordDate = 120 * 60 * 1000,
					recordSize = 2;
				const uniIdLogCollection = db.collection('uni-id-log')
				let recentRecord = await uniIdLogCollection.where({
						deviceId: params.deviceId || context.DEVICEID,
						create_date: dbCmd.gt(now - recordDate),
						type: 'login'
					})
					.orderBy('create_date', 'desc')
					.limit(recordSize)
					.get();
				return recentRecord.data.filter(item => item.state === 0).length === recordSize;
			}

			let passed = false;
			let needCaptcha = await getNeedCaptcha();
			console.log('needCaptcha', needCaptcha);
			if (needCaptcha) {
				res = await uniCaptcha.verify({
					...params,
					scene: 'login'
				})
				if (res.code === 0) passed = true;
			}

			if (!needCaptcha || passed) {
				res = await uniID.login({
					...params,
					queryField: ['username', 'email', 'mobile']
				});
				await loginLog(res);
				needCaptcha = await getNeedCaptcha();
			}

			res.needCaptcha = needCaptcha;
			break;
		case 'loginByWeixin':
			res = await uniID.loginByWeixin(params);
			await uniID.updateUser({
				uid: res.uid,
				username: "微信用户"
			});
			res.userInfo.username = "微信用户"
			await loginLog(res)
			break;
		case 'loginByUniverify':
			res = await uniID.loginByUniverify(params)
			await loginLog(res)
			break;
		case 'loginByApple':
			res = await uniID.loginByApple(params)
			await loginLog(res)
			break;
		case 'checkToken':
			res = await uniID.checkToken(uniIdToken);
			break;
		case 'logout':
			res = await uniID.logout(uniIdToken)
			break;
		case 'sendSmsCode':
			/* -开始- 测试期间，为节约资源。统一虚拟短信验证码为： 123456；开启以下代码块即可  */
				// return uniID.setVerifyCode({
				// 	mobile: params.mobile,
				// 	code: '123456',
				// 	type: params.type
				// })
			/* -结束- */

			// 简单限制一下客户端调用频率
			const ipLimit = await db.collection('opendb-verify-codes').where({
				ip: context.CLIENTIP,
				created_at: dbCmd.gt(Date.now() - 60000)
			}).get()
			if (ipLimit.data.length > 0) {
				return {
					code: 429,
					msg: '请求过于频繁'
				}
			}
			const templateId = '11753' // 替换为自己申请的模板id
			if (!templateId) {
				return {
					code: 500,
					msg: 'sendSmsCode需要传入自己的templateId，参考https://uniapp.dcloud.net.cn/uniCloud/uni-id?id=sendsmscode'
				}
			}
			const randomStr = '00000' + Math.floor(Math.random() * 1000000)
			const code = randomStr.substring(randomStr.length - 6)
			res = await uniID.sendSmsCode({
				mobile: params.mobile,
				code,
				type: params.type,
				templateId
			})
			break;
		case 'loginBySms':
			if (!params.code) {
				return {
					code: 500,
					msg: '请填写验证码'
				}
			}
			if (!/^1\d{10}$/.test(params.mobile)) {
				return {
					code: 500,
					msg: '手机号码填写错误'
				}
			}
			res = await uniID.loginBySms(params)
			await loginLog(res)
			break;
		case 'resetPwdBySmsCode':
			if (!params.code) {
				return {
					code: 500,
					msg: '请填写验证码'
				}
			}
			if (!/^1\d{10}$/.test(params.mobile)) {
				return {
					code: 500,
					msg: '手机号码填写错误'
				}
			}
			params.type = 'login'
			let loginBySmsRes = await uniID.loginBySms(params)
			// console.log(loginBySmsRes);
			if (loginBySmsRes.code === 0) {
				res = await uniID.resetPwd({
					password: params.password,
					"uid": loginBySmsRes.uid
				})
			} else {
				return loginBySmsRes
			}
			break;
		case 'getInviteCode':
			res = await uniID.getUserInfo({
				uid: params.uid,
				field: ['my_invite_code']
			})
			if (res.code === 0) {
				res.myInviteCode = res.userInfo.my_invite_code
				delete res.userInfo
			}
			break;
		case 'getInvitedUser':
			res = await uniID.getInvitedUser(params)
			break;
		case 'updatePwd':
			res = await uniID.updatePwd(params)
			break;
		case 'createCaptcha':
			res = await uniCaptcha.create(params)
			break;
		case 'refreshCaptcha':
			res = await uniCaptcha.refresh(params)
			break;
		case 'getUserInviteCode':
			res = await uniID.getUserInfo({
				uid: params.uid,
				field: ['my_invite_code']
			})
			if (!res.userInfo.my_invite_code) {
				res = await uniID.setUserInviteCode({
					uid: params.uid
				})
			}
			break;

			// -----------  admin api  -----------
		case 'registerAdmin':
			var {
				username, password
			} = params
			let {
				total
			} = await db.collection('uni-id-users').where({
				role: 'admin'
			}).count()
			if (total) {
				return {
					code: 10001,
					message: '超级管理员已存在，请登录...'
				}
			}
			return uniID.register({
				username,
				password,
				role: ["admin"]
			})
			break;
		case 'registerUser':
			const {
				userInfo
			} = await uniID.getUserInfo({
				uid: params.uid
			})
			if (userInfo.role.indexOf('admin') === -1) {
				res = {
					code: 403,
					message: '非法访问, 无权限注册超级管理员',
				}
			} else {
				res = await uniID.register({
					...params
				})
				if (res.code === 0) {
					delete res.token
					delete res.tokenExpired
				}
			}
			break;
		case 'getCurrentUserInfo':
			res = uniID.getUserInfo({
				uid: params.uid,
				...params
			})
			break;
		default:
			res = {
				code: 403,
				msg: '非法访问'
			}
			break;
	}
	//返回数据给客户端
	return res
}
