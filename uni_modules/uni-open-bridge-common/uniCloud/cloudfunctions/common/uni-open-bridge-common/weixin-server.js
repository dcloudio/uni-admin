'use strict';

const crypto = require('crypto')

const {
  HTTP_STATUS
} = require('./consts.js')

const {
  BridgeError
} = require('./bridge-error.js')

class WeixinServer {

  constructor(options = {}) {
    this._appid = options.appid
    this._secret = options.secret
  }

  getAccessToken() {
    return uniCloud.httpclient.request(WeixinServer.AccessToken_Url, {
      dataType: 'json',
      method: 'POST',
      data: {
        appid: this._appid,
        secret: this._secret,
        grant_type: "client_credential"
      }
    })
  }

  // 使用客户端获取的 code 从微信服务器换取 openid，code 仅可使用一次
  codeToSession(code) {
    return uniCloud.httpclient.request(WeixinServer.Code2Session_Url, {
      dataType: 'json',
      data: {
        appid: this._appid,
        secret: this._secret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    })
  }

  getUserEncryptKey({
    access_token,
    openid,
    session_key
  }) {
    console.log(access_token, openid, session_key);
    const signature = crypto.createHmac('sha256', session_key).update('').digest('hex')
    return uniCloud.httpclient.request(WeixinServer.User_Encrypt_Key_Url, {
      dataType: 'json',
      method: 'POST',
      dataAsQueryString: true,
      data: {
        access_token,
        openid: openid,
        signature: signature,
        sig_method: 'hmac_sha256'
      }
    })
  }

  getAccessTokenH5() {
    return uniCloud.httpclient.request(WeixinServer.AccessToken_H5_Url, {
      dataType: 'json',
      method: 'GET',
      data: {
        appid: this._appid,
        secret: this._secret,
        grant_type: "client_credential"
      }
    })
  }

  getTicket(access_token) {
    return uniCloud.httpclient.request(WeixinServer.Ticket_Url, {
      dataType: 'json',
      dataAsQueryString: true,
      method: 'POST',
      data: {
        access_token
      }
    })
  }
}

WeixinServer.AccessToken_Url = 'https://api.weixin.qq.com/cgi-bin/token'
WeixinServer.Code2Session_Url = 'https://api.weixin.qq.com/sns/jscode2session'
WeixinServer.User_Encrypt_Key_Url = 'https://api.weixin.qq.com/wxa/business/getuserencryptkey'
WeixinServer.AccessToken_H5_Url = 'https://api.weixin.qq.com/cgi-bin/token'
WeixinServer.Ticket_Url = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi'

WeixinServer.GetMPAccessToken = function(options) {
  return new WeixinServer(options).getAccessToken()
}

WeixinServer.GetCodeToSession = function(options) {
  return new WeixinServer(options).codeToSession(options.code)
}

WeixinServer.GetUserEncryptKey = function(options) {
  return new WeixinServer(options).getUserEncryptKey(options)
}

WeixinServer.GetH5AccessToken = function(options) {
  return new WeixinServer(options).getAccessTokenH5()
}

WeixinServer.GetH5Ticket = function(options) {
  return new WeixinServer(options).getTicket(options.access_token)
}

////////////////////////////////////////////////////////////////

WeixinServer.GetResponseData = function(response) {
  console.log("WeixinServer::response", response)

  if (response.status !== HTTP_STATUS.SUCCESS) {
    throw new BridgeError(response.status, response.status)
  }

  const responseData = response.data

  if (responseData.errcode !== undefined && responseData.errcode !== 0) {
    throw new BridgeError(responseData.errcode, responseData.errmsg)
  }

  return responseData
}

WeixinServer.GetMPAccessTokenData = async function(options) {
  const response = await new WeixinServer(options).getAccessToken()
  return WeixinServer.GetResponseData(response)
}

WeixinServer.GetCodeToSessionData = async function(options) {
  const response = await new WeixinServer(options).codeToSession(options.code)
  return WeixinServer.GetResponseData(response)
}

WeixinServer.GetUserEncryptKeyData = async function(options) {
  const response = await new WeixinServer(options).getUserEncryptKey(options)
  return WeixinServer.GetResponseData(response)
}

WeixinServer.GetH5AccessTokenData = async function(options) {
  const response = await new WeixinServer(options).getAccessTokenH5()
  return WeixinServer.GetResponseData(response)
}

WeixinServer.GetH5TicketData = async function(options) {
  const response = await new WeixinServer(options).getTicket(options.access_token)
  return WeixinServer.GetResponseData(response)
}


module.exports = {
  WeixinServer
}
