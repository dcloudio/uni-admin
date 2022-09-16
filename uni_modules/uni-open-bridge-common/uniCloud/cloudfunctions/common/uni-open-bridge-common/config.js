'use strict';

const {
  PlatformType
} = require('./consts.js')

const configCenter = require('uni-config-center')

const OauthConfig = {
  'weixin-mp': ['mp-weixin', 'oauth', 'weixin'],
  'weixin-h5': ['web', 'oauth', 'weixin-h5']
}

class ConfigBase {

  constructor() {
    this._ready = false
    this._uniId = null

    const uniIdConfig = configCenter({
      pluginId: 'uni-id'
    })

    this._uniId = uniIdConfig.config()

    this._ready = true
  }

  getAppConfig(appid) {
    if (Array.isArray(this._uniId)) {
      return this._uniId.find((item) => {
        return (item.dcloudAppid === appid)
      })
    }
    return this._uniId
  }

  get ready() {
    return this._ready
  }
}

class AppConfig extends ConfigBase {

  constructor() {
    super()
  }

  get(appid, platform) {
    if (!this.isSupport(platform)) {
      return null
    }

    let appConfig = this.getAppConfig(appid)
    if (!appConfig) {
      return null
    }

    return this.getOauthConfig(appConfig, platform)
  }

  isSupport(platformName) {
    return (AppConfig.Support_Platforms.indexOf(platformName) >= 0)
  }

  getOauthConfig(appConfig, platformName) {
    let tree = OauthConfig[platformName]
    let node = appConfig
    for (let i = 0; i < tree.length; i++) {
      let nodeName = tree[i]
      if (node[nodeName]) {
        node = node[nodeName]
      } else {
        node = null
        break
      }
    }

    if (node && node.appid && node.appsecret) {
      return {
        appid: node.appid,
        secret: node.appsecret
      }
    }

    return null
  }
}

AppConfig.Support_Platforms = [PlatformType.WEIXIN_MP, PlatformType.WEIXIN_H5]


module.exports = {
  AppConfig
};
