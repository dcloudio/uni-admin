const {
  initWeixin
} = require('../../lib/third-party/index')
const {
  ERROR
} = require('../../common/error')
const {
  preUnifiedLogin,
  postUnifiedLogin
} = require('../../lib/utils/unified-login')
const {
  generateWeixinCache,
  getWeixinPlatform
} = require('../../lib/utils/weixin')
const {
  LOG_TYPE
} = require('../../common/constants')
const url = require('url')

/**
 * 微信登录
 * @tutorial https://uniapp.dcloud.net.cn/uniCloud/uni-id-pages.html#login-by-weixin
 * @param {Object} params
 * @param {String} params.code          微信登录返回的code
 * @param {String} params.inviteCode    邀请码
 * @returns
 */
module.exports = async function (params = {}) {
  const schema = {
    code: 'string',
    inviteCode: {
      type: 'string',
      required: false
    }
  }
  this.middleware.validate(params, schema)
  const {
    code,
    inviteCode
  } = params
  const weixinApi = initWeixin.call(this)
  const weixinPlatform = getWeixinPlatform.call(this)
  let apiName
  switch (weixinPlatform) {
    case 'mp':
      apiName = 'code2Session'
      break
    case 'app':
    case 'h5':
    case 'web':
      apiName = 'getOauthAccessToken'
      break
    default:
      throw new Error('Unsupported weixin platform')
  }
  let getWeixinAccountResult
  try {
    getWeixinAccountResult = await weixinApi[apiName](code)
  } catch (error) {
    console.error(error)
    await this.middleware.uniIdLog({
      success: false,
      type: LOG_TYPE.LOGIN
    })
    throw {
      errCode: ERROR.GET_THIRD_PARTY_ACCOUNT_FAILED
    }
  }

  const {
    openid,
    unionid,
    // 保存下面四个字段
    sessionKey, // 微信小程序用户sessionKey
    accessToken, // App端微信用户accessToken
    refreshToken, // App端微信用户refreshToken
    expired: accessTokenExpired // App端微信用户accessToken过期时间
  } = getWeixinAccountResult

  const {
    type,
    user
  } = await preUnifiedLogin.call(this, {
    user: {
      wx_openid: {
        [weixinPlatform]: openid
      },
      wx_unionid: unionid
    }
  })
  const extraData = {}
  if (type === 'register' && weixinPlatform !== 'mp') {
    const {
      nickname,
      avatar
    } = await weixinApi.getUserInfo({
      accessToken,
      openid
    })
    // eslint-disable-next-line n/no-deprecated-api
    const extName = url.parse(avatar).pathname.split('.').pop()
    const cloudPath = `user/avatar/${openid.slice(-8) + Date.now()}-avatar.${extName}`
    const getAvatarRes = await uniCloud.httpclient.request(avatar)
    if (getAvatarRes.status >= 400) {
      throw {
        errCode: ERROR.GET_THIRD_PARTY_USER_INFO_FAILED
      }
    }
    const {
      fileID
    } = await uniCloud.uploadFile({
      cloudPath,
      fileContent: getAvatarRes.data
    })
    extraData.nickname = nickname
    extraData.avatar_file = {
      name: cloudPath,
      extname: extName,
      url: fileID
    }
  }
  return postUnifiedLogin.call(this, {
    user,
    extraData: {
      ...extraData,
      ...generateWeixinCache.call(this, {
        sessionKey, // 微信小程序用户sessionKey
        accessToken, // App端微信用户accessToken
        refreshToken, // App端微信用户refreshToken
        accessTokenExpired // App端微信用户accessToken过期时间
      })
    },
    isThirdParty: true,
    type,
    inviteCode
  })
}
