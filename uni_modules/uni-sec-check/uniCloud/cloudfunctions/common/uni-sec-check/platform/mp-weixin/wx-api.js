const querystring = require('querystring')
const {
  request,
  snake2camelRecursive,
  camel2snakeRecursive
} = require('../../utils/index')

const apiMap = {
  getAccessToken: {
    method: 'GET',
    path: '/cgi-bin/token'
  },
  imgSecCheck: {
    method: 'POST',
    path: '/wxa/img_sec_check'
  },
  contentSecCheck: {
    method: 'POST',
    path: '/wxa/msg_sec_check'
  },
  mediaSecCheck: {
    method: 'POST',
    path: '/wxa/media_check_async'
  }
}

const wxApiBase = 'https://api.weixin.qq.com'

function normalizeError({
  errcode,
  errmsg
} = {}) {
  const error = new Error(errmsg)
  error.code = errcode
  throw error
}

function normalizeResult(result) {
  result.errMsg = result.errmsg || ''
  result.errCode = result.errcode || 0
  delete result.errmsg
  delete result.errcode
  return snake2camelRecursive(result)
}

async function requestWxApi(action, {
  param,
  data,
  content,
  headers,
  dataType = 'json'
} = {}) {
  if (!apiMap[action]) {
    throw new Error(`暂不支持${action}`)
  }
  let url = wxApiBase + apiMap[action].path
  if (param) {
    param = querystring.stringify(camel2snakeRecursive(param))
    url = `${url}${url.indexOf('?') > -1 ? '&' : '?'}${param}`
  }

  if (data) {
    data = camel2snakeRecursive(data)
  }
  const res = await request({
    url,
    method: apiMap[action].method,
    content: content || JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    dataType
  })
  if (res.status >= 400) {
    throw new Error(`请求微信服务错误，状态码：${res.status}`)
  }
  const result = res.data
  return normalizeResult(result)
}

module.exports = {
  requestWxApi
}
