"use strict";
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const handlebars = require('handlebars')
const createConfig = require('uni-config-center')
const fs = require('fs')
const {resolve} = require('path')

function getConfig (file, key) {
	file = file ? file : 'config.json'
	const uniConfig = createConfig && createConfig({
		pluginId: 'uni-mail'
	})
	if (!uniConfig.hasFile(file)) {
		return false
	}
	const config = uniConfig.requireFile(file)
	//console.log(file, config)
	return key ? config[key] : config
}

class Email {
	constructor(provider) {
		this.config = getConfig()
		this.mailList = []
		this.mailTokenTable = this.config.mailTokenTable || "uni-id-email-token-logs"
		this.providers = this.config.provider
		this.init()
	}

	init(provider) {
		if (!this.providers)
			return false
			
		if(!provider) {
			let providers = Object.keys(this.providers)
			provider = providers[0]
		}
		
		this.mail = nodemailer.createTransport(this.providers[provider])
		if(!this.mail) {
			console.error('Mail server initialization failed by the provider:' + provider)
			return false
		}
		return this
	}

	setSubject(subject) {
		this.subject = subject || ""
		return this
	}

	setSendMail(mail) {
		if (!mail)
			return false;
		this.mailList.push(mail)
		return this
	}
	getTemplate(type) {
		type = type ? type : 'validMail'
		let templatePath = resolve(__dirname + '/template/')
		let html = fs.readFileSync(templatePath + '/' + type + '.html', 'utf-8')
		return html
	}
	setBody(content) {
		this.body = content || ""
		return this
	}
	setBodyTemplate(template, params) {
		var html = this.getTemplate(template);
		if(html) {
			var template = handlebars.compile(html)
			var htmlToSend = template(params)
			this.body = htmlToSend || ""
			return this.body
			//console.log('body html', htmlToSend)
		} else {
			console.error('Not found this mail template by ' + template)
			return false
		}
	}

	setFrom(from) {
		this.from = from || '"DCloud" <service@mail.dcloud.io>'
		return this
	}
	
	
	async checkMailToken(token, type, needUserInfo = true) {
		let checkRes = {
			code: 403,
			message: '无效token'
		}
		let tokenData = ""
		let db = uniCloud.database()
		try {
			tokenData = await db.collection(this.mailTokenTable)
			.where({
				type: type || 'verify_mail',
				token: token,
				expire_time: {$gt: new Date().getTime()}
			})
			.orderBy('expire_time', 'desc')
			.limit(1)
			.get()
			if(tokenData && tokenData.data.length > 0) {
				tokenData = tokenData.data[0]
			} else {
				checkRes.code = 400
				checkRes.message = 'token 已过期'
				return checkRes
			}
		} catch ($err) {
			return checkRes
		}
		//console.log('tokenData', tokenData)
		if (tokenData.email && needUserInfo) {
			let userInfoRecordCheckToken = await db.collection('uni-id-users').where({
					email: tokenData.email
				})
				.field({
					_id: true,
					email: true,
					email_confirmed: true
				})
				.limit(1)
				.get()
			//console.log('user', JSON.stringify(userInfoRecordCheckToken.data))
			if (userInfoRecordCheckToken.data.length > 0) {
				checkRes.code = 0
				checkRes.message = "ok"
				checkRes.userinfo = userInfoRecordCheckToken.data[0]
			}
		} else {
			checkRes.code = 0
			checkRes.message = "ok"
			checkRes.userinfo = {
				email: tokenData.email
			}
		}
			
		return checkRes
	}
	
