const fs = require('fs')
const path = require('path')
const TE = require('./lib/art-template.js');

// 标准语法的界定符规则
TE.defaults.openTag = '{@'
TE.defaults.closeTag = '@}'

const success = {
	success: true
}
const fail = {
	success: false
}

async function translateTCB(_fileList = []) {
	if (!_fileList.length) return _fileList
	// 腾讯云和阿里云下载链接不同，需要处理一下，阿里云会原样返回
	const {
		fileList
	} = await uniCloud.getTempFileURL({
		fileList: _fileList
	});
	return fileList.map((item, index) => item.tempFileURL ? item.tempFileURL : _fileList[index])
}

function hasValue(value) {
	if (typeof value !== 'object') return !!value
	if (value instanceof Array) return !!value.length
	return !!(value && Object.keys(value).length)
}

module.exports = async function(id) {
	if (!id) {
		return {
			...fail,
			code: -1,
			errMsg: 'id required'
		};
	}

	// 根据sitemap配置加载页面模板，例如列表页，详情页
	let templatePage = fs.readFileSync(path.resolve(__dirname, './template.html'), 'utf8');
	if (!templatePage) {
		return {
			...fail,
			code: -2,
			errMsg: 'page template no found'
		};
	}

	const db = uniCloud.database()
	let dbPublishList
	try {
		dbPublishList = db.collection('opendb-app-list')
	} catch (e) {}

	if (!dbPublishList) return fail;

	const record = await dbPublishList.where({
		_id: id
	}).get({
		getOne: true
	})

	if (record && record.data && record.data.length) {
		const appInfo = record.data[0]

		const defaultOptions = {
			hasApp: false,
			hasMP: false,
			hasH5: false,
			hasQuickApp: false
		}

		defaultOptions.mpNames = {
			'mp_weixin': '微信',
			'mp_alipay': '支付宝',
			'mp_baidu': '百度',
			'mp_toutiao': '字节',
			'mp_qq': 'QQ',
			'mp_dingtalk': '钉钉',
			'mp_kuaishou': '快手',
			'mp_lark': '飞书',
			'mp_jd': '京东'
		}

		const imageList = [];
		['app_android'].forEach(key => {
			if (!hasValue(appInfo[key])) return
			imageList.push({
				key,
				urlKey: 'url',
				url: appInfo[key].url
			})
		})
		Object.keys(defaultOptions.mpNames).concat('quickapp').forEach(key => {
			if (!hasValue(appInfo[key])) return
			imageList.push({
				key,
				urlKey: 'qrcode_url',
				url: appInfo[key].qrcode_url
			})
		});
		['icon_url'].forEach(key => {
			if (!hasValue(appInfo[key])) return
			imageList.push({
				key,
				url: appInfo[key]
			})
		})
		const filelist = await translateTCB(imageList.map(item => item.url))
		imageList.forEach((item, index) => {
			if (item.urlKey) {
				appInfo[item.key][item.urlKey] = filelist[index]
			} else {
				appInfo[item.key] = filelist[index]
			}
		})
		if (hasValue(appInfo.screenshot)) {
			appInfo.screenshot = await translateTCB(appInfo.screenshot)
		}

		{
			const appInfoKeys = Object.keys(appInfo)
			if (appInfoKeys.some(key => {
					return key.indexOf('app_') !== -1 && hasValue(appInfo[key])
				})) {
				defaultOptions.hasApp = true
			}
			if (appInfoKeys.some(key => {
					return key.indexOf('mp') !== -1 && hasValue(appInfo[key])
				})) {
				defaultOptions.hasMP = true
			}
			if (appInfo.h5 && appInfo.h5.url) {
				defaultOptions.hasH5 = true
			}
			if (appInfo.quickapp && appInfo.quickapp.qrcode_url) {
				defaultOptions.hasQuickApp = true
			}

			// app
			if (defaultOptions.hasApp && appInfo.app_android && appInfo.app_android.url) {
				defaultOptions.android_url = appInfo.app_android.url
			} else {
				defaultOptions.android_url = ''
			}
			if (defaultOptions.hasApp && appInfo.app_ios && appInfo.app_ios.url) {
				defaultOptions.ios_url = appInfo.app_ios.url
			} else {
				defaultOptions.ios_url = ''
			}

			// mp
			defaultOptions.mpKeys = Object.keys(appInfo).filter(key => {
				return key.indexOf('mp') !== -1 && hasValue(appInfo[key])
			})
		}

		const html = TE.render(templatePage)(Object.assign({}, appInfo, defaultOptions));

		if (!(defaultOptions.hasApp || defaultOptions.hasH5 || defaultOptions.hasMP || defaultOptions
				.hasQuickApp)) {
			return {
				...fail,
				code: -100,
				errMsg: '缺少应用信息，App、小程序、H5、快应用请至少填写一项'
			}
		}

		return {
			...success,
			mpserverlessComposedResponse: true, // 使用阿里云返回集成响应是需要此字段为true
			statusCode: 200,
			headers: {
				'content-type': 'text/html'
			},
			body: html
		};
	}

	return {
		...fail,
		code: -3,
		errMsg: 'no record'
	};
}
