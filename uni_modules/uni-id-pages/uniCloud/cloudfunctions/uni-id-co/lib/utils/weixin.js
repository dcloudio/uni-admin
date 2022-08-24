const crypto = require('crypto')
const {
  userCollection
} = require('../../common/constants')
const {
  ERROR
} = require('../../common/error')
const {
  getOauthConfig
} = require('../../common/utils')
function decryptWeixinData ({
  encryptedData,
  sessionKey,
  iv
} = {}) {
  const oauthConfig = getOauthConfig({
    config: this.config,
    oatuhProivder: 'weixin',
    clientPlatform: this.clientPlatform,
    requiredItem: ['appid']
  })
  const decipher = crypto.createDecipheriv(
    'aes-128-cbc',
    Buffer.from(sessionKey, 'base64'),
    Buffer.from(iv, 'base64')
  )
  // 设置自动 padding 为 true，删除填充补位
  decipher.setAutoPadding(true)
  let decoded
  decoded = decipher.update(encryptedData, 'base64', 'utf8')
  decoded += decipher.final('utf8')
  decoded = JSON.parse(decoded)
  if (decoded.watermark.appid !== oauthConfig.appid) {
    throw new Error('Invalid wechat appid in decode content')
  }
  return decoded
}

function getWeixinPlatform () {
  const platform = this.clientPlatform
  const userAgent = this.getClientInfo().userAgent
  switch (platform) {
    case 'app':
    case 'app-plus':
      return 'app'
    case 'mp-weixin':
      return 'mp'
    case 'h5':
    case 'web':
      return userAgent.indexOf('MicroMessenger') > -1 ? 'h5' : 'web'
    default:
      throw new Error('Unsupported weixin platform')
  }
}

function generateWeixinCache ({
  sessionKey, // 微信小程序用户sessionKey
  accessToken, // App端微信用户accessToken
  refreshToken, // App端微信用户refreshToken
  accessTokenExpired // App端微信用户accessToken过期时间
} = {}) {
  const platform = getWeixinPlatform.call(this)
  let cache
  switch (platform) {
    case 'app':
    case 'h5':
    case 'web':
      cache = {
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_expired: accessTokenExpired
      }
      break
    case 'mp':
      cache = {
        session_key: sessionKey
      }
      break
    default:
      throw new Error('Unsupported weixin platform')
  }
  return {
    third_party: {
      [`${platform}_weixin`]: cache
    }
  }
}

async function getWeixinCache ({
  uid,
  userRecord,
  key
} = {}) {
  const platform = getWeixinPlatform.call(this)
  if (!userRecord) {
    const getUserRes = await userCollection.doc(uid).get()
    userRecord = getUserRes.data[0]
  }
  if (!userRecord) {
    throw {
      errCode: ERROR.ACCOUNT_NOT_EXISTS
    }
  }
  return userRecord &&
    userRecord.third_party &&
    userRecord.third_party[`${platform}_weixin`] &&
    userRecord.third_party[`${platform}_weixin`][key]
}

module.exports = {
  decryptWeixinData,
  getWeixinPlatform,
  generateWeixinCache,
  getWeixinCache
}
