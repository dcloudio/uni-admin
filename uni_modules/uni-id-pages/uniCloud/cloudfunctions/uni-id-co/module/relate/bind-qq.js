const {
  preBind,
  postBind
} = require('../../lib/utils/relate')
const {
  LOG_TYPE
} = require('../../common/constants')
const {
  ERROR
} = require('../../common/error')
const {
  initQQ
} = require('../../lib/third-party/index')

/**
 * 绑定QQ
 * @tutorial https://uniapp.dcloud.net.cn/uniCloud/uni-id-pages.html#bind-qq
 * @param {Object} params
 * @param {String} params.code          小程序端QQ登录返回的code
 * @param {String} params.accessToken   APP端QQ登录返回的accessToken
 * @returns
 */
module.exports = async function (params = {}) {
  const schema = {
    code: {
      type: 'string',
      required: false
    },
    accessToken: {
      type: 'string',
      required: false
    }
  }
  this.middleware.validate(params, schema)
  const uid = this.authInfo.uid
  const {
    code,
    accessToken
  } = params
  const qqApi = initQQ.call(this)
  const clientPlatform = this.clientPlatform
  const apiName = clientPlatform === 'mp-qq' ? 'code2Session' : 'getOpenidByToken'
  let getQQAccountResult
  try {
    getQQAccountResult = await qqApi[apiName]({
      code,
      accessToken
    })
  } catch (error) {
    await this.middleware.uniIdLog({
      success: false,
      type: LOG_TYPE.BIND_QQ
    })
    throw {
      errCode: ERROR.GET_THIRD_PARTY_ACCOUNT_FAILED
    }
  }

  const {
    openid,
    unionid,
    // 保存下面四个字段
    sessionKey // 微信小程序用户sessionKey
  } = getQQAccountResult

  const bindAccount = {
    qq_openid: {
      [clientPlatform]: openid
    },
    qq_unionid: unionid
  }
  await preBind.call(this, {
    uid,
    bindAccount,
    logType: LOG_TYPE.BIND_QQ
  })
  return postBind.call(this, {
    uid,
    bindAccount,
    extraData: {
      third_party: {
        [clientPlatform]: {
          session_key: sessionKey
        }
      }
    },
    logType: LOG_TYPE.BIND_QQ
  })
}
