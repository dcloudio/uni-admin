function batchFindObjctValue (obj = {}, keys = []) {
  const values = {}
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const keyPath = key.split('.')
    let currentKey = keyPath.shift()
    let result = obj
    while (currentKey) {
      if (!result) {
        break
      }
      result = result[currentKey]
      currentKey = keyPath.shift()
    }
    values[key] = result
  }
  return values
}

function getType (val) {
  return Object.prototype.toString.call(val).slice(8, -1).toLowerCase()
}

function hasOwn (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

function isValidString (val) {
  return val && getType(val) === 'string'
}

function isPlainObject (obj) {
  return getType(obj) === 'object'
}

function isFn (fn) {
  // 务必注意AsyncFunction
  return typeof fn === 'function'
}

// 获取文件后缀，只添加几种图片类型供客服消息接口使用
const mime2ext = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/bmp': 'bmp',
  'image/webp': 'webp'
}

function getExtension (contentType) {
  return mime2ext[contentType]
}

const isSnakeCase = /_(\w)/g
const isCamelCase = /[A-Z]/g

function snake2camel (value) {
  return value.replace(isSnakeCase, (_, c) => (c ? c.toUpperCase() : ''))
}

function camel2snake (value) {
  return value.replace(isCamelCase, str => '_' + str.toLowerCase())
}

function parseObjectKeys (obj, type) {
  let parserReg, parser
  switch (type) {
    case 'snake2camel':
      parser = snake2camel
      parserReg = isSnakeCase
      break
    case 'camel2snake':
      parser = camel2snake
      parserReg = isCamelCase
      break
  }
  for (const key in obj) {
    if (hasOwn(obj, key)) {
      if (parserReg.test(key)) {
        const keyCopy = parser(key)
        obj[keyCopy] = obj[key]
        delete obj[key]
        if (isPlainObject(obj[keyCopy])) {
          obj[keyCopy] = parseObjectKeys(obj[keyCopy], type)
        } else if (Array.isArray(obj[keyCopy])) {
          obj[keyCopy] = obj[keyCopy].map((item) => {
            return parseObjectKeys(item, type)
          })
        }
      }
    }
  }
  return obj
}

function snake2camelJson (obj) {
  return parseObjectKeys(obj, 'snake2camel')
}

function camel2snakeJson (obj) {
  return parseObjectKeys(obj, 'camel2snake')
}

function getOffsetDate (offset) {
  return new Date(
    Date.now() + (new Date().getTimezoneOffset() + (offset || 0) * 60) * 60000
  )
}

function getDateStr (date, separator = '-') {
  date = date || new Date()
  const dateArr = []
  dateArr.push(date.getFullYear())
  dateArr.push(('00' + (date.getMonth() + 1)).substr(-2))
  dateArr.push(('00' + date.getDate()).substr(-2))
  return dateArr.join(separator)
}

function getTimeStr (date, separator = ':') {
  date = date || new Date()
  const timeArr = []
  timeArr.push(('00' + date.getHours()).substr(-2))
  timeArr.push(('00' + date.getMinutes()).substr(-2))
  timeArr.push(('00' + date.getSeconds()).substr(-2))
  return timeArr.join(separator)
}

function getFullTimeStr (date) {
  date = date || new Date()
  return getDateStr(date) + ' ' + getTimeStr(date)
}

function getDistinctArray (arr) {
  return Array.from(new Set(arr))
}

/**
 * 拼接url
 * @param {string} base 基础路径
 * @param {string} path 在基础路径上拼接的路径
 * @returns
 */
function resolveUrl (base, path) {
  if (/^https?:/.test(path)) {
    return path
  }
  return base + path
}

function getVerifyCode (len = 6) {
  let code = ''
  for (let i = 0; i < len; i++) {
    code += Math.floor(Math.random() * 10)
  }
  return code
}

function coverMobile (mobile) {
  if (typeof mobile !== 'string') {
    return mobile
  }
  return mobile.slice(0, 3) + '****' + mobile.slice(7)
}

function getNonceStr (length = 16) {
  let str = ''
  while (str.length < length) {
    str += Math.random().toString(32).substring(2)
  }
  return str.substring(0, length)
}

try {
  require('lodash.merge')
} catch (error) {
  console.error('uni-id-co缺少依赖，请在uniCloud/cloudfunctions/common/uni-id-co目录执行 npm install 安装依赖')
  throw error
}

module.exports = {
  getType,
  isValidString,
  batchFindObjctValue,
  isPlainObject,
  isFn,
  getDistinctArray,
  getFullTimeStr,
  resolveUrl,
  getOffsetDate,
  camel2snakeJson,
  snake2camelJson,
  getExtension,
  getVerifyCode,
  coverMobile,
  getNonceStr
}
