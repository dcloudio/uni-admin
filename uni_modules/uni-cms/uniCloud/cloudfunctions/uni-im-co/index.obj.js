// 云对象教程: https://uniapp.dcloud.net.cn/uniCloud/cloud-obj
// jsdoc语法提示教程：https://ask.dcloud.net.cn/docs/#//ask.dcloud.net.cn/article/129
const db = uniCloud.database();
// 会话表
const conversationTable = db.collection('uni-im-conversation')
// 消息表
const msgTable = db.collection('uni-im-msg')
// 群成员表
const groupMemberTable = db.collection('uni-im-group-member')
// 用户表
const usersTable = db.collection('uni-id-users')
// uni-id公共模块
const uniIdCommon = require('uni-id-common')
const dbCmd = db.command
const $ = dbCmd.aggregate

// 哈希算法，用于生成会话id
const md5 = require("md5");

// 获取uni-im配置
const createConfig = require("uni-config-center");
const uniImConfig = createConfig({
	pluginId: 'uni-im', // 插件id
})

// about ai - start
async function chatCompletion({messages,summarize=false}) {
	// console.log('messagesmessages',messages)
	const llmManager = uniCloud.ai.getLLMManager()
	let res = await llmManager.chatCompletion({
		messages,
		maxTokens:3000
	})
	// console.error('totalTokens',res,res.usage.totalTokens);
	if(!summarize && res.usage.totalTokens > 500){
		messages.push({
			"content": res.reply,
			"role": "assistant"
		},{
			"content": "请简要总结上述全部对话",
			"role": "user"
		})
		// console.log('messages------->',messages)
		let {reply} = await chatCompletion({messages,summarize:true})
		res.summarize = reply
		// console.log('res.summarize = reply',res.summarize)
	}
	return res
}
// about ai - end

