function isMobileCodeSupported (config) {
  return !!(config.service && config.service.sms && config.service.sms.smsKey)
}

function isUniverifySupport (config) {
  return !!(config.service && config.service.univerify && config.service.univerify.apiKey)
}

function isWeixinSupported (config) {
  return !!(config.oauth && config.oauth.weixin && config.oauth.weixin.appsecret)
}

function isQQSupported (config) {
  return !!(config.oauth && config.oauth.qq && config.oauth.qq.appsecret)
}

function isAppleSupported (config) {
  return !!(config.oauth && config.oauth.apple && config.oauth.apple.bundleId)
}

function isAlipaySupported (config) {
  return !!(config.oauth && config.oauth.alipay && config.oauth.alipay.privateKey)
}

const loginTypeTester = {
  'mobile-code': isMobileCodeSupported,
  univerify: isUniverifySupport,
  weixin: isWeixinSupported,
  qq: isQQSupported,
  apple: isAppleSupported,
  alipay: isAlipaySupported
}

const ConfigUtils = require('../../lib/utils/config')

/**
 * 获取支持的登录方式
 * @tutorial https://uniapp.dcloud.net.cn/uniCloud/uni-id-pages.html#get-supported-login-type
 * @param {Object} params
 * @param {String} params.appId     应用AppId
 * @param {String} params.platform  应用平台
 * @returns
 */
module.exports = function (params = {}) {
  const schema = {
    appId: {
      type: 'string',
      required: false
    },
    platform: {
      type: 'string',
      required: false
    }
  }
  this.middleware.validate(params, schema)
  const {
    appId,
    platform
  } = params
  const {
    appId: currentAppId
  } = this.getClientInfo()
  const currentPlatform = this.clientPlatform
  const config = new ConfigUtils({
    appId: appId || currentAppId,
    platform: platform || currentPlatform
  }).getPlatformConfig()
  const supportedLoginType = [
    'username-password',
    'mobile-password',
    'email-password'
  ]
  for (const type in loginTypeTester) {
    if (loginTypeTester[type](config)) {
      supportedLoginType.push(type)
    }
  }
  return {
    errCode: 0,
    errMsg: '',
    supportedLoginType
  }
}
