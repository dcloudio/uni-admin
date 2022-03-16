import {
	validator,
	mpPlatform
} from '../../js_sdk/validator/opendb-app-publish.js';

const formatFilePickerValue = (url) => (url ? {
	"name": "",
	"extname": "",
	"url": url,
} : {})

function getValidator(fields) {
	let result = {}
	for (let key in validator) {
		if (fields.includes(key)) {
			result[key] = validator[key]
		}
	}
	return result
}

export default {
	data() {
		let formData = {
			"appid": "",
			"name": "",
			"icon_url": "",
			"introduction": "",
			"alias": "",
			"description": "",
			"screenshot": [],
			"app_android": {},
			"app_ios": {},
			"mp_weixin": {},
			"mp_alipay": {},
			"mp_baidu": {},
			"mp_toutiao": {},
			"mp_qq": {},
			"mp_lark": {},
			"mp_kuaishou": {},
			"h5": {},
			"quickapp": {}
		}
		const data = {
			formData,
			rules: getValidator(Object.keys(formData)),
			mpPlatform,
			screenshotList: [],
			middleware_img: {},
			middleware_checkbox: {},
			appPackageInfo: {},
			appPlatformKeys: Object.freeze(['app_android', 'app_ios']),
			appPlatformValues: Object.freeze({
				app_android: 'Android',
				app_ios: 'iOS'
			}),
			keepItems: [],
			isEdit: false
		}
		const mpKeys = Object.keys(mpPlatform);
		[].concat(mpKeys, ['icon_url', 'quickapp']).forEach(key => data.middleware_img[key] = {});
		[].concat(mpKeys, data.appPlatformKeys).forEach(key => data.middleware_checkbox[key] = false)
		return data
	},
	methods: {
		requestCloudFunction(functionName, param = {}) {
			return this.$request(functionName, param, {
				functionName: 'publish-page'
			})
		},
		hasValue(value) {
			if (typeof value !== 'object') return !!value
			if (value instanceof Array) return !!value.length
			return !!(value && Object.keys(value).length)
		},
		initFormData(obj) {
			if (!obj || !Object.keys(obj).length) return;
			// TODO delete
			for (let key in obj) {
				const value = obj[key]
				switch (key) {
					case 'icon_url':
						this.middleware_img[key] = formatFilePickerValue(value)
						break;
					case 'screenshot':
						this.screenshotList = value.map(item => formatFilePickerValue(item))
						break;
					case 'quickapp':
						if (this.hasValue(value) && value.qrcode_url)
							this.middleware_img[key] = formatFilePickerValue(value.qrcode_url)
						break;
					default:
						if ((key.indexOf('mp') !== -1 || key.indexOf('app') !== -1) && this.hasValue(value)) {
							this.setPlatformChcekbox(key, true)
							if (value.qrcode_url)
								this.middleware_img[key] = formatFilePickerValue(value.qrcode_url)
						}
						break;
				}
				this.setFormData(key, value)
			}
		},
		setFormData(key, value) {
			const keys = key.indexOf('.') !== -1 ? key.split('.') : [key];
			const lens = keys.length - 1
			let tempObj = this.formData
			keys.forEach((key, index) => {
				const obj = tempObj[key]
				if (typeof obj === 'object' && index < lens) {
					tempObj = obj
				} else {
					tempObj[key] = value
				}
			})
		},
		getFormData(key) {
			const keys = key.indexOf('.') !== -1 ? key.split('.') : [key];
			const lens = keys.length - 1
			let tempObj = this.formData
			for (let i = 0; i < keys.length; i++) {
				const key = keys[i]
				tempObj = tempObj[key]
				if (tempObj == null) {
					return false
				}
			}
			return tempObj
		},
		// 根据 appid 自动填充
		autoFill() {
			const appid = this.getFormData('appid')
			if (!appid) {
				return
			}

			uni.showLoading({
				mask: true
			})

			this.requestCloudFunction('getAppInfo', {
					appid
				})
				.then(res => {
					if (res.success) {
						this.setFormData('description', res.description)
						this.setFormData('name', res.name)
						return
					}
				}).catch(e => {
					console.error(e)
				}).finally(() => {
					uni.hideLoading()
				})
		},
		autoFillApp() {
			const appid = this.getFormData('appid')
			if (!appid) {
				return
			}

			uni.showLoading({
				mask: true
			})

			this.appPlatformKeys.forEach(key => {
				this.requestCloudFunction('getAppVersionInfo', {
					appid,
					platform: this.appPlatformValues[key]
				}).then(res => {
					if (res && res.success) {
						this.setPlatformChcekbox(key, true)
						this.setFormData(key, {
							name: res.name,
							url: res.url
						})
						return;
					}
				}).catch(e => {
					console.error(e)
				}).finally(() => {
					uni.hideLoading()
				})
			})
		},
		iconUrlSuccess(res, key) {
			uni.showToast({
				icon: 'success',
				title: '上传成功',
				duration: 500
			})
			this.setFormData(key, res.tempFilePaths[0])
		},
		async iconUrlDelete(res, key) {
			let deleteRes = await this.requestCloudFunction('deleteFile', {
				fileList: [res.tempFile.fileID || res.tempFile.url]
			})
			deleteRes.fileList ?
				deleteRes = deleteRes.fileList[0] :
				deleteRes = deleteRes[0];
			if (deleteRes.success || deleteRes.code === "SUCCESS") {
				uni.showToast({
					icon: 'success',
					title: '删除成功',
					duration: 800
				})
				if (!key) return;
				this.setFormData(key, '')
				this.$refs.form.clearValidate(key)
			}
		},
		formatFormData() {
			this.setFormData('screenshot', this.screenshotList.map(item => item.fileID || item.url))

			this.keepItems = this.platFormKeys
				.filter(key =>
					this.getPlatformChcekbox(key) &&
					(this.formData[key].url || this.formData[key].qrcode_url)
				)
				.concat(['icon_url', 'screenshot', 'create_date'])

			if (this.formData.h5 && this.formData.h5.url)
				this.keepItems.push('h5');

			if (this.formData.quickapp && this.formData.quickapp.qrcode_url)
				this.keepItems.push('quickapp');
		},
		getPlatformChcekbox(mp_name) {
			return this.middleware_checkbox[mp_name]
		},
		setPlatformChcekbox(mp_name, value = false) {
			this.middleware_checkbox[mp_name] = value
		},
		selectFile() {
			if (this.hasPackage) {
				uni.showToast({
					icon: 'none',
					title: '只可上传一个文件，请删除已上传后重试',
					duration: 1000
				});
			}
		}
	},
	computed: {
		platFormKeys() {
			return Object.keys(this.formData).filter(key => {
				const value = this.formData[key]
				const appKey = key.indexOf('app_') !== -1
				const mpKey = key.indexOf('mp') !== -1
				return appKey || mpKey
			})
		},
		hasPackage() {
			return this.appPackageInfo && !!Object.keys(this.appPackageInfo).length
		},
	}
}