module.exports = {
	// async chatCompletion(param){
	// 	return await chatCompletion(param)
	// },
	async sendMsgToAi({messages,user_id,appId,askInfo}){
		if (this.getClientInfo().source != 'function') {
			throw new Error('仅支持云函数，调用此云函数')
		}
		let aiRes = await chatCompletion({messages})
		// console.log('aiRes',aiRes)
		aiRes = await uniCloud.importObject('uni-im-co').sendMsg({
			type: 'text',
			body:aiRes.reply,
			ai_summarize:aiRes.summarize,
			to_uid: user_id,
			from_uid: 'uni-ai',
			state: 0,
			appId,
			ext:{askInfo}
		},'uni-ai') // 末尾的'uni-ai'表示发起请求的uid
		// console.log('aiRes',aiRes)
	},
	async _before() {
		// 获取客户端信息
		this.clientInfo = this.getClientInfo()
		// console.log(this.clientInfo);
		// 定义uni-id公共模块对象
		this.uniIdCommon = uniIdCommon.createInstance({
			clientInfo: this.clientInfo
		})

		// 指定需要使用当前用户身份id的云对的方法名称，即：需要验证用户的token信息
		const needLoginMethodName = [
			"sendMsg",
			"revokeMsg",
			"addFriendInvite",
			"getJoinGroupList",
			"getConversationList",
			"chooseUserIntoGroup"
		]

		if (
			needLoginMethodName.includes(this.getMethodName())
		) {
			// 云函数互调时，免校验token直接使用传来的用户id
			if (this.getClientInfo().source == 'function') {
				this.current_uid = this.getParams()[1]
			}else{
				let res = await this.uniIdCommon.checkToken(this.clientInfo.uniIdToken)
				if (res.errCode) {
					// 如果token校验出错，则抛出错误
					throw res
				}else{
					// 通过token校验则，拿去用户id
					this.current_uid = res.uid
				}
			}
		}

		// 提醒用户需要连接云端云函数

		// if(this.getMethodName() == 'sendMsg' && this.clientInfo.clientIP == "127.0.0.1"){
		// 	throw {
		// 		errSubject: 'uni-im-co-sendMsg',
		// 		errCode: "uni-im-co-sendMsg-error",
		// 		errMsg: '发送消息方法，仅限连接云端云函数使用（在HBuilderX uniCloud控制台切换）'
		// 	}
		// }

		// 封装push方法
		this.sendPushMsg = async (param, appId) => {
			let pushParam = {
				// 验证token是否有效，无效则不向此设备推送消息
				check_token: true,
				settings: {
					//-1表示不设离线，因为离线后重新打开数据统一从数据库中拉取。否则会重复
					ttl: -1
				},
				// 离线推送厂商信息配置，需要到云厂商后台申请
				channel: {
					// 华为离线推送
					"HW": "NORMAL",
					// 小米离线推送
					"XM": "high_system"
				}
			}
			/**
			 * 如果不指定接收消息的客户端appid，则指定为消息推送者的客户端appid。
			 * 用于两个客户端appid不同的场景，比如电商项目，商家和普通用户端appid不同
			 */
			if (!appId) {
				appId = this.clientInfo.appId
				if (!appId) {
					throw new Error('appId is not definded')
				}
			}
			pushParam = Object.assign(pushParam, param)

			// 如果是im通知消息（比如：加好友申请，用户请求加群，用户退群等），则记录到数据表uni-im-notification中
			if (param.payload.type == "uni-im-notification") {
				let {title,content,payload,sound,open_url,path,user_id} = pushParam
				let notificationContent = {title,content,payload,sound,open_url,path}
				notificationContent.is_read = false
				notificationContent.create_time = Date.now()
				let notificationData;
				// 如果接收消息的用户量不止一个，则需要插入数据表的记录为多条（数组）
				if(Array.isArray(user_id)){
					notificationData = user_id.map(uid=>{
						return {
							user_id:uid,
							...notificationContent
						}
					})
				}else{
					notificationData = Object.assign(notificationContent,{user_id})
				}
				// 执行写入到数据库
				let uinRes = await db.collection('uni-im-notification').add(notificationData)
				// console.log('uinRes',uinRes)
			}

			let res;
			// 如果是本地调试，就走url化之后的push
			if(this.clientInfo.clientIP == "127.0.0.1"){
				console.log('检测到当前为本地调试，消息推送将通过url化后的云对象执行（执行速度相比正式项目较慢）')
				console.log('如调用失败，请检查：url链接是否与你在web控制台（https://unicloud.dcloud.net.cn/）配置的一致')
				let url = "https://fc-mp-3695f427-280f-498a-90ec-0997e7427f30.next.bspapp.com/uni-im-co/pushByDebug"
				res = await uniCloud.httpclient.request(url,{
					method:"POST",
					data:{
						appId,
						pushParam
					},
					dataType:"json",
					contentType:"json"
				})
				res = res.data
				console.log('http to push res',res);
			}else{
				res = await uniCloud.getPushManager({
					appId
				}).sendMessage(pushParam)
			}
			if (res.errCode) {
				if (res.errCode == "uni-push-user-invalid") {
					//可能因为用户长时间没有登录导致的cid过期而发送失败，但是此时已将离线数据写入数据库，登录后可获取。客户端不需要进入 catch
					res = {
						data: {
							"uni-push-err-res": res
						},
						errCode: 0
					}
				} else {
					console.log(res.errCode);
					throw new Error(res.errMsg)
				}
			}
			return res
		}
	},
	_after(error, result) {
		if(error){
			console.log({error, result});
			if(error.errCode && error.errMsg) {
				// 符合响应体规范的错误，直接返回
				return error
			}else{
				throw error // 直接抛出异常
			}
		}
		return result
	},
	// 获取会话列表
	async getConversationList({
		// 会话条数
		limit = 500,
		// 最大的会话更新时间
		maxUpdateTime = false,
		// 不为false则表示获取指定的会话
		conversation_id = false
	}) {
		let matchObj = {
			// 限制只能查询当前用户自己的会话记录
			"user_id": this.current_uid,
			// "group_id": dbCmd.exists(false), //是否查询群聊会话
		}
		if (conversation_id) {
			matchObj.id = conversation_id
		} else if (maxUpdateTime) {
			matchObj.update_time = dbCmd.lt(maxUpdateTime)
		}

		let res = await conversationTable.aggregate()
			.sort({
				// 根据更新时间倒序
				update_time: -1
			})
			.match(matchObj)
			.limit(limit)
			// 联查获得最新的对话记录
			.lookup({
				from: "uni-im-msg",
				let: {
					id: '$id'
				},
				pipeline: $.pipeline()
					.match(
						dbCmd.expr($.eq(['$conversation_id', '$$id']))
					)
					.sort({
						create_time: -1
					})
					.limit(1)
					.project({
						_id: 1,
						type: 1,
						body: 1,
						to_uid: 1,
						is_read: 1,
						from_uid: 1,
						create_time: 1,
						conversation_id: 1
					})
					.done(),
				as: 'msgList'
			})
			// 联查获得对话的用户信息
			.lookup({
				from: "uni-id-users",
				let: {
					friend_uid: '$friend_uid'
				},
				pipeline: $.pipeline()
					.match(
						dbCmd.expr($.eq(['$_id', '$$friend_uid']))
					)
					.limit(1)
					.project({
						_id: 1,
						avatar_file: 1,
						nickname: 1
					})
					.done(),
				as: 'user_info'
			})
			// 联查获得对话的群信息
			.lookup({
				from: "uni-im-group",
				let: {
					group_id: '$group_id'
				},
				pipeline: $.pipeline()
					.match(
						dbCmd.expr($.eq(['$_id', '$$group_id']))
					)
					.project({
						user_id: 1,
						name: 1,
						introduction: 1,
						notification: 1,
						avatar_file: 1,
						join_option: 1
					})
					.done(),
				as: 'group_info'
			})
			.end()
		return {
			data: res.data,
			errCode: 0
		}
	},
	// 发送消息方法（含：单聊和群聊）
	async sendMsg(params, context) {

		// AI 场景下特殊处理
		let aiMsgBody = params.body
		// 暂时以接收者为 to_uid =='uni-ai' 为 ai通讯
		if(params.to_uid == 'uni-ai'){
			let {body} = params
			params.body = body[body.length-1].content
		}

		let {
			// 指定接收消息的用户id
			to_uid,
			// 指定接收消息的群id
			group_id,
			// 消息内容
			body,
			// 消息类型
			type,
			// 是否为失败 重试
			isRetries,
			// 接收消息的客户端的DCloud appid
			appId,
			// 回复关联的消息的id
			about_msg_id,
			ai_summary // AI总结对话的内容（节约ai token使用）
		} = params

		// 校验参数是否合法
		check_param(params,{
			"required": ["body", "type", "appId"],
			"type": {
				to_uid: ["String"],
				group_id: ["String"],
				body: ["String", "Object"],
				type: ["String"],
				isRetries: ["Boolean"],
				appId: ["String"],
				about_msg_id:['String'],
				ai_summary:['String'] // AI场景下使用
			}
		})

		// 补充特殊校验
		if (!to_uid && !group_id) {
			throw new Error('接收消息的用户id和群id最少指定一个') // alert：否则表示将消息群发
		}

		//发送者身份id
		const from_uid = this.current_uid

		/** 读取配置的对话等级，校验是否有权发送消息
		 * 	0	-	任何人可以发起会话
		 *	100	-	客服 or 好友或者群成员
		 *	200	-	必须是好友或者群成员
		**/
		const conversation_grade = uniImConfig.config('conversation_grade')

		// 客服模式下，如果配置的客服id。则只能向客服发起会话
		async function chatToCustomerService() {
			const customer_service_uids = uniImConfig.config('customer_service_uids_uids')
			if (customer_service_uids) {
				if (typeof customer_service_uids == 'string') {
					customer_service_uids = [customer_service_uids]
				}
				if (
					!(customer_service_uids.includes(from_uid) || customer_service_uids.includes(to_uid))
				) {
					throw new Error('非法通讯，会话双方用户id，均不属于uni-im-co中配置的customer_service_uids')
				}
			}
			return true
		}
		// 只能是好友关系，或者群成员才能发送
		async function chatToFriendOrGroupMember() {
			if (group_id) {
				let {
					data: [has]
				} = await db.collection('uni-im-group-member')
					.where({
						group_id,
						user_id: this.current_uid
					})
					.get()
				if (!has) {
					throw new Error('非群成员不能发起会话')
				}
			}
			if (to_uid) {
				let {
					data: [has]
				} = await db.collection('uni-im-friend')
					.where({
						friend_uid: to_uid,
						user_id: this.current_uid
					})
					.get()
				if (!has) {
					throw new Error('非好友不能发起会话')
				}
			}
			return true
		}

		switch (conversation_grade) {
			case 0:
				//任何人可以发起会话，不校验
				break;
			case 100:
				// 客服 or 好友或者群成员
				try {
					await chatToCustomerService()
				} catch (error) {
					console.error(error)
					await chatToFriendOrGroupMember()
				}
				break;
			case 200:
				// 必须是好友或者群成员
				await chatToFriendOrGroupMember()
				break;
			default:
				break;
		}

		// 生成会话id
		const conversation_id = group_id ? 'group_' + group_id : getConversationId([from_uid, to_uid])

		// 构建基本消息内容
		const msgData = {
			body,
			type,
			from_uid,
			to_uid,
			//是否已读，默认为：false
			is_read: false,
			//创建时间
			create_time: Date.now(),
			conversation_id,
			group_id,
			appid:appId ,//接收消息的appid（撤回消息时会用到）
			about_msg_id
		}

		// 设置会话 最后一条消息 的描述。文本=>文本的前30个字 其他=>消息类型
		let last_msg_note = '[多媒体]'
		if (type == 'text') {
			last_msg_note = body.toString()
			last_msg_note = last_msg_note.replace(/[\r\n]/g, "");
			last_msg_note = last_msg_note.slice(0, 30)
		}else{
			last_msg_note = {
				"image": "[图片]",
				"sound": "语音",
				"video": "[视频]",
				"file": "文件",
				"location": "位置"
			} [type]
		}

		// 查会话表是否存在
		let {
			data: [conversation]
		} = await conversationTable.where({
			id: conversation_id
		}).get()

		// 如果没有，需要先创建会话记录
		if (!conversation) {
			// 1.消息接收者 会话数据
			let data1 = {
				id: conversation_id,
				type: msgData.group_id ? 2 : 1,
				user_id: msgData.to_uid,
				friend_uid: msgData.from_uid,
				group_id: msgData.group_id,
				unread_count: 1,
				last_msg_note,
				update_time: msgData.create_time
			}
			// 2.消息发送者 会话数据
			let data2 = {
				...data1,
				unread_count: 0,
				user_id: msgData.from_uid,
				friend_uid: msgData.to_uid
			}
			let res = await conversationTable.add([data1, data2])
			// console.log(res);
		} else {
			// 对方的会话表更新，并且未读数+1
			let res = await conversationTable.where({
				id: conversation_id,
				user_id: to_uid
			}).update({
				unread_count: dbCmd.inc(1),
				last_msg_note,
				update_time: msgData.create_time
			})
			// console.log(res);
			//自己的会话表更新。仅更新最后一条消息的时间和内容
			res = await conversationTable.where({
				id: conversation_id,
				user_id: from_uid
			}).update({
				last_msg_note,
				update_time: msgData.create_time
			})
			// console.log(res);
		}
		// console.log({
		// 	...msgData,
		// 	conversation_id
		// });

		// 将消息内容存到数据库，点击重发按钮的除外
		if (!isRetries) {
			let res = await msgTable.add({
				...msgData,
				conversation_id
			})
			msgData._id = res.id
			// console.log('msgTable msgData:', res);
		}

		if(to_uid =='uni-ai'){
			uniCloud.importObject('uni-im-co').sendMsgToAi({
				messages:aiMsgBody, //原始body数据，ai接受的格式为数组
				user_id:msgData.from_uid,
				appId,
				askInfo:{
					client_create_time:params.client_create_time,
					msgId:msgData._id,
					device_id: this.clientInfo.deviceId // 发送消息的设备（客户端）id，阻止当前用户收到自己发的消息
				}
			})
			// 等待500毫秒，给一个请求发出去的时间
			await new Promise((resolve, reject) => {
				setTimeout(() => {
					resolve()
				}, 500)
			})
			// 返回云端消息记录创建的时间和id
			return {
				"errCode":0,
				"data":{
					"create_time":msgData.create_time,
					"_id":msgData._id
				}
			}
		}

		// 处理超长文本，push发送不了的问题
		if (msgData.body.length > 250) {
			// 截断，但标识消息为长文本消息，客户端收到此标识，会从数据库中拉取完整消息内容
			msgData.body = msgData.body.slice(0, 50)
			msgData.LongMsg = true
		}

		// 查询消息发送者的头像和昵称
		const dbJQL = uniCloud.databaseForJQL({
			clientInfo: this.clientInfo
		})
		let res = await dbJQL.collection('uni-id-users')
			.doc(from_uid)
			.field('_id,nickname,avatar_file')
			.get()

		let {
			nickname,
			avatar_file
		} = res.data[0]

		let title = nickname.slice(0, 20)
		let content = msgData.type == 'text' ? msgData.body : '[多媒体]'

		// 定义推送参数
		let pushParam = {
			"user_id": msgData.to_uid,
			"payload": {
				type: "uni-im",
				data: msgData,
				title, // "收到im消息，在线时显示的标题",
				content, // "在线时显示的副标题",
				avatar_file, //头像文件对象,
				device_id: this.clientInfo.deviceId, // 发送消息的设备（客户端）id，阻止当前用户收到自己发的消息
				ext:params.ext
			},
			title: title.slice(0, 20), // "收到im消息，离线时显示的标题",
			content: content.slice(0, 50) //"离线时显示的内容"
		}

		if (msgData.to_uid) {
			//单聊，直接调用before中封装好的消息推送方法
			res = await this.sendPushMsg(pushParam, appId)
			// console.log('sendMessage', JSON.stringify(res))

			/*
			//判断是否已经有客户端接收到消息，注意：收到不等于已读
			let taskData = res.data[Object.keys(res.data)]
			let state = false;
			for (let key in taskData) {
				if (taskData[key] == 'successed_online') {
					state = true
					break
				}
			}
			console.log('state : ============> ' + state);*/
		} else if (msgData.group_id) {
			// 如果是群聊则调用sendMsgToGroup云方法，递归发送（500个为用户一批）
			uniCloud.importObject('uni-im-co')
			.sendMsgToGroup({
				pushParam,
				appId
			})
			// 等待500毫秒，给一个请求发出去的时间
			await new Promise((resolve, reject) => {
				setTimeout(() => {
					resolve()
				}, 500)
			})
		} else {
			throw new Error('接受者标识，不能为空')
		}

		if (!res.data) {
			res.data = {}
		}

		// 返回云端消息记录创建的时间
		res.data.create_time = msgData.create_time
		// 返回云端消息记录的id
		res.data._id = msgData._id
		return res
	},
	async sendPushMsg(pushParam, appId) {
		// 注意：这是用于在触发器中调用推送的方法。不是this.sendPushMsg调用的方法，this.sendPushMsg定义在before中
		if (this.getClientInfo().source != 'function') {
			return {
				errSubject: 'uni-im-co',
				errCode: 0,
				errMsg: '该方法仅支持云对象的方法，或者触发器调用'
			}
		}
		// console.log('pushParam', pushParam);
		return await this.sendPushMsg(pushParam, appId)
	},
	async sendMsgToGroup({
		pushParam,
		before_id,
		push_clientids = [],
		member = [],
		appId
	}) {
		// 注意：这是一个递归云对象，用递归的方式处理批量任务
		const limit = 500 //腾讯云收费版服务空间可以改成 1000
		if (this.getClientInfo().source != 'function') {
			return {
				errSubject: 'uni-im-co',
				errCode: 0,
				errMsg: '该方法仅支持云对象的方法，或者触发器调用'
			}
		}

		// console.log('sendMsgToGroup=========', {
		// 	pushParam,
		// 	before_id,
		// 	push_clientids
		// });

		if (before_id || push_clientids) {
			// console.log({
			// 	before_id,
			// 	push_clientids
			// });
			// return 123
		}

		if (push_clientids.length === 0) {
			// console.log('开始查库', push_clientids.length, push_clientids);
			let group_id = pushParam.payload.data.group_id
			if(!group_id){
				throw new Error('群id不能为空')
			}
			let getMemberwhere = {
				group_id
			}
			if (before_id) {
				getMemberwhere._id = dbCmd.gt(before_id)
			}
			// console.log({
			// 	getMemberwhere
			// });
			let res = await groupMemberTable
				.aggregate()
				.match(getMemberwhere)
				.sort({
					_id: 1
				})
				.limit(limit)
				.project({
					user_id: 1
				})
				.lookup({
					from: "uni-id-device",
					let: {
						user_id: '$user_id'
					},
					pipeline: $.pipeline()
						.match(
							dbCmd.expr(
								$.and([
									$.eq(['$user_id', '$$user_id']),
									$.gt(['$token_expired', Date.now()])
								])
							)
						).project({
							push_clientid: 1
						})
						.done(),
					as: 'push_clientids',
				})
				.end()
			member = res.data
			// console.error('符合条件的用户数', member, member.length);
			push_clientids = member.reduce((sum, item) => {
				sum.push(...item.push_clientids.map(i => i.push_clientid))
				return sum
			}, [])
			// console.error('查到需要接收消息的设备数：', push_clientids.length);
		} else {
			// console.log('不需要查库，继续发送任务', push_clientids.length);
		}

		if (push_clientids.length === 0) {
			// console.error('没有更多用户需要接收消息');
			return {
				errCode: 0,
				errMsg: ''
			}
		} else {
			// console.log('push_clientids====>', push_clientids)
		}
		let next_push_clientids = push_clientids.slice(limit)
		push_clientids = push_clientids.slice(0, limit)
		pushParam.push_clientid = push_clientids
		// console.log("pushParam", pushParam);

		let sendPushMsgRes = await this.sendPushMsg(pushParam, appId)
		// console.error(sendPushMsgRes)
		if (next_push_clientids.length !== 0) {
			uniCloud.importObject('uni-im-co').sendMsgToGroup({
				pushParam,
				push_clientids: next_push_clientids,
				member
			}, appId)
			// 等待500毫秒，给一个请求发出去的时间
			return await new Promise((resolve, reject) => {
				setTimeout(() => {
					resolve({
						errCode: 0,
						errMsg: ''
					})
				}, 500)
			})
		} else if (member.length == limit) {
			// console.log('member---*--*', member);
			before_id = member[member.length - limit]._id
			uniCloud.importObject('uni-im-co').sendMsgToGroup({
				pushParam,
				before_id
			}, appId)
			// 等待500毫秒，给一个请求发出去的时间
			return await new Promise((resolve, reject) => {
				setTimeout(() => {
					resolve({
						errCode: 0,
						errMsg: ''
					})
				}, 500)
			})
		} else {
			return {
				errCode: 0,
				errMsg: ''
			}
		}
	},
	async addFriendInvite({
		to_uid,
		message
	}) {
		const from_uid = this.current_uid
		// console.log('from_uid-----', from_uid);
		if (this.current_uid == to_uid) {
			throw new Error('不能加自己为好友')
		}

		let {
			data: [has]
		} = await db.collection('uni-im-friend').where({
			user_id: from_uid,
			friend_uid: to_uid
		}).get()

		if (has) {
			return {
				errSubject: 'uni-im-co',
				errCode: 1000,
				errMsg: '已经是好友'
			}
		}

		// 检查是不是黑名单
		//略
		let docId = md5(JSON.stringify([from_uid, to_uid]))

		// 不存在就添加，存在就更新
		let res = await db.collection('uni-im-friend-invite').doc(docId)
			.set({
				from_uid,
				to_uid,
				message
			})

		// console.log({
		// 	res
		// });
		/*const dbJQL = uniCloud.databaseForJQL({
			clientInfo
		})
		dbJQL.setUser({
			uid: from_uid, // 建议此处使用真实uid
			role: ['admin'], // 指定当前执行用户的角色为admin。如果只希望指定为admin身份，可以删除uid和permission节点
			permission: []
		})*/

		const dbJQL = uniCloud.databaseForJQL({
			clientInfo: this.clientInfo
		})
		let {
			data: [userInfo]
		} = await dbJQL.collection('uni-id-users')
			.doc(this.current_uid)
			.field('_id,nickname,avatar_file')
			.get()
		// console.log({
		// 	userInfo
		// });
		let {
			nickname
		} = userInfo
		let title = nickname.slice(0, 20),
			content = message || "请求添加对方为好友"
		let pushParam = {
			user_id: to_uid,
			payload: {
				type: "uni-im-notification", // im消息通知，比如加好友请求，有用户退群等
				subType: "uni-im-friend-invite", // 通知子类型（可选）
				avatar_file: userInfo.avatar_file, // 头像或图标的图片地址，支持Base64
				confirmText: "同意", // 确认按钮的文字（可选）
				// cancelText: "拒绝", // 取消按钮的文字（可选）
				state: false, // 是否已经处理过 false 未处理，confirm：已确认，cancel：已拒绝（可选）
				unique: from_uid, // 去重字段，比如同一个用户重复申请加好友，通知数据始终只显示一条，但是会通知多次（可选）
				data: { // 自定义的其他参数（可选）
					"_id": docId,
					from_uid
				},
				path: false
			},
			title, // "收到im消息，离线时显示的标题",
			content, //"离线时显示的内容"
			path: false
		}

		return await this.sendPushMsg(pushParam, this.clientInfo.appId)
	},
	async chooseUserIntoGroup({
		group_id,
		user_ids
	}) {
		if (typeof user_ids != 'object') {
			return {
				errSubject: 'uni-im',
				errCode: 1000,
				errMsg: 'user_ids必须是数组'
			}
		} else {
			if (user_ids.length > 499) {
				return {
					errSubject: 'uni-im',
					errCode: 2000,
					errMsg: "拉人进群一次不能超过500人，请分多次操作"
				}
			}
		}

		const dbJQL = uniCloud.databaseForJQL({
			clientInfo: this.clientInfo
		})
		// 如果群id不存在，把当前操作的用户也加入群用户列表（群管理员&&群创建者）
		if (!group_id) {
			user_ids.push(this.current_uid)
		}

		let {
			data: userList
		} = await dbJQL.collection('uni-id-users')
			.where(`"_id" in ${JSON.stringify(user_ids)}`)
			.field('_id,nickname,avatar_file')
			.limit(500)
			.get()

		//如果没有输入群id，就先创建群
		if (!group_id) {
			let groupName = userList.reduce((sum, {
				nickname
			}) => {
				sum += nickname + ' '
				return sum
			}, '群聊：')

			groupName = groupName.substring(0, 30)

			// console.log({
			// 	groupName
			// });

			// JQL触发器会自动把，当前用户设置为群主
			let res = await dbJQL.collection('uni-im-group').add({
				name: groupName
			})
			// console.log(122121, res);

			// 把群主从用户列表中删除，因为他已经进群
			userList.splice(userList.findIndex(item => item._id == this.current_uid), 1)
			user_ids.pop()
			// console.error(123123121, userList);
			group_id = res.id

		} else {
			let res = await db.collection('uni-im-group').doc(group_id).get()
			if (!res.data[0]) {
				throw new Error('群id不存在')
			}
		}

		// 如果一个用户都没选直接创建群，则 结束。否则将用户加入群&&创建会话&&发push通知
		if (user_ids.length === 0) {
			return {
				errSubject: 'uni-im',
				errCode: 0,
				data: {
					group_id,
					res
				},
				errMsg: ''
			}
		}

		// 1.成为群成员
		let groupMemberList = user_ids.map(user_id => {
			data = {
				group_id,
				user_id,
				role: [],
				create_time: Date.now()
			}
			return data
		})
		let res = await db.collection('uni-im-group-member').add(groupMemberList)
		// console.log('uni-im-group-member-  res', res);
		// 2.会话表加上
		let conversationList = user_ids.map(user_id => {
			data = {
				group_id,
				id: 'group_' + group_id,
				user_id: user_id,
				type: 2,
				unread_count: 0,
				update_time: Date.now()
			}
			return data
		})
		res = await db.collection('uni-im-conversation').add(conversationList)

		// console.log('uni-im-group-member-  res', res);
		// 通知用户
		let title = "新用户加群通知",
			content = "新用户加群通知",
			pushParam = {
				// user_id:[...user_ids,this.current_uid],
				payload: {
					"type": "uni-im-group-join",
					"data": {
						userList,
						group_id
					},
					title, // "收到im消息，在线时显示的标题",
					content, // "在线时显示的副标题",
				},
				title, // "收到im消息，离线时显示的标题",
				content //"离线时显示的内容"
			}
		const uniImCo = uniCloud.importObject("uni-im-co")
		let pushRes = await uniImCo.sendMsgToGroup({
			pushParam,
			appId: this.clientInfo.appId
		})
		return {
			errSubject: 'uni-im',
			errCode: 0,
			data: {
				pushRes,
				group_id
			},
			errMsg: ''
		}
	},
	async revokeMsg(msgId){
		let {data:[msgData]} = await db.collection('uni-im-msg').doc(msgId).get()
		if(!msgData){
			throw new Error('无效的消息id')
		}
		let {conversation_id,appid:appId,group_id} = msgData

		// 权限校验
		if(msgData.from_uid != this.current_uid){
			if(group_id){
				// 如果不是当前用户操作自己发的，需要再判断是否为群管理员
				let res = await db.collection('uni-im-group-member')
									.where({
										group_id,
										user_id:this.current_uid
									})
									.get()
				if(res.data[0] && !res.data[0].role.includes('admin')){
					throw new Error('你无权操作')
				}
			}else{
				throw new Error('你无权操作')
			}
		}

		let res = await db.collection('uni-im-msg')
							.doc(msgId)
							.update({
								"is_revoke":true
							})
		// console.log('res',res,this.current_uid)
		if(1 || res.updated){
			// 定义推送参数
			let pushParam = {
				"user_id": msgData.to_uid,
				"payload": {
					type: "uni-im-revoke-msg",
					data:{
						_id:msgId,
						conversation_id,
						user_id:this.current_uid
					}
				},
				title: '撤回消息' ,// "收到im消息，离线时显示的标题"
				content: '撤回消息' ,// "收到im消息，离线时显示的标题"
				settings:{
					ttl: 3 * 24 * 3600 * 1000,
					strategy:{
						default:3
					}
				}
			}
			if(group_id){
				delete pushParam.user_id
				pushParam.payload.data.group_id = group_id
				return await uniCloud.importObject('uni-im-co').sendMsgToGroup({
					pushParam,appId
				})
			}else{
				res = await this.sendPushMsg(pushParam,appId)
			}
			// console.log('res',res);
		}
	}
}

function getConversationId(param) {
	return 'single' + '_' + md5(param.sort().toString())
}

function hideEmailStr(email) {
	if (email == undefined) {
		return ''
	}
	const content = email.split("@")
	return content[0].substr(0, content[0].length - 2) + '**' + content[1]
}

function hideMobileStr(mobile) {
	return mobile.substr(0, 3) + '****' + mobile.substr(-1 * 4)
}


function check_param (params,rule) {
	rule.required.forEach(item => {
		if (!params[item]) {
			throw new Error('错误，参数：' + item + "的值不能为空")
		}
	})
	for (let key in rule.type) {
		if (key in rule.type) {
			let val = params[key],
				type = rule.type[key]
			if (val && !type.includes(getType(val))) {
				throw new Error('错误，参数：' + key + '的数据类型必须为：' + rule.type[key].join('或'))
			}
		}
	}
	function getType(data) {
		return Object.prototype.toString.call(data).replace(/[\[\]]/g, '').split(' ')[1]
	}
}
