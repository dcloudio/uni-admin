class ConfigUtils {
  constructor ({
    appId,
    platform
  } = {}) {
    this.appId = appId
    this.platform = platform
  }

  getConfigArray () {
    let configContent
    try {
      configContent = require('uni-config-center/uni-id/config.json')
    } catch (error) {
      throw new Error('Invalid config file\n' + error.messages)
    }
    if (configContent[0]) {
      return Object.values(configContent)
    }
    configContent.isDefaultConfig = true
    return [configContent]
  }

  getAppConfig () {
    const configArray = this.getConfigArray()
    return configArray.find(item => item.dcloudAppid === this.appId) || configArray.find(item => item.isDefaultConfig)
  }

  getPlatformConfig () {
    const appConfig = this.getAppConfig()
    if (!appConfig) {
      throw new Error(`Config for current app (${this.appId}) was not found, please check your config file or client appId`)
    }
    const platform = this.platform
    if (
      (this.platform === 'app' && appConfig['app-plus']) ||
      (this.platform === 'web' && appConfig.h5)
    ) {
      throw new Error(`Client platform is ${this.platform}, but ${this.platform === 'web' ? 'h5' : 'app-plus'} was found in config. Please refer to: https://uniapp.dcloud.net.cn/uniCloud/uni-id-summary?id=m-to-co`)
    }

    const defaultConfig = {
      tokenExpiresIn: 7200,
      tokenExpiresThreshold: 1200,
      passwordErrorLimit: 6,
      passwordErrorRetryTime: 3600
    }
    return Object.assign(defaultConfig, appConfig, appConfig[platform])
  }
}

module.exports = ConfigUtils
