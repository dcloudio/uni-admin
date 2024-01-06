const createConfig = require('uni-config-center')
const {
  ErrorCode,
  createApi,
  getClientInfo
} = require('./utils/index')
const MpWeixinService = require('./platform/mp-weixin/index')

const providerMap = {
  'mp-weixin': MpWeixinService
}

class SecurityCheck {
  constructor ({
    provider,
    requestId,
    appId,
  } = {}) {
    if (!provider || !providerMap[provider]) {
      throw new Error(`请提供支持的provider参数，当前provider为：${provider}`)
    }

    this.provider = provider
    // 开发者提供的获取accessToken的接口，需要能返回{accessToken,expired}这种结构
    this.service = createApi(providerMap[provider], {
      requestId,
      appId
    })

    this.ErrorCode = ErrorCode
  }

  /**
   * 图片违规检测
   * @param {String} image 图片地址
   * @param {String} openid
   * @param {Number} scene 1 资料；2 评论；3 论坛；4 社交日志
   * @param {Number} version
   * @return {Promise<*>}
   */
  async imgSecCheck ({
    image,
    openid,
    scene,
    version = 1
  }) {
    // 兼容内容安全V2
    if (version === 2) {
      if (!openid) throw new Error('openid required')

      return this.service.mediaSecCheck({
        mediaUrl: image,
        mediaType: 2,
        openid,
        scene,
        version
      })
    }

    return this.service.imgSecCheck({
      image
    })
  }

  /**
   * 文本内容违规检测
   * @param {String} content 文本内容
   * @deprecated
   * @return {Promise<*>}
   */
  async contentSecCheck ({
    content
  }) {
    console.warn('contentSecCheck接口已废弃，请使用textSecCheck')
    return this.service.textSecCheck({
      content
    })
  }

  /**
   * 文本内容违规检测
   * @param {String} content
   * @param {String} openid
   * @param {Number} scene 1 资料；2 评论；3 论坛；4 社交日志
   * @param {String} version
   * @return {Promise<*>}
   */
  async textSecCheck ({
    content,
    openid,
    scene,
    version
  }) {
    return this.service.textSecCheck({
      content,
      openid,
      scene,
      version
    })
  }

  /**
   * 音视频内容违规检测
   * @param {String} mediaUrl 媒体URL
   * @param {String} openid
   * @param {Number} scene 1 资料；2 评论；3 论坛；4 社交日志
   * @param {String} version
   * @return {Promise<*>}
   */
  async avSecCheck ({
    mediaUrl,
    openid,
    scene
  }) {
    return this.service.mediaSecCheck({
      mediaUrl,
      mediaType: 1,
      openid,
      scene
    })
  }
}

module.exports = SecurityCheck
