const _toString = Object.prototype.toString
const hasOwnProperty = Object.prototype.hasOwnProperty

function hasOwn(obj, key) {
	return hasOwnProperty.call(obj, key)
}

function isPlainObject(obj) {
	return _toString.call(obj) === '[object Object]'
}

//判断参数是否为函数
function isFn(fn) {
	return typeof fn === 'function'
}

function deepClone(obj) {
	return JSON.parse(JSON.stringify(obj))
}


// 解析参数
function parseUrlParams(str, context) {
	if (!str || typeof str !== 'string') {
		return str
	}
	const params = str.split('&').reduce((res, cur) => {
		const arr = cur.split('=')
		return Object.assign({
			[arr[0]]: arr[1]
		}, res)
	}, {})
	
	
	//原以下数据要从客户端上报，现调整为如果以下参数客户端未上报，则通过请求附带的context参数中获取
	const convertParams = {
		//appid
		ak: 'APPID',
		//当前登录用户编号
		uid: 'uid',
		//设备编号
		did: 'DEVICEID',
		//系统
		p: 'OS',
		//客户端ip
		ip: 'CLIENTIP',
		//客户端的UA
		ua: 'CLIENTUA',
		//当前服务空间信息 {spaceId:'xxx',provider:'tencent'}
		spi: 'SPACEINFO',
		//云函数调用来源
		fs: 'SOURCE'
	}
	
	context = context ? context : {}
	//console.log('context', context)
	for(let key in convertParams) {
		if(!params[key] && context[convertParams[key]]) {
			params[key] = context[convertParams[key]]
		}
	}
	
	return params
}

//解析url
function parseUrl(url) {
	if(typeof url !== "string" || !url) {
		return false
	}
	const urlInfo = url.split('?')
	return {
		path: urlInfo[0],
		query: urlInfo[1] ? decodeURI(urlInfo[1]) : ''
	}
}

//获取配置文件信息
let createConfig
try {
	createConfig = require('uni-config-center')
} catch (e) {}

function getConfig(file, key) {
	if (!file) {
		return false
	}

	const uniConfig = createConfig && createConfig({
		pluginId: 'uni-stat'
	})

	if (!uniConfig.hasFile(file + '.json')) {
		return false
	}

	const config = uniConfig.requireFile(file)

	return key ? config[key] : config
}


module.exports = {
	hasOwn,
	isPlainObject,
	isFn,
	deepClone,
	parseUrlParams,
	parseUrl,
	getConfig
}
