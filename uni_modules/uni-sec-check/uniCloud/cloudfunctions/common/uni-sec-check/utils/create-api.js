const {
  isFn,
  isPlainObject
} = require('./type')
const {
  hasOwn
} = require('./utils')

// 注意：不进行递归处理
function parseParams(params = {}, rule) {
  if (!rule || !params) {
    return params
  }
  if (isPlainObject(rule)) {
    for (const key in rule) {
      const value = rule[key]
      if (isFn(value)) {
        // 通过function转化的默认不删除旧属性名
        params[key] = value(params)
      } else if (typeof value === 'string' && hasOwn(params, key)) {
        // 直接转换属性名称的删除旧属性名
        params[value] = params[key]
        delete params[key]
      }
    }
  } else if (isFn(rule)) {
    params = rule(params)
  }
  return params
}

function createApi(ApiClass, options) {
  const apiInstance = new ApiClass(options)
  return new Proxy(apiInstance, {
    get: function(obj, prop) {
      if (typeof obj[prop] === 'function' && prop.indexOf('_') !== 0 && obj._protocol && obj._protocol[prop]) {
        const protocol = obj._protocol[prop]
        return async function(params) {
          params = parseParams(params, protocol.args)
          let result = await obj[prop](params)
          result = parseParams(result, protocol.returnValue)
          return result
        }
      } else {
        return obj[prop]
      }
    }
  })
}

module.exports = {
  createApi
}
