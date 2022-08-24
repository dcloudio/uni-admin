const WxAccount = require('./weixin/account/index')
const QQAccount = require('./qq/account/index')
const AliAccount = require('./alipay/account/index')
const AppleAccount = require('./apple/account/index')

const createApi = require('./share/create-api')
const {
  getOauthConfig
} = require('../../common/utils')

module.exports = {
  initWeixin: function () {
    const oauthConfig = getOauthConfig({
      config: this.config,
      oatuhProivder: 'weixin',
      clientPlatform: this.clientPlatform,
      requiredItem: ['appid', 'appsecret']
    })
    return createApi(WxAccount, {
      appId: oauthConfig.appid,
      secret: oauthConfig.appsecret
    })
  },
  initQQ: function () {
    const oauthConfig = getOauthConfig({
      config: this.config,
      oatuhProivder: 'qq',
      clientPlatform: this.clientPlatform,
      requiredItem: ['appid', 'appsecret']
    })
    return createApi(QQAccount, {
      appId: oauthConfig.appid,
      secret: oauthConfig.appsecret
    })
  },
  initAlipay: function () {
    const oauthConfig = getOauthConfig({
      config: this.config,
      oatuhProivder: 'alipay',
      clientPlatform: this.clientPlatform,
      requiredItem: ['appid', 'privateKey']
    })
    return createApi(AliAccount, {
      appId: oauthConfig.appid,
      privateKey: oauthConfig.privateKey
    })
  },
  initApple: function () {
    const oauthConfig = getOauthConfig({
      config: this.config,
      oatuhProivder: 'apple',
      clientPlatform: this.clientPlatform,
      requiredItem: ['bundleId']
    })
    return createApi(AppleAccount, {
      bundleId: oauthConfig.bundleId
    })
  }
}
