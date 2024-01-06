const uobc = require('uni-open-bridge-common')

const {
  requestWxApi
} = require('./wx-api')
const protocol = require('./protocol.js')

const {
  FormData,
  resolveFile,
  getClientInfo
} = require('../../utils/index')

class WxOpenapi {
  constructor({
    appId,
    requestId
  } = {}) {
    if (requestId) {
      this.clientInfo = getClientInfo(requestId)
    }
    if (!appId && !this.clientInfo) {
      throw new Error('缺少requestId参数')
    }
    this.appId = appId || this.clientInfo.appId
    this._protocol = protocol
  }

  async getAccessToken () {
    const params = {
      dcloudAppid: this.appId,
      platform: 'weixin-mp'
    }

    const result = await uobc.getAccessToken(params)

    return result.access_token
  }
  async _requestWxApi(action, options) {
    const accessToken = await this.getAccessToken()
    if (!accessToken) throw new Error('缺少参数accessToken')

    options.param = options.param || {}
    options.param.accessToken = accessToken

    return requestWxApi(action, options)
  }

  async imgSecCheck({
    image
  } = {}) {
    if (!image) {
      throw new Error('image required')
    }
    const {
      filename,
      contentType,
      buffer
    } = await resolveFile(image)
    const form = new FormData()
    form.append('img', buffer, {
      filename,
      contentType
    })
    return this._requestWxApi('imgSecCheck', {
      content: form.getBuffer(),
      headers: form.getHeaders()
    })
  }

  async textSecCheck({
    content,
    openid,
    scene = 1,
    version = 1
  }) {
    if (!content) throw new Error('content required')

    let params = {
      content
    }

    // 兼容内容安全v2
    if (version === 2) {
      if (!openid) throw new Error('openid required')

      params.version = version
      params.openid = openid
      params.scene = scene
    }

    return this._requestWxApi('contentSecCheck', {
      data: params
    })
  }

  async mediaSecCheck ({
    mediaUrl,
    mediaType,
    version = 2,
    openid,
    scene = 1
  }) {
    if (!mediaUrl) throw new Error('mediaUrl required')
    if (version === 2 && !openid) throw new Error('openid required')

    return this._requestWxApi('mediaSecCheck', {
      data: {
        mediaUrl,
        mediaType,
        version,
        openid,
        scene
      }
    })
  }
}

module.exports = WxOpenapi
