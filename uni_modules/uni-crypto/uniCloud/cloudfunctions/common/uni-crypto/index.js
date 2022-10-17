"use strict";
const crypto = require('crypto')
const createConfig = require('uni-config-center')

class UniCrypto {
	constructor(config) {
		this.init(config)
	}
	
	getConfig (key) {
		let file = 'config.json'
		const uniConfig = createConfig && createConfig({
			pluginId: 'uni-crypto'
		})
		if (!uniConfig.hasFile(file)) {
			return false
		}
		const config = uniConfig.requireFile(file)
		console.log(file, config)
		return key ? config[key] : config
	}

	init(config) {
		config = config ? config : {}
		this.config = {
			...this.getConfig(),
			...config
		}
    console.log();
		return this
	}

	showConfig() {
		return this.config
	}

	getCrypto() {
		return crypto
	}

	// aes 加密
	aesEncode(data, encodeReturnType, key, iv, mod, charset) {
		const cipher = crypto.createCipheriv(mod || this.config.AES.mod, key || this.config.AES.pasword, iv || this
			.config.AES.iv)
		let crypted = cipher.update(data, charset || this.config.AES.charset, 'binary')
		crypted += cipher.final('binary')
		crypted = Buffer.from(crypted, 'binary').toString(encodeReturnType || this.config.AES.encodeReturnType)
		return crypted
	}

	// aes 解密
	aesDecode(crypted, encodeReturnType, key, iv, mod, charset) {
		crypted = Buffer.from(crypted, encodeReturnType || this.config.AES.encodeReturnType).toString('binary')
		const decipher = crypto.createDecipheriv(mod || this.config.AES.mod, key || this.config.AES.pasword, iv ||
			this.config.AES.iv)
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
  
  // Sha256加密
  sha256(str, encodeReturnType) {
  	const shaMod = crypto.createHash('SHA256')
  	shaMod.update(str)
  	return shaMod.digest(encodeReturnType || this.config.SHA256.encodeReturnType)
  }
}

module.exports = new UniCrypto()
