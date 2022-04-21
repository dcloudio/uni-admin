//数据加密服务
const crypto = require('crypto')
module.exports = class UniCrypto {
	constructor(config) {
		this.init(config)
	}

	init(config) {
		this.config = {
			AES: {
				mod: 'aes-128-cbc',
				pasword: 'UniStat!010',
				iv: 'UniStativ',
				charset: 'utf8',
				encodeReturnType: 'base64'
			},
			MD5: {
				encodeReturnType: 'hex'
			},
			...config || {}
		}
		return this
	}

	//获取当前配置信息
	showConfig() {
		return this.config
	}

	//获取crypto对象
	getCrypto() {
		return crypto
	}

	// aes 加密
	aesEncode(data, encodeReturnType, key, iv, mod, charset) {
		const cipher = crypto.createCipheriv(mod || this.config.AES.mod, key || this.config.AES.pasword, iv ||
			this.config.AES.iv)
		let crypted = cipher.update(data, charset || this.config.AES.charset, 'binary')
		crypted += cipher.final('binary')
		crypted = Buffer.from(crypted, 'binary').toString(encodeReturnType || this.config.AES.encodeReturnType)
		return crypted
	}

	// aes 解密
	aesDecode(crypted, encodeReturnType, key, iv, mod, charset) {
		crypted = Buffer.from(crypted, encodeReturnType || this.config.AES.encodeReturnType).toString('binary')
		const decipher = crypto.createDecipheriv(mod || this.config.AES.mod, key || this.config.AES.pasword,
			iv || this.config.AES.iv)
		let decoded = decipher.update(crypted, 'binary', charset || this.config.AES.charset)
		decoded += decipher.final(charset || this.config.AES.charset)
		return decoded
	}

	// md5加密
	md5(str, encodeReturnType) {
		const md5Mod = crypto.createHash('md5')
		md5Mod.update(str)
		return md5Mod.digest(encodeReturnType || this.config.MD5.encodeReturnType)
	}
}
