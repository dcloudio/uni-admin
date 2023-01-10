const crypto = require('crypto')
const { ERROR } = require('../common/error')
const needSignFunctions = new Set([
  'externalRegister',
  'externalLogin'
])

module.exports = function () {
  const methodName = this.getMethodName()
  const { source } = this.getUniversalClientInfo()
  // 非 HTTP 方式请求不需要鉴权
  if (source !== 'http') return
  // 指定接口需要鉴权
  if (!needSignFunctions.has(methodName)) return

  const timeout = 20 * 1000 // 请求超过20秒不能再请求，防止重放攻击
  const { headers, body: _body } = this.getHttpInfo()
  const { 'uni-id-nonce': nonce, 'uni-id-timestamp': timestamp, 'uni-id-signature': signature } = headers
  const body = JSON.parse(_body).params || {}
  const bodyStr = Object.keys(body)
    .sort()
    .filter(item => typeof body[item] !== 'object')
    .map(item => `${item}=${body[item]}`)
    .join('&')

  if (isNaN(Number(timestamp)) || (Number(timestamp) + timeout) < Date.now()) {
    throw {
      errCode: ERROR.ILLEGAL_REQUEST
    }
  }

  const reSignature = crypto.createHmac('sha256', `${this.config.requestAuthSecret + nonce}`).update(`${timestamp}${bodyStr}`).digest('hex')

  if (signature !== reSignature.toUpperCase()) {
    throw {
      errCode: ERROR.ILLEGAL_REQUEST
    }
  }
}
