// 引入自定义模块
const {safeRequire, checkContentSecurityEnable} = require('./utils')
// 引入uni-config-center模块
const createConfig = safeRequire('uni-config-center')
// 获取uni-cms插件的配置
const config = createConfig({
	pluginId: 'uni-cms'
}).config()


module.exports = {
_before: function () {
		// 从配置中心获取内容安全配置

		 // 如果内容安全配置存在
		if (config.contentSecurity) {
			// 引入内容安全检测模块
			const UniSecCheck = safeRequire('uni-sec-check')
			 // 实例化内容安全检测模块
			this.uniSecCheck = new UniSecCheck({
				provider: 'mp-weixin', // 使用微信小程序的内容安全检测
				requestId: this.getUniCloudRequestId() // 请求ID为当前云函数请求ID
			})
		}
	},

async checkImageSec (image) {
		// 检查内容安全是否开启
		// 如果内容安全未开启，则直接返回一个对象，包含错误码为0。表示检测跳过
		if (!checkContentSecurityEnable(config.contentSecurity, 'image')) {
			return {
				errCode: 0
			}
		}
		// 调用内容安全检测模块进行图片检测
		const res = await this.uniSecCheck.imgSecCheck({
			image, // 图片url
			scene: 1, // 表示检测场景为资料场景
			version: 1 // 表示使用内容安全检测API的版本为1
		})

		// 如果图片违规，删除图片并抛出异常
		if (res.errCode === this.uniSecCheck.ErrorCode.RISK_CONTENT) {
			await uniCloud.deleteFile({
				fileList: [image]
			})

			throw {
				errCode: 'uni-cms-risk-content',
				errMsg: '图片违规已删除'
			}
		} else if (res.errCode !== 0) {
			// 如果内容安全检测异常，抛出异常并打印错误信息
			console.error(res)
			throw new Error('内容安全检测异常：' + res.errCode)
		}

		return {
			errCode: 0
		}
	},

	_after: function (error, result) {
		if (error) {
			return {
				errCode: error.errCode || -1,
				errMsg: error.errMsg || error.message
			}
		}

		return result
	}
}