	async sendTokenMail(type, mail, link, template, expireHours = 2) {
		template = template ? template : 'linkMail'
		
		let mailTitle, message, btn;
		if(!this.config.mailTempParams[type]) {
			return false
		}
		
		let thistime = new Date().getTime()
	
		let logData = await uniCloud.database()
		.collection(this.mailTokenTable)
		.where({
			type: type,
			email: mail,
			create_time: {$gte: thistime - 120000}
		})
		.count()
		if(logData && logData.total > 0) {
			return true
		}
		
		
		let expiretime = thistime + (expireHours * 3600 * 1000)
		let tokenStr = JSON.stringify({
			email: mail,
			type: type,
			createtime: thistime,
			expiretime:expiretime
		})

		const md5Mod = crypto.createHash('md5')
		md5Mod.update(tokenStr)
		let eToken = md5Mod.digest('hex')
		
		let params = this.config.mailTempParams[type]
		params.link = link + (link.indexOf('?') > -1 ? '&' : '?') + 'token=' + eToken
		params.mail = mail
		
		let res = await this.sendMailByTemplate(template, params)
		// let emailContent = this.setBodyTemplate(template, params)
		// if(!emailContent) {
		// 	return false
		// }
		
		// let res = await this.setFrom()
		// .setSubject(params.title)
		// .setSendMail(mail)
		// .send()
		if(res) {
			await uniCloud.database().collection(this.mailTokenTable).add({
				type: type,
				email: mail,
				token: eToken,
				create_time: thistime,
				expire_time: expiretime
			})
		}
		return res
	}
	
	
	async sendMailCode(mailParams) {
		const params = {
			type: 'verify_by_code',
			template: 'mailCode',
			expireMin: 5,
			sendMinLimit: 2,
			code: false,
			...mailParams
		}
		
		if(!params.code) {
			const randomStr = '00000' + Math.floor(Math.random() * 1000000)
			params.code = randomStr.substring(randomStr.length - 6)
		}
		
		if(!params.title) {
			params.title = 'DCloud 邮箱验证码'
		}
		
		let thistime = new Date().getTime()
		let logData = await uniCloud.database()
		.collection(this.mailTokenTable)
		.where({
			type: params.type,
			email: params.email,
			create_time: {$gte: thistime - params.sendMinLimit * 1000}
		})
		.count()
		if(logData && logData.total > 0) {
			return true
		}
		
		let expiretime = thistime + (params.expireMin * 60000)
		let res = await this.sendMailByTemplate(params.template, params)
		
		if(res) {
			await uniCloud.database().collection(this.mailTokenTable).add({
				type: params.type,
				email: params.email,
				code: params.code,
				create_time: thistime,
				expire_time: expiretime
			})
		}
		return res
	}
	
	async checkMailCode(params) {
		let {
			type,
			email,
			code
		} = params
		type = type ? type : 'verify_by_code'
		const sendLog = await uniCloud.database()
		.collection(this.mailTokenTable)
		.where({
			type: type,
			email: email,
			code: code
		})
		.orderBy('expire_time', 'desc')
		.limit(1)
		.get()
		
		if(sendLog.data.length === 0) {
			return {
				errCode: 200,
				errMsg: '验证码校验失败'
			}
		}
		
		if(sendLog.data[0].expire_time < new Date().getTime()) {
			return {
				errCode: 201,
				errMsg: '验证码已失效'
			}
		}
		
		return {
			errCode: 0,
			errMsg: '验证码校验成功'
		}
	}
	
	
	async sendMailByTemplate(template, params) {
		if(!params) {
			if(!this.config.mailTempParams[template]) {
				return false
			}
			params = this.config.mailTempParams[template]
		}
		
		let emailContent = this.setBodyTemplate(template, params)
		if(!emailContent) {
			return false
		}
		
		let res = await this.setFrom()
		.setSubject(params.title)
		.setSendMail(params.mail || params.email)
		.send()
		return res
	}

	async send() {
		let mailOptions = {
			from: this.from,
			to: this.mailList.join(','),
			subject: this.subject,
			html: this.body
		};
		
		let sendres, res = false
		for(let mk in this.providers) {
			if(this.init(mk)) {
				console.log('mail provider', mk)
				sendres = await this.mail.sendMail(mailOptions)
				if(sendres && sendres.accepted.length > 0) {
					res = true
					break
				}
			}
		}
		this.mailList = []
		return res
	}

	createNodemailer() {
		return nodemailer
	}
}

module.exports = Email
