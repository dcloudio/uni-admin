'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var crypto = _interopDefault(require('crypto'));
var querystring = _interopDefault(require('querystring'));
var buffer = _interopDefault(require('buffer'));
var stream = _interopDefault(require('stream'));
var util = _interopDefault(require('util'));

const _toString = Object.prototype.toString;
const hasOwnProperty = Object.prototype.hasOwnProperty;

// copy from lodash
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reHasRegExpChar = RegExp(reRegExpChar.source);

/**
 * Escapes the `RegExp` special characters "^", "$", "\", ".", "*", "+",
 * "?", "(", ")", "[", "]", "{", "}", and "|" in `string`.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escapeRegExp('[lodash](https://lodash.com/)');
 * // => '\[lodash\]\(https://lodash\.com/\)'
 */
function escapeRegExp (string) {
  return (string && reHasRegExpChar.test(string))
    ? string.replace(reRegExpChar, '\\$&')
    : string
}

function replaceAll (str, substr, newSubstr) {
  return str.replace(new RegExp(escapeRegExp(substr), 'g'), newSubstr)
}

function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]'
}

function isFn (fn) {
  return typeof fn === 'function'
}

function isPromise (obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
}

function getType (val) {
  return Object.prototype.toString.call(val).slice(8, -1).toLowerCase()
}

// 简单实现，忽略数组等情况
function getObjectValue (obj, keyPath) {
  const keyPathArr = keyPath.split('.');
  return keyPathArr.reduce((value, key) => {
    return value && value[key]
  }, obj)
}

const isSnakeCase = /_(\w)/g;
const isCamelCase = /[A-Z]/g;

function snake2camel (value) {
  return value.replace(isSnakeCase, (_, c) => (c ? c.toUpperCase() : ''))
}

function camel2snake (value) {
  return value.replace(isCamelCase, str => '_' + str.toLowerCase())
}

function parseObjectKeys (obj, type) {
  let parserReg, parser;
  switch (type) {
    case 'snake2camel':
      parser = snake2camel;
      parserReg = isSnakeCase;
      break
    case 'camel2snake':
      parser = camel2snake;
      parserReg = isCamelCase;
      break
  }
  for (const key in obj) {
    if (hasOwn(obj, key)) {
      if (parserReg.test(key)) {
        const keyCopy = parser(key);
        obj[keyCopy] = obj[key];
        delete obj[key];
        if (isPlainObject(obj[keyCopy])) {
          obj[keyCopy] = parseObjectKeys(obj[keyCopy], type);
        } else if (Array.isArray(obj[keyCopy])) {
          obj[keyCopy] = obj[keyCopy].map((item) => {
            return parseObjectKeys(item, type)
          });
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
  date = date || new Date();
  const dateArr = [];
  dateArr.push(date.getFullYear());
  dateArr.push(('00' + (date.getMonth() + 1)).substr(-2));
  dateArr.push(('00' + date.getDate()).substr(-2));
  return dateArr.join(separator)
}

function getTimeStr (date, separator = ':') {
  date = date || new Date();
  const timeArr = [];
  timeArr.push(('00' + date.getHours()).substr(-2));
  timeArr.push(('00' + date.getMinutes()).substr(-2));
  timeArr.push(('00' + date.getSeconds()).substr(-2));
  return timeArr.join(separator)
}

function getFullTimeStr (date) {
  date = date || new Date();
  return getDateStr(date) + ' ' + getTimeStr(date)
}

function log () {
  if (process.env.NODE_ENV === 'development') {
    console.log(...arguments);
  }
}

function getSmsCode (len = 6) {
  let code = '';
  for (let i = 0; i < len; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code
}

function getDistinctArray (arr) {
  return Array.from(new Set(arr))
}

// 暂时实现到这种程度，后续有需求时再调整
function resolveUrl (base, path) {
  if (/^https?:/.test(path)) {
    return path
  }
  return base + path
}

const PublicError = {
  PARAM_ERROR: {
    errCode: 'param-error',
    errMsg: '{param}参数错误，{reason}'
  },
  PARAM_REQUIRED: {
    errCode: 'param-required',
    errMsg: '{param}不可为空'
  },
  USER_NOT_EXIST: {
    errCode: 'user-not-exist',
    errMsg: '用户不存在'
  },
  ROLE_NOT_EXIST: {
    errCode: 'role-not-exist',
    errMsg: '角色不存在'
  },
  PERMISSION_NOT_EXIST: {
    errCode: 'permission-not-exist',
    errMsg: '权限不存在'
  },
  MULTI_USER_MATCHED: {
    errCode: 'multi-user-matched',
    errMsg: '匹配到多个账号'
  },
  USER_INFO_ERROR: {
    errCode: 'user-info-error',
    errMsg: '用户信息不正确'
  },
  USER_ACCOUNT_CONFLICT: {
    errCode: 'user-account-conflict',
    errMsg: '用户账号冲突'
  },
  ACCOUNT_ALREADY_REGISTED: {
    errCode: 'account-already-registed',
    errMsg: '此{type}已注册'
  },
  ACCOUNT_NOT_REGISTED: {
    errCode: 'account-not-registed',
    errMsg: '此{type}尚未注册'
  },
  ACCOUNT_already_BOUND: {
    errCode: 'account-already-bound',
    errMsg: '此{type}已绑定'
  },
  UNBIND_FAILED: {
    errCode: 'unbind-failed',
    errMsg: '解绑失败'
  },
  INVALID_INVITE_CODE: {
    errCode: 'invalid-invite-code',
    errMsg: '邀请码无效'
  },
  SET_INVITE_CODE_FAILED: {
    errCode: 'set-invite-code-failed',
    errMsg: '邀请码设置失败'
  },
  GET_THIRD_PARTY_ACCOUNT_FAILED: {
    errCode: 'get-third-party-account-failed',
    errMsg: '获取{account}失败'
  }
};

const ErrorCode = {
  0: {
    errCode: 0,
    errMsg: ''
  },
  10001: {
    errCode: 'account-banned',
    errMsg: '账号已禁用'
  },
  10002: PublicError.USER_NOT_EXIST,
  10003: PublicError.MULTI_USER_MATCHED,
  10004: PublicError.USER_INFO_ERROR,
  10005: PublicError.USER_ACCOUNT_CONFLICT,
  10102: {
    errCode: 'password-error',
    errMsg: '密码错误'
  },
  10103: {
    errCode: 'password-error-exceed-limit',
    errMsg: '密码错误次数过多'
  },
  10201: PublicError.ACCOUNT_ALREADY_REGISTED,
  10202: PublicError.ACCOUNT_NOT_REGISTED,
  10203: PublicError.INVALID_INVITE_CODE,
  10301: PublicError.ACCOUNT_ALREADY_REGISTED,
  10302: PublicError.ACCOUNT_NOT_REGISTED,
  10401: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  10501: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  10601: PublicError.ACCOUNT_ALREADY_REGISTED,
  10602: PublicError.ACCOUNT_NOT_REGISTED,
  10701: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  10702: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  10703: PublicError.ACCOUNT_ALREADY_REGISTED,
  10704: PublicError.ACCOUNT_NOT_REGISTED,
  10705: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  10706: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  10801: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  20101: PublicError.PARAM_REQUIRED,
  20102: PublicError.ACCOUNT_ALREADY_REGISTED,
  30101: PublicError.PARAM_REQUIRED,
  30201: {
    errCode: 'check-device-feature-failed',
    errMsg: '设备特征校验未通过'
  },
  30202: {
    errCode: 'token-not-exist',
    errMsg: '云端已不包含此token'
  },
  30203: {
    errCode: 'token-expired',
    errMsg: 'token已过期'
  },
  30204: {
    errCode: 'check-token-failed',
    errMsg: 'token校验未通过'
  },
  40201: PublicError.USER_NOT_EXIST,
  40202: {
    errCode: 'invalid-old-password',
    errMsg: '旧密码错误'
  },
  50101: PublicError.PARAM_REQUIRED,
  50102: PublicError.PARAM_ERROR,
  50201: PublicError.PARAM_REQUIRED,
  50203: PublicError.PARAM_ERROR,
  50202: {
    errCode: 'invalid-verify-code',
    errMsg: '验证码错误或已失效'
  },
  50301: {
    errCode: 'send-sms-code-failed',
    errMsg: '验证码发送失败'
  },
  60101: PublicError.ACCOUNT_already_BOUND,
  60201: PublicError.ACCOUNT_already_BOUND,
  60301: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  60302: PublicError.ACCOUNT_already_BOUND,
  60401: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  60402: PublicError.ACCOUNT_already_BOUND,
  60501: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  60502: PublicError.ACCOUNT_already_BOUND,
  70101: PublicError.UNBIND_FAILED,
  70201: PublicError.UNBIND_FAILED,
  70301: PublicError.UNBIND_FAILED,
  70401: PublicError.UNBIND_FAILED,
  70501: PublicError.UNBIND_FAILED,
  80301: PublicError.USER_NOT_EXIST,
  80401: PublicError.SET_INVITE_CODE_FAILED,
  80402: PublicError.SET_INVITE_CODE_FAILED,
  80501: PublicError.INVALID_INVITE_CODE,
  80502: PublicError.USER_NOT_EXIST,
  80503: {
    errCode: 'modify-invite-code-is-not-allowed',
    errMsg: '邀请码不可修改'
  },
  80601: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  80602: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  80701: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  80702: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  // 80801: {
  //   errCode: 'get-weixin-sessionKey-failed',
  //   errMsg: 'sessionKey获取失败'
  // },
  // 80802: {
  //   errCode: 'decrypt-weixin-data-failed',
  //   errMsg: '解密失败'
  // },
  // 80803: {
  //   errCode: 'invalid-weixin-appid',
  //   errMsg: 'appid不匹配'
  // },
  80804: PublicError.PARAM_REQUIRED,
  80805: PublicError.PARAM_REQUIRED,
  80806: PublicError.PARAM_REQUIRED,
  90001: {
    errCode: 'database-operation-failed',
    errMsg: '数据库读写异常'
  },
  90002: PublicError.PARAM_REQUIRED,
  90003: PublicError.PARAM_ERROR,
  90004: PublicError.USER_NOT_EXIST,
  90005: PublicError.ROLE_NOT_EXIST,
  90006: PublicError.PERMISSION_NOT_EXIST
};

class UniCloudError extends Error {
  constructor (options) {
    super(options.message);
    this.errMsg = options.message || '';
    Object.defineProperties(this, {
      message: {
        get () {
          return `errCode: ${options.code || ''} | errMsg: ` + this.errMsg
        },
        set (msg) {
          this.errMsg = msg;
        }
      }
    });
  }
}

function formatError (code, values = {}) {
  const errorDetail = ErrorCode[code];
  if (!errorDetail) {
    // 不会进入此循环，仅为排错使用
    throw new Error(`unsupported error code: ${code}`)
  }
  let msg = errorDetail.errMsg;
  Object.keys(values).forEach(key => {
    msg = replaceAll(msg, `{${key}}`, values[key]);
  });
  return msg
}

// 注意：不进行递归处理
function parseParams (params = {}, rule) {
  if (!rule || !params) {
    return params
  }
  const internalKeys = ['_pre', '_purify', '_post'];
  // 转换之前的处理
  if (rule._pre) {
    params = rule._pre(params);
  }
  // 净化参数
  let purify = { shouldDelete: new Set([]) };
  if (rule._purify) {
    const _purify = rule._purify;
    for (const purifyKey in _purify) {
      _purify[purifyKey] = new Set(_purify[purifyKey]);
    }
    purify = Object.assign(purify, _purify);
  }
  if (isPlainObject(rule)) {
    for (const key in rule) {
      const parser = rule[key];
      if (isFn(parser) && internalKeys.indexOf(key) === -1) {
        params[key] = parser(params);
      } else if (typeof parser === 'string' && internalKeys.indexOf(key) === -1) {
        // 直接转换属性名称的删除旧属性名
        params[key] = params[parser];
        purify.shouldDelete.add(parser);
      }
    }
  } else if (isFn(rule)) {
    params = rule(params);
  }

  if (purify.shouldDelete) {
    for (const item of purify.shouldDelete) {
      delete params[item];
    }
  }

  // 转换之后的处理
  if (rule._post) {
    params = rule._post(params);
  }

  return params
}

function createApi (ApiClass, options) {
  const apiInstance = new ApiClass(options);
  return new Proxy(apiInstance, {
    get: function (obj, prop) {
      if (typeof obj[prop] === 'function' && prop.indexOf('_') !== 0 && obj._protocols && obj._protocols[prop]) {
        const protocol = obj._protocols[prop];
        return async function (params) {
          params = parseParams(params, protocol.args);
          let result = await obj[prop](params);
          result = parseParams(result, protocol.returnValue);
          return result
        }
      } else {
        return obj[prop]
      }
    }
  })
}

function friendlyDate (time) {
  let ms = time - Date.now();
  let num;
  let quantifier;
  let suffix = '后';
  if (ms < 0) {
    suffix = '前';
    ms = -ms;
  }
  const seconds = Math.floor((ms) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  switch (true) {
    case years > 0:
      num = years;
      quantifier = '年';
      break
    case months > 0:
      num = months;
      quantifier = '月';
      break
    case days > 0:
      num = days;
      quantifier = '天';
      break
    case hours > 0:
      num = hours;
      quantifier = '小时';
      break
    case minutes > 0:
      num = minutes;
      quantifier = '分钟';
      break
    default:
      num = seconds;
      quantifier = '秒';
      break
  }
  return `${num}${quantifier}${suffix}`
}

function parseResult (res) {
  if (isPlainObject(res)) {
    if (res.code === 0) {
      // 注意errCode 0的处理，不添加uni-id前缀，错误信息不处理
      res.errCode = res.code;
      res.message = res.errMsg = res.msg;
      delete res.messageValues;
    } else if (hasOwn(ErrorCode, res.code)) {
      const errCodeDetail = ErrorCode[res.code];
      res.errCode = 'uni-id-' + errCodeDetail.errCode;
      res.errDetail = `${res.code}, ${res.msg}`;
      res.errMsg = formatError(res.code, res.messageValues || {}) || res.msg;
      res.message = res.msg = res.errMsg;
      delete res.messageValues;
    } else if (res.code) {
      console.warn(`error code not found, error code: ${res.code}, please contact us`);
    }
  }
}

function wrapFn (fn) {
  return function () {
    const res = fn.apply(this, arguments);
    if (isPromise(res)) {
      return res.then((res) => {
        parseResult(res);
        return res
      })
    } else {
      parseResult(res);
    }
    return res
  }
}

const db = uniCloud.database();
const userCollectionName = 'uni-id-users';
const userCollection = db.collection(userCollectionName);
const verifyCollectionName = 'opendb-verify-codes';
const verifyCollection = db.collection(verifyCollectionName);
const roleCollectionName = 'uni-id-roles';
const roleCollection = db.collection(roleCollectionName);
const permissionCollectionName = 'uni-id-permissions';
const permissionCollection = db.collection(permissionCollectionName);

// 单端用户唯一字段，注意有些字段是对象类型
const uniqueUserParam = {
  username: '用户名',
  mobile: '手机号',
  email: '邮箱',
  wx_unionid: '微信账号',
  'wx_openid.app-plus': '微信账号',
  'wx_openid.mp-weixin': '微信账号',
  qq_unionid: 'QQ账号',
  'qq_openid.app-plus': 'QQ账号',
  'qq_openid.mp-weixin': 'QQ账号',
  ali_openid: '支付宝账号',
  apple_openid: '苹果账号'
};

// 公用错误码
const PublicErrorCode = {
  DB_ERROR: 90001,
  PARAM_REQUIRED: 90002,
  PARAM_ERROR: 90003,
  USER_NOT_EXIST: 90004,
  ROLE_NOT_EXIST: 90005,
  PERMISSION_NOT_EXIST: 90006
};

async function getUserInfo ({
  uid,
  field
}) {
  if (!uid) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '用户ID'
      }
    }
  }
  let res;
  if (field && field.length) {
    const fieldObj = {};
    for (let i = 0; i < field.length; i++) {
      fieldObj[field[i]] = true;
    }
    res = await userCollection.doc(uid).field(fieldObj).get();
  } else {
    res = await userCollection.doc(uid).get();
  }
  if (res.data.length === 0) {
    return {
      code: 80301
    }
  }
  return {
    code: 0,
    msg: '获取用户信息成功',
    userInfo: res.data[0]
  }
}

async function getUserInfoByToken (token) {
  const payload = this._verifyToken(token);
  if (payload.code) {
    return payload
  }
  delete payload.iat;
  delete payload.exp;
  return payload
}

async function resetPwd ({
  uid,
  password
}) {
  const {
    passwordHash,
    version
  } = this.encryptPwd(password);
  const updateData = {
    password: passwordHash,
    token: []
  };
  if (version) {
    updateData.password_secret_version = version;
  }
  const upRes = await userCollection.doc(uid).update(updateData);

  log('upRes', upRes);

  return {
    code: 0,
    msg: '密码重置成功'
  }
}

// import uniToken from './uniToken.js'

async function setAvatar (params) {
  const upRes = await userCollection.doc(params.uid).update({
    avatar: params.avatar
  });

  log('setAvatar -> upRes', upRes);

  return {
    code: 0,
    msg: '头像设置成功'
  }
}

async function updatePwd (user) {
  const userInDB = await userCollection.doc(user.uid).get();

  if (userInDB && userInDB.data && userInDB.data.length > 0) {
    const checkPwdRes = this._checkPwd(userInDB.data[0], user.oldPassword);
    if (checkPwdRes.code === 0) { // 旧密码匹配
      const {
        passwordHash,
        version
      } = this.encryptPwd(user.newPassword);
      const updateData = {
        password: passwordHash,
        token: []
      };
      if (version) {
        updateData.password_secret_version = version;
      }
      const upRes = await userCollection.doc(userInDB.data[0]._id).update(updateData);

      log('upRes', upRes);

      return {
        code: 0,
        msg: '修改成功'
      }
    } else {
      return {
        code: 40202,
        msg: '旧密码错误'
      }
    }
  } else {
    return {
      code: 40201
    }
  }
}

async function updateUser (params) {
  const uid = params.uid;
  if (!uid) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '用户Id'
      }
    }
  }
  delete params.uid;
  const {
    username,
    email
  } = params;
  const {
    usernameToLowerCase,
    emailToLowerCase
  } = this._getConfig();
  let usernameParsed = username && username.trim();
  let emailParsed = email && email.trim();
  if (usernameParsed) {
    usernameToLowerCase && (usernameParsed = usernameParsed.toLowerCase());
    params.username = usernameParsed;
  }
  if (emailParsed) {
    emailToLowerCase && (emailParsed = emailParsed.toLowerCase());
    params.email = emailParsed;
  }
  const upRes = await userCollection.doc(uid).update(params);

  log('update -> upRes', upRes);

  return {
    code: 0,
    msg: '修改成功'
  }
}

function generateApiResult (apiName, data) {
  if (data.errcode) {
    throw new UniCloudError({
      code: data.errcode || -2,
      message: data.errmsg || `${apiName} fail`
    })
  } else {
    delete data.errcode;
    delete data.errmsg;
    return {
      ...data,
      errMsg: `${apiName} ok`,
      errCode: 0
    }
  }
}

function nomalizeError (apiName, error) {
  throw new UniCloudError({
    code: error.code || -2,
    message: error.message || `${apiName} fail`
  })
}

// 微信openapi接口接收蛇形（snake case）参数返回蛇形参数，这里进行转化，如果是formdata里面的参数需要在对应api实现时就转为蛇形
async function callWxOpenApi ({
  name,
  url,
  data,
  options,
  defaultOptions
}) {
  let result = {};
  // 获取二维码的接口wxacode.get和wxacode.getUnlimited不可以传入access_token（可能有其他接口也不可以），否则会返回data format error
  const dataCopy = camel2snakeJson(Object.assign({}, data));
  if (dataCopy && dataCopy.access_token) {
    delete dataCopy.access_token;
  }
  try {
    options = Object.assign({}, defaultOptions, options, { data: dataCopy });
    result = await uniCloud.httpclient.request(url, options);
  } catch (e) {
    return nomalizeError(name, e)
  }

  // 有几个接口成功返回buffer失败返回json，对这些接口统一成返回buffer，然后分别解析
  let resData = result.data;
  const contentType = result.headers['content-type'];
  if (
    Buffer.isBuffer(resData) &&
    (contentType.indexOf('text/plain') === 0 ||
      contentType.indexOf('application/json') === 0)
  ) {
    try {
      resData = JSON.parse(resData.toString());
    } catch (e) {
      resData = resData.toString();
    }
  } else if (Buffer.isBuffer(resData)) {
    resData = {
      buffer: resData,
      contentType
    };
  }
  return snake2camelJson(
    generateApiResult(
      name,
      resData || {
        errCode: -2,
        errMsg: 'Request failed'
      }
    )
  )
}

function buildUrl (url, data) {
  let query = '';
  if (data && data.accessToken) {
    const divider = url.indexOf('?') > -1 ? '&' : '?';
    query = `${divider}access_token=${data.accessToken}`;
  }
  return `${url}${query}`
}

class Auth {
  constructor (options) {
    this.options = Object.assign({
      baseUrl: 'https://api.weixin.qq.com',
      timeout: 5000
    }, options);
  }

  async _requestWxOpenapi ({ name, url, data, options }) {
    const defaultOptions = {
      method: 'GET',
      dataType: 'json',
      dataAsQueryString: true,
      timeout: this.options.timeout
    };
    const result = await callWxOpenApi({
      name: `auth.${name}`,
      url: `${this.options.baseUrl}${buildUrl(url, data)}`,
      data,
      options,
      defaultOptions
    });
    return result
  }

  async code2Session (code) {
    const url = '/sns/jscode2session';
    const result = await this._requestWxOpenapi({
      name: 'code2Session',
      url,
      data: {
        grant_type: 'authorization_code',
        appid: this.options.appId,
        secret: this.options.secret,
        js_code: code
      }
    });
    return result
  }

  async getOauthAccessToken (code) {
    const url = '/sns/oauth2/access_token';
    const result = await this._requestWxOpenapi({
      name: 'getOauthAccessToken',
      url,
      data: {
        grant_type: 'authorization_code',
        appid: this.options.appId,
        secret: this.options.secret,
        code: code
      }
    });
    if (result.expiresIn) {
      result.expired = Date.now() + result.expiresIn;
      // delete result.expiresIn
    }
    return result
  }
}

function generateApiResult$1 (apiName, data) {
  if (data.ret || data.error) {
    // 这三种都是qq的错误码规范
    const code = data.ret || data.error || data.errcode || -2;
    const message = data.msg || data.error_description || data.errmsg || `${apiName} fail`;
    throw new UniCloudError({
      code,
      message
    })
  } else {
    delete data.ret;
    delete data.msg;
    delete data.error;
    delete data.error_description;
    delete data.errcode;
    delete data.errmsg;
    return {
      ...data,
      errMsg: `${apiName} ok`,
      errCode: 0
    }
  }
}

function nomalizeError$1 (apiName, error) {
  throw new UniCloudError({
    code: error.code || -2,
    message: error.message || `${apiName} fail`
  })
}

async function callQQOpenApi ({
  name,
  url,
  data,
  options,
  defaultOptions
}) {
  options = Object.assign({}, defaultOptions, options, { data: camel2snakeJson(Object.assign({}, data)) });
  let result;
  try {
    result = await uniCloud.httpclient.request(url, options);
  } catch (e) {
    return nomalizeError$1(name, e)
  }
  let resData = result.data;
  const contentType = result.headers['content-type'];
  if (
    Buffer.isBuffer(resData) &&
    (contentType.indexOf('text/plain') === 0 ||
      contentType.indexOf('application/json') === 0)
  ) {
    try {
      resData = JSON.parse(resData.toString());
    } catch (e) {
      resData = resData.toString();
    }
  } else if (Buffer.isBuffer(resData)) {
    resData = {
      buffer: resData,
      contentType
    };
  }
  return snake2camelJson(
    generateApiResult$1(
      name,
      resData || {
        errCode: -2,
        errMsg: 'Request failed'
      }
    )
  )
}

class Auth$1 {
  constructor (options) {
    this.options = Object.assign({
      baseUrl: 'https://graph.qq.com',
      timeout: 5000
    }, options);
  }

  async _requestQQOpenapi ({ name, url, data, options }) {
    const defaultOptions = {
      method: 'GET',
      dataType: 'json',
      dataAsQueryString: true,
      timeout: this.options.timeout
    };
    const result = await callQQOpenApi({
      name: `auth.${name}`,
      url: resolveUrl(this.options.baseUrl, url),
      data,
      options,
      defaultOptions
    });
    return result
  }

  // async getUserInfo ({
  //   accessToken,
  //   openid
  // } = {}) {
  //   const url = '/user/get_user_info'
  //   const result = await this._requestQQOpenapi({
  //     name: 'getUserInfo',
  //     url,
  //     data: {
  //       oauthConsumerKey: this.options.appId,
  //       accessToken,
  //       openid
  //     }
  //   })
  //   return result
  // }

  async getOpenidByToken ({
    accessToken
  } = {}) {
    const url = '/oauth2.0/me';
    const result = await this._requestQQOpenapi({
      name: 'getOpenidByToken',
      url,
      data: {
        accessToken,
        unionid: 1,
        fmt: 'json'
      }
    });
    if (result.clientId !== this.options.appId) {
      throw new UniCloudError({
        code: 'APPID_NOT_MATCH',
        message: '获取openid失败，appid不匹配'
      })
    }
    return {
      openid: result.openid,
      unionid: result.unionid
    }
  }

  async code2Session ({
    code
  } = {}) {
    const url = 'https://api.q.qq.com/sns/jscode2session';
    const result = await this._requestQQOpenapi({
      name: 'getOpenidByToken',
      url,
      data: {
        grant_type: 'authorization_code',
        appid: this.options.appId,
        secret: this.options.secret,
        js_code: code
      }
    });
    return result
  }
}

const ALIPAY_ALGORITHM_MAPPING = {
  RSA: 'RSA-SHA1',
  RSA2: 'RSA-SHA256'
};

class AlipayBase {
  constructor (options = {}) {
    if (!options.appId) throw new Error('appId required')
    if (!options.privateKey) throw new Error('privateKey required')
    const defaultOptions = {
      gateway: 'https://openapi.alipay.com/gateway.do',
      timeout: 5000,
      charset: 'utf-8',
      version: '1.0',
      signType: 'RSA2',
      timeOffset: -new Date().getTimezoneOffset() / 60,
      keyType: 'PKCS8'
    };

    if (options.sandbox) {
      options.gateway = 'https://openapi.alipaydev.com/gateway.do';
    }

    this.options = Object.assign({}, defaultOptions, options);

    const privateKeyType =
      this.options.keyType === 'PKCS8' ? 'PRIVATE KEY' : 'RSA PRIVATE KEY';

    this.options.privateKey = this._formatKey(
      this.options.privateKey,
      privateKeyType
    );
    if (this.options.alipayPublicKey) {
      this.options.alipayPublicKey = this._formatKey(
        this.options.alipayPublicKey,
        'PUBLIC KEY'
      );
    }
  }

  _formatKey (key, type) {
    return `-----BEGIN ${type}-----\n${key}\n-----END ${type}-----`
  }

  _formatUrl (url, params) {
    let requestUrl = url;
    // 需要放在 url 中的参数列表
    const urlArgs = [
      'app_id',
      'method',
      'format',
      'charset',
      'sign_type',
      'sign',
      'timestamp',
      'version',
      'notify_url',
      'return_url',
      'auth_token',
      'app_auth_token'
    ];

    for (const key in params) {
      if (urlArgs.indexOf(key) > -1) {
        const val = encodeURIComponent(params[key]);
        requestUrl = `${requestUrl}${
          requestUrl.includes('?') ? '&' : '?'
        }${key}=${val}`;
        // 删除 postData 中对应的数据
        delete params[key];
      }
    }

    return { execParams: params, url: requestUrl }
  }

  _getSign (method, params) {
    const bizContent = params.bizContent || null;
    delete params.bizContent;

    const signParams = Object.assign({
      method,
      appId: this.options.appId,
      charset: this.options.charset,
      version: this.options.version,
      signType: this.options.signType,
      timestamp: getFullTimeStr(getOffsetDate(this.options.timeOffset))
    }, params);

    if (bizContent) {
      signParams.bizContent = JSON.stringify(camel2snakeJson(bizContent));
    }

    // params key 驼峰转下划线
    const decamelizeParams = camel2snakeJson(signParams);

    // 排序
    const signStr = Object.keys(decamelizeParams)
      .sort()
      .map((key) => {
        let data = decamelizeParams[key];
        if (Array.prototype.toString.call(data) !== '[object String]') {
          data = JSON.stringify(data);
        }
        return `${key}=${data}`
      })
      .join('&');

    // 计算签名
    const sign = crypto
      .createSign(ALIPAY_ALGORITHM_MAPPING[this.options.signType])
      .update(signStr, 'utf8')
      .sign(this.options.privateKey, 'base64');

    return Object.assign(decamelizeParams, { sign })
  }

  async _exec (method, params = {}, option = {}) {
    // 计算签名
    const signData = this._getSign(method, params);
    const { url, execParams } = this._formatUrl(this.options.gateway, signData);
    const { status, data } = await uniCloud.httpclient.request(url, {
      method: 'POST',
      data: execParams,
      // 按 text 返回（为了验签）
      dataType: 'text',
      timeout: this.options.timeout
    });
    if (status !== 200) throw new Error('request fail')
    /**
     * 示例响应格式
     * {"alipay_trade_precreate_response":
     *  {"code": "10000","msg": "Success","out_trade_no": "111111","qr_code": "https:\/\/"},
     *  "sign": "abcde="
     * }
     * 或者
     * {"error_response":
     *  {"code":"40002","msg":"Invalid Arguments","sub_code":"isv.code-invalid","sub_msg":"授权码code无效"},
     * }
     */
    const result = JSON.parse(data);
    const responseKey = `${method.replace(/\./g, '_')}_response`;
    const response = result[responseKey];
    const errorResponse = result.error_response;
    if (response) {
      // 按字符串验签
      const validateSuccess = option.validateSign ? this._checkResponseSign(data, responseKey) : true;
      if (validateSuccess) {
        if (!response.code || response.code === '10000') {
          const errCode = 0;
          const errMsg = response.msg || '';
          return {
            errCode,
            errMsg,
            ...snake2camelJson(response)
          }
        }
        const msg = response.sub_code ? `${response.sub_code} ${response.sub_msg}` : `${response.msg || 'unkonwn error'}`;
        throw new Error(msg)
      } else {
        throw new Error('返回结果签名错误')
      }
    } else if (errorResponse) {
      throw new Error(errorResponse.sub_msg || errorResponse.msg || '接口返回错误')
    }

    throw new Error('request fail')
  }

  _checkResponseSign (signStr, responseKey) {
    if (!this.options.alipayPublicKey || this.options.alipayPublicKey === '') {
      console.warn('options.alipayPublicKey is empty');
      // 支付宝公钥不存在时不做验签
      return true
    }

    // 带验签的参数不存在时返回失败
    if (!signStr) { return false }

    // 根据服务端返回的结果截取需要验签的目标字符串
    const validateStr = this._getSignStr(signStr, responseKey);
    // 服务端返回的签名
    const serverSign = JSON.parse(signStr).sign;

    // 参数存在，并且是正常的结果（不包含 sub_code）时才验签
    const verifier = crypto.createVerify(ALIPAY_ALGORITHM_MAPPING[this.options.signType]);
    verifier.update(validateStr, 'utf8');
    return verifier.verify(this.options.alipayPublicKey, serverSign, 'base64')
  }

  _getSignStr (originStr, responseKey) {
    // 待签名的字符串
    let validateStr = originStr.trim();
    // 找到 xxx_response 开始的位置
    const startIndex = originStr.indexOf(`${responseKey}"`);
    // 找到最后一个 “"sign"” 字符串的位置（避免）
    const lastIndex = originStr.lastIndexOf('"sign"');

    /**
     * 删除 xxx_response 及之前的字符串
     * 假设原始字符串为
     *  {"xxx_response":{"code":"10000"},"sign":"jumSvxTKwn24G5sAIN"}
     * 删除后变为
     *  :{"code":"10000"},"sign":"jumSvxTKwn24G5sAIN"}
     */
    validateStr = validateStr.substr(startIndex + responseKey.length + 1);

    /**
     * 删除最后一个 "sign" 及之后的字符串
     * 删除后变为
     *  :{"code":"10000"},
     * {} 之间就是待验签的字符串
     */
    validateStr = validateStr.substr(0, lastIndex);

    // 删除第一个 { 之前的任何字符
    validateStr = validateStr.replace(/^[^{]*{/g, '{');

    // 删除最后一个 } 之后的任何字符
    validateStr = validateStr.replace(/\}([^}]*)$/g, '}');

    return validateStr
  }

  _notifyRSACheck (signArgs, signStr, signType) {
    const signContent = Object.keys(signArgs).sort().filter(val => val).map((key) => {
      let value = signArgs[key];

      if (Array.prototype.toString.call(value) !== '[object String]') {
        value = JSON.stringify(value);
      }
      return `${key}=${decodeURIComponent(value)}`
    }).join('&');

    const verifier = crypto.createVerify(ALIPAY_ALGORITHM_MAPPING[signType]);

    return verifier.update(signContent, 'utf8').verify(this.options.alipayPublicKey, signStr, 'base64')
  }

  _checkNotifySign (postData) {
    const signStr = postData.sign;

    // 未设置“支付宝公钥”或签名字符串不存，验签不通过
    if (!this.options.alipayPublicKey || !signStr) {
      return false
    }

    // 先从签名字符串中取 sign_type，再取配置项、都不存在时默认为 RSA2（RSA 已不再推荐使用）
    const signType = postData.sign_type || this.options.signType || 'RSA2';
    const signArgs = { ...postData };
    // 除去 sign
    delete signArgs.sign;

    /**
     * 某些用户可能自己删除了 sign_type 后再验签
     * 为了保持兼容性临时把 sign_type 加回来
     * 因为下面的逻辑会验签 2 次所以不会存在验签不同过的情况
     */
    signArgs.sign_type = signType;

    // 保留 sign_type 验证一次签名
    const verifyResult = this._notifyRSACheck(signArgs, signStr, signType);

    if (!verifyResult) {
      /**
       * 删除 sign_type 验一次
       * 因为“历史原因”需要用户自己判断是否需要保留 sign_type 验证签名
       * 这里是把其他 sdk 中的 rsaCheckV1、rsaCheckV2 做了合并
       */
      delete signArgs.sign_type;
      return this._notifyRSACheck(signArgs, signStr, signType)
    }

    return true
  }

  _verifyNotify (notify) {
    if (!notify.headers) {
      throw new Error('通知格式不正确')
    }
    let contentType;
    for (const key in notify.headers) {
      if (key.toLowerCase() === 'content-type') {
        contentType = notify.headers[key];
      }
    }
    if (notify.isBase64Encoded !== false && contentType.indexOf('application/x-www-form-urlencoded') === -1) {
      throw new Error('通知格式不正确')
    }
    const postData = querystring.parse(notify.body);
    if (this._checkNotifySign(postData)) {
      return snake2camelJson(postData)
    }
    throw new Error('通知验签未通过')
  }
}

var protocols = {
  code2Session: {
    // args (fromArgs) {
    //   return fromArgs
    // },
    returnValue: {
      openid: 'userId'
    }
  }
};

class Auth$2 extends AlipayBase {
  constructor (options) {
    super(options);
    this._protocols = protocols;
  }

  async code2Session (code) {
    const result = await this._exec('alipay.system.oauth.token', {
      grantType: 'authorization_code',
      code
    });
    return result
  }
}

// http://stackoverflow.com/questions/18835132/xml-to-pem-in-node-js
/* eslint-disable camelcase */
function rsaPublicKeyPem (modulus_b64, exponent_b64) {
  var modulus = Buffer.from(modulus_b64, 'base64');
  var exponent = Buffer.from(exponent_b64, 'base64');

  var modulus_hex = modulus.toString('hex');
  var exponent_hex = exponent.toString('hex');

  modulus_hex = prepadSigned(modulus_hex);
  exponent_hex = prepadSigned(exponent_hex);

  var modlen = modulus_hex.length / 2;
  var explen = exponent_hex.length / 2;

  var encoded_modlen = encodeLengthHex(modlen);
  var encoded_explen = encodeLengthHex(explen);
  var encoded_pubkey = '30' +
    encodeLengthHex(
      modlen +
      explen +
      encoded_modlen.length / 2 +
      encoded_explen.length / 2 + 2
    ) +
    '02' + encoded_modlen + modulus_hex +
    '02' + encoded_explen + exponent_hex;

  var der_b64 = Buffer.from(encoded_pubkey, 'hex').toString('base64');

  var pem = '-----BEGIN RSA PUBLIC KEY-----\n' +
    der_b64.match(/.{1,64}/g).join('\n') +
    '\n-----END RSA PUBLIC KEY-----\n';

  return pem
}

function prepadSigned (hexStr) {
  var msb = hexStr[0];
  if (msb < '0' || msb > '7') {
    return '00' + hexStr
  } else {
    return hexStr
  }
}

function toHex (number) {
  var nstr = number.toString(16);
  if (nstr.length % 2) return '0' + nstr
  return nstr
}

// encode ASN.1 DER length field
// if <=127, short form
// if >=128, long form
function encodeLengthHex (n) {
  if (n <= 127) return toHex(n)
  else {
    var n_hex = toHex(n);
    var length_of_length_byte = 128 + n_hex.length / 2; // 0x80+numbytes
    return toHex(length_of_length_byte) + n_hex
  }
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var safeBuffer = createCommonjsModule(function (module, exports) {
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
/* eslint-disable node/no-deprecated-api */

var Buffer = buffer.Buffer;

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key];
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer;
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports);
  exports.Buffer = SafeBuffer;
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.prototype = Object.create(Buffer.prototype);

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer);

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
};

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size);
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding);
    } else {
      buf.fill(fill);
    }
  } else {
    buf.fill(0);
  }
  return buf
};

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
};

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
};
});
var safeBuffer_1 = safeBuffer.Buffer;

/*global module, process*/
var Buffer$1 = safeBuffer.Buffer;



function DataStream(data) {
  this.buffer = null;
  this.writable = true;
  this.readable = true;

  // No input
  if (!data) {
    this.buffer = Buffer$1.alloc(0);
    return this;
  }

  // Stream
  if (typeof data.pipe === 'function') {
    this.buffer = Buffer$1.alloc(0);
    data.pipe(this);
    return this;
  }

  // Buffer or String
  // or Object (assumedly a passworded key)
  if (data.length || typeof data === 'object') {
    this.buffer = data;
    this.writable = false;
    process.nextTick(function () {
      this.emit('end', data);
      this.readable = false;
      this.emit('close');
    }.bind(this));
    return this;
  }

  throw new TypeError('Unexpected data type ('+ typeof data + ')');
}
util.inherits(DataStream, stream);

DataStream.prototype.write = function write(data) {
  this.buffer = Buffer$1.concat([this.buffer, Buffer$1.from(data)]);
  this.emit('data', data);
};

DataStream.prototype.end = function end(data) {
  if (data)
    this.write(data);
  this.emit('end', data);
  this.emit('close');
  this.writable = false;
  this.readable = false;
};

var dataStream = DataStream;

var Buffer$2 = buffer.Buffer; // browserify
var SlowBuffer = buffer.SlowBuffer;

var bufferEqualConstantTime = bufferEq;

function bufferEq(a, b) {

  // shortcutting on type is necessary for correctness
  if (!Buffer$2.isBuffer(a) || !Buffer$2.isBuffer(b)) {
    return false;
  }

  // buffer sizes should be well-known information, so despite this
  // shortcutting, it doesn't leak any information about the *contents* of the
  // buffers.
  if (a.length !== b.length) {
    return false;
  }

  var c = 0;
  for (var i = 0; i < a.length; i++) {
    /*jshint bitwise:false */
    c |= a[i] ^ b[i]; // XOR
  }
  return c === 0;
}

bufferEq.install = function() {
  Buffer$2.prototype.equal = SlowBuffer.prototype.equal = function equal(that) {
    return bufferEq(this, that);
  };
};

var origBufEqual = Buffer$2.prototype.equal;
var origSlowBufEqual = SlowBuffer.prototype.equal;
bufferEq.restore = function() {
  Buffer$2.prototype.equal = origBufEqual;
  SlowBuffer.prototype.equal = origSlowBufEqual;
};

function getParamSize(keySize) {
	var result = ((keySize / 8) | 0) + (keySize % 8 === 0 ? 0 : 1);
	return result;
}

var paramBytesForAlg = {
	ES256: getParamSize(256),
	ES384: getParamSize(384),
	ES512: getParamSize(521)
};

function getParamBytesForAlg(alg) {
	var paramBytes = paramBytesForAlg[alg];
	if (paramBytes) {
		return paramBytes;
	}

	throw new Error('Unknown algorithm "' + alg + '"');
}

var paramBytesForAlg_1 = getParamBytesForAlg;

var Buffer$3 = safeBuffer.Buffer;



var MAX_OCTET = 0x80,
	CLASS_UNIVERSAL = 0,
	PRIMITIVE_BIT = 0x20,
	TAG_SEQ = 0x10,
	TAG_INT = 0x02,
	ENCODED_TAG_SEQ = (TAG_SEQ | PRIMITIVE_BIT) | (CLASS_UNIVERSAL << 6),
	ENCODED_TAG_INT = TAG_INT | (CLASS_UNIVERSAL << 6);

function base64Url(base64) {
	return base64
		.replace(/=/g, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');
}

function signatureAsBuffer(signature) {
	if (Buffer$3.isBuffer(signature)) {
		return signature;
	} else if ('string' === typeof signature) {
		return Buffer$3.from(signature, 'base64');
	}

	throw new TypeError('ECDSA signature must be a Base64 string or a Buffer');
}

function derToJose(signature, alg) {
	signature = signatureAsBuffer(signature);
	var paramBytes = paramBytesForAlg_1(alg);

	// the DER encoded param should at most be the param size, plus a padding
	// zero, since due to being a signed integer
	var maxEncodedParamLength = paramBytes + 1;

	var inputLength = signature.length;

	var offset = 0;
	if (signature[offset++] !== ENCODED_TAG_SEQ) {
		throw new Error('Could not find expected "seq"');
	}

	var seqLength = signature[offset++];
	if (seqLength === (MAX_OCTET | 1)) {
		seqLength = signature[offset++];
	}

	if (inputLength - offset < seqLength) {
		throw new Error('"seq" specified length of "' + seqLength + '", only "' + (inputLength - offset) + '" remaining');
	}

	if (signature[offset++] !== ENCODED_TAG_INT) {
		throw new Error('Could not find expected "int" for "r"');
	}

	var rLength = signature[offset++];

	if (inputLength - offset - 2 < rLength) {
		throw new Error('"r" specified length of "' + rLength + '", only "' + (inputLength - offset - 2) + '" available');
	}

	if (maxEncodedParamLength < rLength) {
		throw new Error('"r" specified length of "' + rLength + '", max of "' + maxEncodedParamLength + '" is acceptable');
	}

	var rOffset = offset;
	offset += rLength;

	if (signature[offset++] !== ENCODED_TAG_INT) {
		throw new Error('Could not find expected "int" for "s"');
	}

	var sLength = signature[offset++];

	if (inputLength - offset !== sLength) {
		throw new Error('"s" specified length of "' + sLength + '", expected "' + (inputLength - offset) + '"');
	}

	if (maxEncodedParamLength < sLength) {
		throw new Error('"s" specified length of "' + sLength + '", max of "' + maxEncodedParamLength + '" is acceptable');
	}

	var sOffset = offset;
	offset += sLength;

	if (offset !== inputLength) {
		throw new Error('Expected to consume entire buffer, but "' + (inputLength - offset) + '" bytes remain');
	}

	var rPadding = paramBytes - rLength,
		sPadding = paramBytes - sLength;

	var dst = Buffer$3.allocUnsafe(rPadding + rLength + sPadding + sLength);

	for (offset = 0; offset < rPadding; ++offset) {
		dst[offset] = 0;
	}
	signature.copy(dst, offset, rOffset + Math.max(-rPadding, 0), rOffset + rLength);

	offset = paramBytes;

	for (var o = offset; offset < o + sPadding; ++offset) {
		dst[offset] = 0;
	}
	signature.copy(dst, offset, sOffset + Math.max(-sPadding, 0), sOffset + sLength);

	dst = dst.toString('base64');
	dst = base64Url(dst);

	return dst;
}

function countPadding(buf, start, stop) {
	var padding = 0;
	while (start + padding < stop && buf[start + padding] === 0) {
		++padding;
	}

	var needsSign = buf[start + padding] >= MAX_OCTET;
	if (needsSign) {
		--padding;
	}

	return padding;
}

function joseToDer(signature, alg) {
	signature = signatureAsBuffer(signature);
	var paramBytes = paramBytesForAlg_1(alg);

	var signatureBytes = signature.length;
	if (signatureBytes !== paramBytes * 2) {
		throw new TypeError('"' + alg + '" signatures must be "' + paramBytes * 2 + '" bytes, saw "' + signatureBytes + '"');
	}

	var rPadding = countPadding(signature, 0, paramBytes);
	var sPadding = countPadding(signature, paramBytes, signature.length);
	var rLength = paramBytes - rPadding;
	var sLength = paramBytes - sPadding;

	var rsBytes = 1 + 1 + rLength + 1 + 1 + sLength;

	var shortLength = rsBytes < MAX_OCTET;

	var dst = Buffer$3.allocUnsafe((shortLength ? 2 : 3) + rsBytes);

	var offset = 0;
	dst[offset++] = ENCODED_TAG_SEQ;
	if (shortLength) {
		// Bit 8 has value "0"
		// bits 7-1 give the length.
		dst[offset++] = rsBytes;
	} else {
		// Bit 8 of first octet has value "1"
		// bits 7-1 give the number of additional length octets.
		dst[offset++] = MAX_OCTET	| 1;
		// length, base 256
		dst[offset++] = rsBytes & 0xff;
	}
	dst[offset++] = ENCODED_TAG_INT;
	dst[offset++] = rLength;
	if (rPadding < 0) {
		dst[offset++] = 0;
		offset += signature.copy(dst, offset, 0, paramBytes);
	} else {
		offset += signature.copy(dst, offset, rPadding, paramBytes);
	}
	dst[offset++] = ENCODED_TAG_INT;
	dst[offset++] = sLength;
	if (sPadding < 0) {
		dst[offset++] = 0;
		signature.copy(dst, offset, paramBytes);
	} else {
		signature.copy(dst, offset, paramBytes + sPadding);
	}

	return dst;
}

var ecdsaSigFormatter = {
	derToJose: derToJose,
	joseToDer: joseToDer
};

var Buffer$4 = safeBuffer.Buffer;




var MSG_INVALID_ALGORITHM = '"%s" is not a valid algorithm.\n  Supported algorithms are:\n  "HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "PS256", "PS384", "PS512", "ES256", "ES384", "ES512" and "none".';
var MSG_INVALID_SECRET = 'secret must be a string or buffer';
var MSG_INVALID_VERIFIER_KEY = 'key must be a string or a buffer';
var MSG_INVALID_SIGNER_KEY = 'key must be a string, a buffer or an object';

var supportsKeyObjects = typeof crypto.createPublicKey === 'function';
if (supportsKeyObjects) {
  MSG_INVALID_VERIFIER_KEY += ' or a KeyObject';
  MSG_INVALID_SECRET += 'or a KeyObject';
}

function checkIsPublicKey(key) {
  if (Buffer$4.isBuffer(key)) {
    return;
  }

  if (typeof key === 'string') {
    return;
  }

  if (!supportsKeyObjects) {
    throw typeError(MSG_INVALID_VERIFIER_KEY);
  }

  if (typeof key !== 'object') {
    throw typeError(MSG_INVALID_VERIFIER_KEY);
  }

  if (typeof key.type !== 'string') {
    throw typeError(MSG_INVALID_VERIFIER_KEY);
  }

  if (typeof key.asymmetricKeyType !== 'string') {
    throw typeError(MSG_INVALID_VERIFIER_KEY);
  }

  if (typeof key.export !== 'function') {
    throw typeError(MSG_INVALID_VERIFIER_KEY);
  }
}
function checkIsPrivateKey(key) {
  if (Buffer$4.isBuffer(key)) {
    return;
  }

  if (typeof key === 'string') {
    return;
  }

  if (typeof key === 'object') {
    return;
  }

  throw typeError(MSG_INVALID_SIGNER_KEY);
}
function checkIsSecretKey(key) {
  if (Buffer$4.isBuffer(key)) {
    return;
  }

  if (typeof key === 'string') {
    return key;
  }

  if (!supportsKeyObjects) {
    throw typeError(MSG_INVALID_SECRET);
  }

  if (typeof key !== 'object') {
    throw typeError(MSG_INVALID_SECRET);
  }

  if (key.type !== 'secret') {
    throw typeError(MSG_INVALID_SECRET);
  }

  if (typeof key.export !== 'function') {
    throw typeError(MSG_INVALID_SECRET);
  }
}

function fromBase64(base64) {
  return base64
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function toBase64(base64url) {
  base64url = base64url.toString();

  var padding = 4 - base64url.length % 4;
  if (padding !== 4) {
    for (var i = 0; i < padding; ++i) {
      base64url += '=';
    }
  }

  return base64url
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
}

function typeError(template) {
  var args = [].slice.call(arguments, 1);
  var errMsg = util.format.bind(util, template).apply(null, args);
  return new TypeError(errMsg);
}

function bufferOrString(obj) {
  return Buffer$4.isBuffer(obj) || typeof obj === 'string';
}

function normalizeInput(thing) {
  if (!bufferOrString(thing))
    thing = JSON.stringify(thing);
  return thing;
}

function createHmacSigner(bits) {
  return function sign(thing, secret) {
    checkIsSecretKey(secret);
    thing = normalizeInput(thing);
    var hmac = crypto.createHmac('sha' + bits, secret);
    var sig = (hmac.update(thing), hmac.digest('base64'));
    return fromBase64(sig);
  }
}

function createHmacVerifier(bits) {
  return function verify(thing, signature, secret) {
    var computedSig = createHmacSigner(bits)(thing, secret);
    return bufferEqualConstantTime(Buffer$4.from(signature), Buffer$4.from(computedSig));
  }
}

function createKeySigner(bits) {
 return function sign(thing, privateKey) {
    checkIsPrivateKey(privateKey);
    thing = normalizeInput(thing);
    // Even though we are specifying "RSA" here, this works with ECDSA
    // keys as well.
    var signer = crypto.createSign('RSA-SHA' + bits);
    var sig = (signer.update(thing), signer.sign(privateKey, 'base64'));
    return fromBase64(sig);
  }
}

function createKeyVerifier(bits) {
  return function verify(thing, signature, publicKey) {
    checkIsPublicKey(publicKey);
    thing = normalizeInput(thing);
    signature = toBase64(signature);
    var verifier = crypto.createVerify('RSA-SHA' + bits);
    verifier.update(thing);
    return verifier.verify(publicKey, signature, 'base64');
  }
}

function createPSSKeySigner(bits) {
  return function sign(thing, privateKey) {
    checkIsPrivateKey(privateKey);
    thing = normalizeInput(thing);
    var signer = crypto.createSign('RSA-SHA' + bits);
    var sig = (signer.update(thing), signer.sign({
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
    }, 'base64'));
    return fromBase64(sig);
  }
}

function createPSSKeyVerifier(bits) {
  return function verify(thing, signature, publicKey) {
    checkIsPublicKey(publicKey);
    thing = normalizeInput(thing);
    signature = toBase64(signature);
    var verifier = crypto.createVerify('RSA-SHA' + bits);
    verifier.update(thing);
    return verifier.verify({
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
    }, signature, 'base64');
  }
}

function createECDSASigner(bits) {
  var inner = createKeySigner(bits);
  return function sign() {
    var signature = inner.apply(null, arguments);
    signature = ecdsaSigFormatter.derToJose(signature, 'ES' + bits);
    return signature;
  };
}

function createECDSAVerifer(bits) {
  var inner = createKeyVerifier(bits);
  return function verify(thing, signature, publicKey) {
    signature = ecdsaSigFormatter.joseToDer(signature, 'ES' + bits).toString('base64');
    var result = inner(thing, signature, publicKey);
    return result;
  };
}

function createNoneSigner() {
  return function sign() {
    return '';
  }
}

function createNoneVerifier() {
  return function verify(thing, signature) {
    return signature === '';
  }
}

var jwa = function jwa(algorithm) {
  var signerFactories = {
    hs: createHmacSigner,
    rs: createKeySigner,
    ps: createPSSKeySigner,
    es: createECDSASigner,
    none: createNoneSigner,
  };
  var verifierFactories = {
    hs: createHmacVerifier,
    rs: createKeyVerifier,
    ps: createPSSKeyVerifier,
    es: createECDSAVerifer,
    none: createNoneVerifier,
  };
  var match = algorithm.match(/^(RS|PS|ES|HS)(256|384|512)$|^(none)$/i);
  if (!match)
    throw typeError(MSG_INVALID_ALGORITHM, algorithm);
  var algo = (match[1] || match[3]).toLowerCase();
  var bits = match[2];

  return {
    sign: signerFactories[algo](bits),
    verify: verifierFactories[algo](bits),
  }
};

/*global module*/
var Buffer$5 = buffer.Buffer;

var tostring = function toString(obj) {
  if (typeof obj === 'string')
    return obj;
  if (typeof obj === 'number' || Buffer$5.isBuffer(obj))
    return obj.toString();
  return JSON.stringify(obj);
};

/*global module*/
var Buffer$6 = safeBuffer.Buffer;






function base64url(string, encoding) {
  return Buffer$6
    .from(string, encoding)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function jwsSecuredInput(header, payload, encoding) {
  encoding = encoding || 'utf8';
  var encodedHeader = base64url(tostring(header), 'binary');
  var encodedPayload = base64url(tostring(payload), encoding);
  return util.format('%s.%s', encodedHeader, encodedPayload);
}

function jwsSign(opts) {
  var header = opts.header;
  var payload = opts.payload;
  var secretOrKey = opts.secret || opts.privateKey;
  var encoding = opts.encoding;
  var algo = jwa(header.alg);
  var securedInput = jwsSecuredInput(header, payload, encoding);
  var signature = algo.sign(securedInput, secretOrKey);
  return util.format('%s.%s', securedInput, signature);
}

function SignStream(opts) {
  var secret = opts.secret||opts.privateKey||opts.key;
  var secretStream = new dataStream(secret);
  this.readable = true;
  this.header = opts.header;
  this.encoding = opts.encoding;
  this.secret = this.privateKey = this.key = secretStream;
  this.payload = new dataStream(opts.payload);
  this.secret.once('close', function () {
    if (!this.payload.writable && this.readable)
      this.sign();
  }.bind(this));

  this.payload.once('close', function () {
    if (!this.secret.writable && this.readable)
      this.sign();
  }.bind(this));
}
util.inherits(SignStream, stream);

SignStream.prototype.sign = function sign() {
  try {
    var signature = jwsSign({
      header: this.header,
      payload: this.payload.buffer,
      secret: this.secret.buffer,
      encoding: this.encoding
    });
    this.emit('done', signature);
    this.emit('data', signature);
    this.emit('end');
    this.readable = false;
    return signature;
  } catch (e) {
    this.readable = false;
    this.emit('error', e);
    this.emit('close');
  }
};

SignStream.sign = jwsSign;

var signStream = SignStream;

/*global module*/
var Buffer$7 = safeBuffer.Buffer;





var JWS_REGEX = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;

function isObject(thing) {
  return Object.prototype.toString.call(thing) === '[object Object]';
}

function safeJsonParse(thing) {
  if (isObject(thing))
    return thing;
  try { return JSON.parse(thing); }
  catch (e) { return undefined; }
}

function headerFromJWS(jwsSig) {
  var encodedHeader = jwsSig.split('.', 1)[0];
  return safeJsonParse(Buffer$7.from(encodedHeader, 'base64').toString('binary'));
}

function securedInputFromJWS(jwsSig) {
  return jwsSig.split('.', 2).join('.');
}

function signatureFromJWS(jwsSig) {
  return jwsSig.split('.')[2];
}

function payloadFromJWS(jwsSig, encoding) {
  encoding = encoding || 'utf8';
  var payload = jwsSig.split('.')[1];
  return Buffer$7.from(payload, 'base64').toString(encoding);
}

function isValidJws(string) {
  return JWS_REGEX.test(string) && !!headerFromJWS(string);
}

function jwsVerify(jwsSig, algorithm, secretOrKey) {
  if (!algorithm) {
    var err = new Error("Missing algorithm parameter for jws.verify");
    err.code = "MISSING_ALGORITHM";
    throw err;
  }
  jwsSig = tostring(jwsSig);
  var signature = signatureFromJWS(jwsSig);
  var securedInput = securedInputFromJWS(jwsSig);
  var algo = jwa(algorithm);
  return algo.verify(securedInput, signature, secretOrKey);
}

function jwsDecode(jwsSig, opts) {
  opts = opts || {};
  jwsSig = tostring(jwsSig);

  if (!isValidJws(jwsSig))
    return null;

  var header = headerFromJWS(jwsSig);

  if (!header)
    return null;

  var payload = payloadFromJWS(jwsSig);
  if (header.typ === 'JWT' || opts.json)
    payload = JSON.parse(payload, opts.encoding);

  return {
    header: header,
    payload: payload,
    signature: signatureFromJWS(jwsSig)
  };
}

function VerifyStream(opts) {
  opts = opts || {};
  var secretOrKey = opts.secret||opts.publicKey||opts.key;
  var secretStream = new dataStream(secretOrKey);
  this.readable = true;
  this.algorithm = opts.algorithm;
  this.encoding = opts.encoding;
  this.secret = this.publicKey = this.key = secretStream;
  this.signature = new dataStream(opts.signature);
  this.secret.once('close', function () {
    if (!this.signature.writable && this.readable)
      this.verify();
  }.bind(this));

  this.signature.once('close', function () {
    if (!this.secret.writable && this.readable)
      this.verify();
  }.bind(this));
}
util.inherits(VerifyStream, stream);
VerifyStream.prototype.verify = function verify() {
  try {
    var valid = jwsVerify(this.signature.buffer, this.algorithm, this.key.buffer);
    var obj = jwsDecode(this.signature.buffer, this.encoding);
    this.emit('done', valid, obj);
    this.emit('data', valid);
    this.emit('end');
    this.readable = false;
    return valid;
  } catch (e) {
    this.readable = false;
    this.emit('error', e);
    this.emit('close');
  }
};

VerifyStream.decode = jwsDecode;
VerifyStream.isValid = isValidJws;
VerifyStream.verify = jwsVerify;

var verifyStream = VerifyStream;

/*global exports*/



var ALGORITHMS = [
  'HS256', 'HS384', 'HS512',
  'RS256', 'RS384', 'RS512',
  'PS256', 'PS384', 'PS512',
  'ES256', 'ES384', 'ES512'
];

var ALGORITHMS_1 = ALGORITHMS;
var sign = signStream.sign;
var verify = verifyStream.verify;
var decode = verifyStream.decode;
var isValid = verifyStream.isValid;
var createSign = function createSign(opts) {
  return new signStream(opts);
};
var createVerify = function createVerify(opts) {
  return new verifyStream(opts);
};

var jws = {
	ALGORITHMS: ALGORITHMS_1,
	sign: sign,
	verify: verify,
	decode: decode,
	isValid: isValid,
	createSign: createSign,
	createVerify: createVerify
};

var decode$1 = function (jwt, options) {
  options = options || {};
  var decoded = jws.decode(jwt, options);
  if (!decoded) { return null; }
  var payload = decoded.payload;

  //try parse the payload
  if(typeof payload === 'string') {
    try {
      var obj = JSON.parse(payload);
      if(obj !== null && typeof obj === 'object') {
        payload = obj;
      }
    } catch (e) { }
  }

  //return header if `complete` option is enabled.  header includes claims
  //such as `kid` and `alg` used to select the key within a JWKS needed to
  //verify the signature
  if (options.complete === true) {
    return {
      header: decoded.header,
      payload: payload,
      signature: decoded.signature
    };
  }
  return payload;
};

var JsonWebTokenError = function (message, error) {
  Error.call(this, message);
  if(Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  }
  this.name = 'JsonWebTokenError';
  this.message = message;
  if (error) this.inner = error;
};

JsonWebTokenError.prototype = Object.create(Error.prototype);
JsonWebTokenError.prototype.constructor = JsonWebTokenError;

var JsonWebTokenError_1 = JsonWebTokenError;

var NotBeforeError = function (message, date) {
  JsonWebTokenError_1.call(this, message);
  this.name = 'NotBeforeError';
  this.date = date;
};

NotBeforeError.prototype = Object.create(JsonWebTokenError_1.prototype);

NotBeforeError.prototype.constructor = NotBeforeError;

var NotBeforeError_1 = NotBeforeError;

var TokenExpiredError = function (message, expiredAt) {
  JsonWebTokenError_1.call(this, message);
  this.name = 'TokenExpiredError';
  this.expiredAt = expiredAt;
};

TokenExpiredError.prototype = Object.create(JsonWebTokenError_1.prototype);

TokenExpiredError.prototype.constructor = TokenExpiredError;

var TokenExpiredError_1 = TokenExpiredError;

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

var ms = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}

var timespan = function (time, iat) {
  var timestamp = iat || Math.floor(Date.now() / 1000);

  if (typeof time === 'string') {
    var milliseconds = ms(time);
    if (typeof milliseconds === 'undefined') {
      return;
    }
    return Math.floor(timestamp + milliseconds / 1000);
  } else if (typeof time === 'number') {
    return timestamp + time;
  } else {
    return;
  }

};

var semver = createCommonjsModule(function (module, exports) {
exports = module.exports = SemVer;

var debug;
/* istanbul ignore next */
if (typeof process === 'object' &&
    process.env &&
    process.env.NODE_DEBUG &&
    /\bsemver\b/i.test(process.env.NODE_DEBUG)) {
  debug = function () {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('SEMVER');
    console.log.apply(console, args);
  };
} else {
  debug = function () {};
}

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
exports.SEMVER_SPEC_VERSION = '2.0.0';

var MAX_LENGTH = 256;
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||
  /* istanbul ignore next */ 9007199254740991;

// Max safe segment length for coercion.
var MAX_SAFE_COMPONENT_LENGTH = 16;

// The actual regexps go on exports.re
var re = exports.re = [];
var src = exports.src = [];
var R = 0;

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

var NUMERICIDENTIFIER = R++;
src[NUMERICIDENTIFIER] = '0|[1-9]\\d*';
var NUMERICIDENTIFIERLOOSE = R++;
src[NUMERICIDENTIFIERLOOSE] = '[0-9]+';

// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

var NONNUMERICIDENTIFIER = R++;
src[NONNUMERICIDENTIFIER] = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';

// ## Main Version
// Three dot-separated numeric identifiers.

var MAINVERSION = R++;
src[MAINVERSION] = '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')';

var MAINVERSIONLOOSE = R++;
src[MAINVERSIONLOOSE] = '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')';

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

var PRERELEASEIDENTIFIER = R++;
src[PRERELEASEIDENTIFIER] = '(?:' + src[NUMERICIDENTIFIER] +
                            '|' + src[NONNUMERICIDENTIFIER] + ')';

var PRERELEASEIDENTIFIERLOOSE = R++;
src[PRERELEASEIDENTIFIERLOOSE] = '(?:' + src[NUMERICIDENTIFIERLOOSE] +
                                 '|' + src[NONNUMERICIDENTIFIER] + ')';

// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

var PRERELEASE = R++;
src[PRERELEASE] = '(?:-(' + src[PRERELEASEIDENTIFIER] +
                  '(?:\\.' + src[PRERELEASEIDENTIFIER] + ')*))';

var PRERELEASELOOSE = R++;
src[PRERELEASELOOSE] = '(?:-?(' + src[PRERELEASEIDENTIFIERLOOSE] +
                       '(?:\\.' + src[PRERELEASEIDENTIFIERLOOSE] + ')*))';

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

var BUILDIDENTIFIER = R++;
src[BUILDIDENTIFIER] = '[0-9A-Za-z-]+';

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

var BUILD = R++;
src[BUILD] = '(?:\\+(' + src[BUILDIDENTIFIER] +
             '(?:\\.' + src[BUILDIDENTIFIER] + ')*))';

// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

var FULL = R++;
var FULLPLAIN = 'v?' + src[MAINVERSION] +
                src[PRERELEASE] + '?' +
                src[BUILD] + '?';

src[FULL] = '^' + FULLPLAIN + '$';

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
var LOOSEPLAIN = '[v=\\s]*' + src[MAINVERSIONLOOSE] +
                 src[PRERELEASELOOSE] + '?' +
                 src[BUILD] + '?';

var LOOSE = R++;
src[LOOSE] = '^' + LOOSEPLAIN + '$';

var GTLT = R++;
src[GTLT] = '((?:<|>)?=?)';

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
var XRANGEIDENTIFIERLOOSE = R++;
src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + '|x|X|\\*';
var XRANGEIDENTIFIER = R++;
src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + '|x|X|\\*';

var XRANGEPLAIN = R++;
src[XRANGEPLAIN] = '[v=\\s]*(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:' + src[PRERELEASE] + ')?' +
                   src[BUILD] + '?' +
                   ')?)?';

var XRANGEPLAINLOOSE = R++;
src[XRANGEPLAINLOOSE] = '[v=\\s]*(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:' + src[PRERELEASELOOSE] + ')?' +
                        src[BUILD] + '?' +
                        ')?)?';

var XRANGE = R++;
src[XRANGE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAIN] + '$';
var XRANGELOOSE = R++;
src[XRANGELOOSE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAINLOOSE] + '$';

// Coercion.
// Extract anything that could conceivably be a part of a valid semver
var COERCE = R++;
src[COERCE] = '(?:^|[^\\d])' +
              '(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '})' +
              '(?:\\.(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '}))?' +
              '(?:\\.(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '}))?' +
              '(?:$|[^\\d])';

// Tilde ranges.
// Meaning is "reasonably at or greater than"
var LONETILDE = R++;
src[LONETILDE] = '(?:~>?)';

var TILDETRIM = R++;
src[TILDETRIM] = '(\\s*)' + src[LONETILDE] + '\\s+';
re[TILDETRIM] = new RegExp(src[TILDETRIM], 'g');
var tildeTrimReplace = '$1~';

var TILDE = R++;
src[TILDE] = '^' + src[LONETILDE] + src[XRANGEPLAIN] + '$';
var TILDELOOSE = R++;
src[TILDELOOSE] = '^' + src[LONETILDE] + src[XRANGEPLAINLOOSE] + '$';

// Caret ranges.
// Meaning is "at least and backwards compatible with"
var LONECARET = R++;
src[LONECARET] = '(?:\\^)';

var CARETTRIM = R++;
src[CARETTRIM] = '(\\s*)' + src[LONECARET] + '\\s+';
re[CARETTRIM] = new RegExp(src[CARETTRIM], 'g');
var caretTrimReplace = '$1^';

var CARET = R++;
src[CARET] = '^' + src[LONECARET] + src[XRANGEPLAIN] + '$';
var CARETLOOSE = R++;
src[CARETLOOSE] = '^' + src[LONECARET] + src[XRANGEPLAINLOOSE] + '$';

// A simple gt/lt/eq thing, or just "" to indicate "any version"
var COMPARATORLOOSE = R++;
src[COMPARATORLOOSE] = '^' + src[GTLT] + '\\s*(' + LOOSEPLAIN + ')$|^$';
var COMPARATOR = R++;
src[COMPARATOR] = '^' + src[GTLT] + '\\s*(' + FULLPLAIN + ')$|^$';

// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
var COMPARATORTRIM = R++;
src[COMPARATORTRIM] = '(\\s*)' + src[GTLT] +
                      '\\s*(' + LOOSEPLAIN + '|' + src[XRANGEPLAIN] + ')';

// this one has to use the /g flag
re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], 'g');
var comparatorTrimReplace = '$1$2$3';

// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
var HYPHENRANGE = R++;
src[HYPHENRANGE] = '^\\s*(' + src[XRANGEPLAIN] + ')' +
                   '\\s+-\\s+' +
                   '(' + src[XRANGEPLAIN] + ')' +
                   '\\s*$';

var HYPHENRANGELOOSE = R++;
src[HYPHENRANGELOOSE] = '^\\s*(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s+-\\s+' +
                        '(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s*$';

// Star ranges basically just allow anything at all.
var STAR = R++;
src[STAR] = '(<|>)?=?\\s*\\*';

// Compile to actual regexp objects.
// All are flag-free, unless they were created above with a flag.
for (var i = 0; i < R; i++) {
  debug(i, src[i]);
  if (!re[i]) {
    re[i] = new RegExp(src[i]);
  }
}

exports.parse = parse;
function parse (version, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    };
  }

  if (version instanceof SemVer) {
    return version
  }

  if (typeof version !== 'string') {
    return null
  }

  if (version.length > MAX_LENGTH) {
    return null
  }

  var r = options.loose ? re[LOOSE] : re[FULL];
  if (!r.test(version)) {
    return null
  }

  try {
    return new SemVer(version, options)
  } catch (er) {
    return null
  }
}

exports.valid = valid;
function valid (version, options) {
  var v = parse(version, options);
  return v ? v.version : null
}

exports.clean = clean;
function clean (version, options) {
  var s = parse(version.trim().replace(/^[=v]+/, ''), options);
  return s ? s.version : null
}

exports.SemVer = SemVer;

function SemVer (version, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    };
  }
  if (version instanceof SemVer) {
    if (version.loose === options.loose) {
      return version
    } else {
      version = version.version;
    }
  } else if (typeof version !== 'string') {
    throw new TypeError('Invalid Version: ' + version)
  }

  if (version.length > MAX_LENGTH) {
    throw new TypeError('version is longer than ' + MAX_LENGTH + ' characters')
  }

  if (!(this instanceof SemVer)) {
    return new SemVer(version, options)
  }

  debug('SemVer', version, options);
  this.options = options;
  this.loose = !!options.loose;

  var m = version.trim().match(options.loose ? re[LOOSE] : re[FULL]);

  if (!m) {
    throw new TypeError('Invalid Version: ' + version)
  }

  this.raw = version;

  // these are actually numbers
  this.major = +m[1];
  this.minor = +m[2];
  this.patch = +m[3];

  if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
    throw new TypeError('Invalid major version')
  }

  if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
    throw new TypeError('Invalid minor version')
  }

  if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
    throw new TypeError('Invalid patch version')
  }

  // numberify any prerelease numeric ids
  if (!m[4]) {
    this.prerelease = [];
  } else {
    this.prerelease = m[4].split('.').map(function (id) {
      if (/^[0-9]+$/.test(id)) {
        var num = +id;
        if (num >= 0 && num < MAX_SAFE_INTEGER) {
          return num
        }
      }
      return id
    });
  }

  this.build = m[5] ? m[5].split('.') : [];
  this.format();
}

SemVer.prototype.format = function () {
  this.version = this.major + '.' + this.minor + '.' + this.patch;
  if (this.prerelease.length) {
    this.version += '-' + this.prerelease.join('.');
  }
  return this.version
};

SemVer.prototype.toString = function () {
  return this.version
};

SemVer.prototype.compare = function (other) {
  debug('SemVer.compare', this.version, this.options, other);
  if (!(other instanceof SemVer)) {
    other = new SemVer(other, this.options);
  }

  return this.compareMain(other) || this.comparePre(other)
};

SemVer.prototype.compareMain = function (other) {
  if (!(other instanceof SemVer)) {
    other = new SemVer(other, this.options);
  }

  return compareIdentifiers(this.major, other.major) ||
         compareIdentifiers(this.minor, other.minor) ||
         compareIdentifiers(this.patch, other.patch)
};

SemVer.prototype.comparePre = function (other) {
  if (!(other instanceof SemVer)) {
    other = new SemVer(other, this.options);
  }

  // NOT having a prerelease is > having one
  if (this.prerelease.length && !other.prerelease.length) {
    return -1
  } else if (!this.prerelease.length && other.prerelease.length) {
    return 1
  } else if (!this.prerelease.length && !other.prerelease.length) {
    return 0
  }

  var i = 0;
  do {
    var a = this.prerelease[i];
    var b = other.prerelease[i];
    debug('prerelease compare', i, a, b);
    if (a === undefined && b === undefined) {
      return 0
    } else if (b === undefined) {
      return 1
    } else if (a === undefined) {
      return -1
    } else if (a === b) {
      continue
    } else {
      return compareIdentifiers(a, b)
    }
  } while (++i)
};

// preminor will bump the version up to the next minor release, and immediately
// down to pre-release. premajor and prepatch work the same way.
SemVer.prototype.inc = function (release, identifier) {
  switch (release) {
    case 'premajor':
      this.prerelease.length = 0;
      this.patch = 0;
      this.minor = 0;
      this.major++;
      this.inc('pre', identifier);
      break
    case 'preminor':
      this.prerelease.length = 0;
      this.patch = 0;
      this.minor++;
      this.inc('pre', identifier);
      break
    case 'prepatch':
      // If this is already a prerelease, it will bump to the next version
      // drop any prereleases that might already exist, since they are not
      // relevant at this point.
      this.prerelease.length = 0;
      this.inc('patch', identifier);
      this.inc('pre', identifier);
      break
    // If the input is a non-prerelease version, this acts the same as
    // prepatch.
    case 'prerelease':
      if (this.prerelease.length === 0) {
        this.inc('patch', identifier);
      }
      this.inc('pre', identifier);
      break

    case 'major':
      // If this is a pre-major version, bump up to the same major version.
      // Otherwise increment major.
      // 1.0.0-5 bumps to 1.0.0
      // 1.1.0 bumps to 2.0.0
      if (this.minor !== 0 ||
          this.patch !== 0 ||
          this.prerelease.length === 0) {
        this.major++;
      }
      this.minor = 0;
      this.patch = 0;
      this.prerelease = [];
      break
    case 'minor':
      // If this is a pre-minor version, bump up to the same minor version.
      // Otherwise increment minor.
      // 1.2.0-5 bumps to 1.2.0
      // 1.2.1 bumps to 1.3.0
      if (this.patch !== 0 || this.prerelease.length === 0) {
        this.minor++;
      }
      this.patch = 0;
      this.prerelease = [];
      break
    case 'patch':
      // If this is not a pre-release version, it will increment the patch.
      // If it is a pre-release it will bump up to the same patch version.
      // 1.2.0-5 patches to 1.2.0
      // 1.2.0 patches to 1.2.1
      if (this.prerelease.length === 0) {
        this.patch++;
      }
      this.prerelease = [];
      break
    // This probably shouldn't be used publicly.
    // 1.0.0 "pre" would become 1.0.0-0 which is the wrong direction.
    case 'pre':
      if (this.prerelease.length === 0) {
        this.prerelease = [0];
      } else {
        var i = this.prerelease.length;
        while (--i >= 0) {
          if (typeof this.prerelease[i] === 'number') {
            this.prerelease[i]++;
            i = -2;
          }
        }
        if (i === -1) {
          // didn't increment anything
          this.prerelease.push(0);
        }
      }
      if (identifier) {
        // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
        // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
        if (this.prerelease[0] === identifier) {
          if (isNaN(this.prerelease[1])) {
            this.prerelease = [identifier, 0];
          }
        } else {
          this.prerelease = [identifier, 0];
        }
      }
      break

    default:
      throw new Error('invalid increment argument: ' + release)
  }
  this.format();
  this.raw = this.version;
  return this
};

exports.inc = inc;
function inc (version, release, loose, identifier) {
  if (typeof (loose) === 'string') {
    identifier = loose;
    loose = undefined;
  }

  try {
    return new SemVer(version, loose).inc(release, identifier).version
  } catch (er) {
    return null
  }
}

exports.diff = diff;
function diff (version1, version2) {
  if (eq(version1, version2)) {
    return null
  } else {
    var v1 = parse(version1);
    var v2 = parse(version2);
    var prefix = '';
    if (v1.prerelease.length || v2.prerelease.length) {
      prefix = 'pre';
      var defaultResult = 'prerelease';
    }
    for (var key in v1) {
      if (key === 'major' || key === 'minor' || key === 'patch') {
        if (v1[key] !== v2[key]) {
          return prefix + key
        }
      }
    }
    return defaultResult // may be undefined
  }
}

exports.compareIdentifiers = compareIdentifiers;

var numeric = /^[0-9]+$/;
function compareIdentifiers (a, b) {
  var anum = numeric.test(a);
  var bnum = numeric.test(b);

  if (anum && bnum) {
    a = +a;
    b = +b;
  }

  return a === b ? 0
    : (anum && !bnum) ? -1
    : (bnum && !anum) ? 1
    : a < b ? -1
    : 1
}

exports.rcompareIdentifiers = rcompareIdentifiers;
function rcompareIdentifiers (a, b) {
  return compareIdentifiers(b, a)
}

exports.major = major;
function major (a, loose) {
  return new SemVer(a, loose).major
}

exports.minor = minor;
function minor (a, loose) {
  return new SemVer(a, loose).minor
}

exports.patch = patch;
function patch (a, loose) {
  return new SemVer(a, loose).patch
}

exports.compare = compare;
function compare (a, b, loose) {
  return new SemVer(a, loose).compare(new SemVer(b, loose))
}

exports.compareLoose = compareLoose;
function compareLoose (a, b) {
  return compare(a, b, true)
}

exports.rcompare = rcompare;
function rcompare (a, b, loose) {
  return compare(b, a, loose)
}

exports.sort = sort;
function sort (list, loose) {
  return list.sort(function (a, b) {
    return exports.compare(a, b, loose)
  })
}

exports.rsort = rsort;
function rsort (list, loose) {
  return list.sort(function (a, b) {
    return exports.rcompare(a, b, loose)
  })
}

exports.gt = gt;
function gt (a, b, loose) {
  return compare(a, b, loose) > 0
}

exports.lt = lt;
function lt (a, b, loose) {
  return compare(a, b, loose) < 0
}

exports.eq = eq;
function eq (a, b, loose) {
  return compare(a, b, loose) === 0
}

exports.neq = neq;
function neq (a, b, loose) {
  return compare(a, b, loose) !== 0
}

exports.gte = gte;
function gte (a, b, loose) {
  return compare(a, b, loose) >= 0
}

exports.lte = lte;
function lte (a, b, loose) {
  return compare(a, b, loose) <= 0
}

exports.cmp = cmp;
function cmp (a, op, b, loose) {
  switch (op) {
    case '===':
      if (typeof a === 'object')
        a = a.version;
      if (typeof b === 'object')
        b = b.version;
      return a === b

    case '!==':
      if (typeof a === 'object')
        a = a.version;
      if (typeof b === 'object')
        b = b.version;
      return a !== b

    case '':
    case '=':
    case '==':
      return eq(a, b, loose)

    case '!=':
      return neq(a, b, loose)

    case '>':
      return gt(a, b, loose)

    case '>=':
      return gte(a, b, loose)

    case '<':
      return lt(a, b, loose)

    case '<=':
      return lte(a, b, loose)

    default:
      throw new TypeError('Invalid operator: ' + op)
  }
}

exports.Comparator = Comparator;
function Comparator (comp, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    };
  }

  if (comp instanceof Comparator) {
    if (comp.loose === !!options.loose) {
      return comp
    } else {
      comp = comp.value;
    }
  }

  if (!(this instanceof Comparator)) {
    return new Comparator(comp, options)
  }

  debug('comparator', comp, options);
  this.options = options;
  this.loose = !!options.loose;
  this.parse(comp);

  if (this.semver === ANY) {
    this.value = '';
  } else {
    this.value = this.operator + this.semver.version;
  }

  debug('comp', this);
}

var ANY = {};
Comparator.prototype.parse = function (comp) {
  var r = this.options.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
  var m = comp.match(r);

  if (!m) {
    throw new TypeError('Invalid comparator: ' + comp)
  }

  this.operator = m[1];
  if (this.operator === '=') {
    this.operator = '';
  }

  // if it literally is just '>' or '' then allow anything.
  if (!m[2]) {
    this.semver = ANY;
  } else {
    this.semver = new SemVer(m[2], this.options.loose);
  }
};

Comparator.prototype.toString = function () {
  return this.value
};

Comparator.prototype.test = function (version) {
  debug('Comparator.test', version, this.options.loose);

  if (this.semver === ANY) {
    return true
  }

  if (typeof version === 'string') {
    version = new SemVer(version, this.options);
  }

  return cmp(version, this.operator, this.semver, this.options)
};

Comparator.prototype.intersects = function (comp, options) {
  if (!(comp instanceof Comparator)) {
    throw new TypeError('a Comparator is required')
  }

  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    };
  }

  var rangeTmp;

  if (this.operator === '') {
    rangeTmp = new Range(comp.value, options);
    return satisfies(this.value, rangeTmp, options)
  } else if (comp.operator === '') {
    rangeTmp = new Range(this.value, options);
    return satisfies(comp.semver, rangeTmp, options)
  }

  var sameDirectionIncreasing =
    (this.operator === '>=' || this.operator === '>') &&
    (comp.operator === '>=' || comp.operator === '>');
  var sameDirectionDecreasing =
    (this.operator === '<=' || this.operator === '<') &&
    (comp.operator === '<=' || comp.operator === '<');
  var sameSemVer = this.semver.version === comp.semver.version;
  var differentDirectionsInclusive =
    (this.operator === '>=' || this.operator === '<=') &&
    (comp.operator === '>=' || comp.operator === '<=');
  var oppositeDirectionsLessThan =
    cmp(this.semver, '<', comp.semver, options) &&
    ((this.operator === '>=' || this.operator === '>') &&
    (comp.operator === '<=' || comp.operator === '<'));
  var oppositeDirectionsGreaterThan =
    cmp(this.semver, '>', comp.semver, options) &&
    ((this.operator === '<=' || this.operator === '<') &&
    (comp.operator === '>=' || comp.operator === '>'));

  return sameDirectionIncreasing || sameDirectionDecreasing ||
    (sameSemVer && differentDirectionsInclusive) ||
    oppositeDirectionsLessThan || oppositeDirectionsGreaterThan
};

exports.Range = Range;
function Range (range, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    };
  }

  if (range instanceof Range) {
    if (range.loose === !!options.loose &&
        range.includePrerelease === !!options.includePrerelease) {
      return range
    } else {
      return new Range(range.raw, options)
    }
  }

  if (range instanceof Comparator) {
    return new Range(range.value, options)
  }

  if (!(this instanceof Range)) {
    return new Range(range, options)
  }

  this.options = options;
  this.loose = !!options.loose;
  this.includePrerelease = !!options.includePrerelease;

  // First, split based on boolean or ||
  this.raw = range;
  this.set = range.split(/\s*\|\|\s*/).map(function (range) {
    return this.parseRange(range.trim())
  }, this).filter(function (c) {
    // throw out any that are not relevant for whatever reason
    return c.length
  });

  if (!this.set.length) {
    throw new TypeError('Invalid SemVer Range: ' + range)
  }

  this.format();
}

Range.prototype.format = function () {
  this.range = this.set.map(function (comps) {
    return comps.join(' ').trim()
  }).join('||').trim();
  return this.range
};

Range.prototype.toString = function () {
  return this.range
};

Range.prototype.parseRange = function (range) {
  var loose = this.options.loose;
  range = range.trim();
  // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
  var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
  range = range.replace(hr, hyphenReplace);
  debug('hyphen replace', range);
  // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
  range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
  debug('comparator trim', range, re[COMPARATORTRIM]);

  // `~ 1.2.3` => `~1.2.3`
  range = range.replace(re[TILDETRIM], tildeTrimReplace);

  // `^ 1.2.3` => `^1.2.3`
  range = range.replace(re[CARETTRIM], caretTrimReplace);

  // normalize spaces
  range = range.split(/\s+/).join(' ');

  // At this point, the range is completely trimmed and
  // ready to be split into comparators.

  var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
  var set = range.split(' ').map(function (comp) {
    return parseComparator(comp, this.options)
  }, this).join(' ').split(/\s+/);
  if (this.options.loose) {
    // in loose mode, throw out any that are not valid comparators
    set = set.filter(function (comp) {
      return !!comp.match(compRe)
    });
  }
  set = set.map(function (comp) {
    return new Comparator(comp, this.options)
  }, this);

  return set
};

Range.prototype.intersects = function (range, options) {
  if (!(range instanceof Range)) {
    throw new TypeError('a Range is required')
  }

  return this.set.some(function (thisComparators) {
    return thisComparators.every(function (thisComparator) {
      return range.set.some(function (rangeComparators) {
        return rangeComparators.every(function (rangeComparator) {
          return thisComparator.intersects(rangeComparator, options)
        })
      })
    })
  })
};

// Mostly just for testing and legacy API reasons
exports.toComparators = toComparators;
function toComparators (range, options) {
  return new Range(range, options).set.map(function (comp) {
    return comp.map(function (c) {
      return c.value
    }).join(' ').trim().split(' ')
  })
}

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
function parseComparator (comp, options) {
  debug('comp', comp, options);
  comp = replaceCarets(comp, options);
  debug('caret', comp);
  comp = replaceTildes(comp, options);
  debug('tildes', comp);
  comp = replaceXRanges(comp, options);
  debug('xrange', comp);
  comp = replaceStars(comp, options);
  debug('stars', comp);
  return comp
}

function isX (id) {
  return !id || id.toLowerCase() === 'x' || id === '*'
}

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
function replaceTildes (comp, options) {
  return comp.trim().split(/\s+/).map(function (comp) {
    return replaceTilde(comp, options)
  }).join(' ')
}

function replaceTilde (comp, options) {
  var r = options.loose ? re[TILDELOOSE] : re[TILDE];
  return comp.replace(r, function (_, M, m, p, pr) {
    debug('tilde', comp, _, M, m, p, pr);
    var ret;

    if (isX(M)) {
      ret = '';
    } else if (isX(m)) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    } else if (isX(p)) {
      // ~1.2 == >=1.2.0 <1.3.0
      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
    } else if (pr) {
      debug('replaceTilde pr', pr);
      ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
            ' <' + M + '.' + (+m + 1) + '.0';
    } else {
      // ~1.2.3 == >=1.2.3 <1.3.0
      ret = '>=' + M + '.' + m + '.' + p +
            ' <' + M + '.' + (+m + 1) + '.0';
    }

    debug('tilde return', ret);
    return ret
  })
}

// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
// ^1.2.3 --> >=1.2.3 <2.0.0
// ^1.2.0 --> >=1.2.0 <2.0.0
function replaceCarets (comp, options) {
  return comp.trim().split(/\s+/).map(function (comp) {
    return replaceCaret(comp, options)
  }).join(' ')
}

function replaceCaret (comp, options) {
  debug('caret', comp, options);
  var r = options.loose ? re[CARETLOOSE] : re[CARET];
  return comp.replace(r, function (_, M, m, p, pr) {
    debug('caret', comp, _, M, m, p, pr);
    var ret;

    if (isX(M)) {
      ret = '';
    } else if (isX(m)) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    } else if (isX(p)) {
      if (M === '0') {
        ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
      } else {
        ret = '>=' + M + '.' + m + '.0 <' + (+M + 1) + '.0.0';
      }
    } else if (pr) {
      debug('replaceCaret pr', pr);
      if (M === '0') {
        if (m === '0') {
          ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
                ' <' + M + '.' + m + '.' + (+p + 1);
        } else {
          ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
                ' <' + M + '.' + (+m + 1) + '.0';
        }
      } else {
        ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
              ' <' + (+M + 1) + '.0.0';
      }
    } else {
      debug('no pr');
      if (M === '0') {
        if (m === '0') {
          ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + m + '.' + (+p + 1);
        } else {
          ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + (+m + 1) + '.0';
        }
      } else {
        ret = '>=' + M + '.' + m + '.' + p +
              ' <' + (+M + 1) + '.0.0';
      }
    }

    debug('caret return', ret);
    return ret
  })
}

function replaceXRanges (comp, options) {
  debug('replaceXRanges', comp, options);
  return comp.split(/\s+/).map(function (comp) {
    return replaceXRange(comp, options)
  }).join(' ')
}

function replaceXRange (comp, options) {
  comp = comp.trim();
  var r = options.loose ? re[XRANGELOOSE] : re[XRANGE];
  return comp.replace(r, function (ret, gtlt, M, m, p, pr) {
    debug('xRange', comp, ret, gtlt, M, m, p, pr);
    var xM = isX(M);
    var xm = xM || isX(m);
    var xp = xm || isX(p);
    var anyX = xp;

    if (gtlt === '=' && anyX) {
      gtlt = '';
    }

    if (xM) {
      if (gtlt === '>' || gtlt === '<') {
        // nothing is allowed
        ret = '<0.0.0';
      } else {
        // nothing is forbidden
        ret = '*';
      }
    } else if (gtlt && anyX) {
      // we know patch is an x, because we have any x at all.
      // replace X with 0
      if (xm) {
        m = 0;
      }
      p = 0;

      if (gtlt === '>') {
        // >1 => >=2.0.0
        // >1.2 => >=1.3.0
        // >1.2.3 => >= 1.2.4
        gtlt = '>=';
        if (xm) {
          M = +M + 1;
          m = 0;
          p = 0;
        } else {
          m = +m + 1;
          p = 0;
        }
      } else if (gtlt === '<=') {
        // <=0.7.x is actually <0.8.0, since any 0.7.x should
        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
        gtlt = '<';
        if (xm) {
          M = +M + 1;
        } else {
          m = +m + 1;
        }
      }

      ret = gtlt + M + '.' + m + '.' + p;
    } else if (xm) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    } else if (xp) {
      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
    }

    debug('xRange return', ret);

    return ret
  })
}

// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
function replaceStars (comp, options) {
  debug('replaceStars', comp, options);
  // Looseness is ignored here.  star is always as loose as it gets!
  return comp.trim().replace(re[STAR], '')
}

// This function is passed to string.replace(re[HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0
function hyphenReplace ($0,
  from, fM, fm, fp, fpr, fb,
  to, tM, tm, tp, tpr, tb) {
  if (isX(fM)) {
    from = '';
  } else if (isX(fm)) {
    from = '>=' + fM + '.0.0';
  } else if (isX(fp)) {
    from = '>=' + fM + '.' + fm + '.0';
  } else {
    from = '>=' + from;
  }

  if (isX(tM)) {
    to = '';
  } else if (isX(tm)) {
    to = '<' + (+tM + 1) + '.0.0';
  } else if (isX(tp)) {
    to = '<' + tM + '.' + (+tm + 1) + '.0';
  } else if (tpr) {
    to = '<=' + tM + '.' + tm + '.' + tp + '-' + tpr;
  } else {
    to = '<=' + to;
  }

  return (from + ' ' + to).trim()
}

// if ANY of the sets match ALL of its comparators, then pass
Range.prototype.test = function (version) {
  if (!version) {
    return false
  }

  if (typeof version === 'string') {
    version = new SemVer(version, this.options);
  }

  for (var i = 0; i < this.set.length; i++) {
    if (testSet(this.set[i], version, this.options)) {
      return true
    }
  }
  return false
};

function testSet (set, version, options) {
  for (var i = 0; i < set.length; i++) {
    if (!set[i].test(version)) {
      return false
    }
  }

  if (version.prerelease.length && !options.includePrerelease) {
    // Find the set of versions that are allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (i = 0; i < set.length; i++) {
      debug(set[i].semver);
      if (set[i].semver === ANY) {
        continue
      }

      if (set[i].semver.prerelease.length > 0) {
        var allowed = set[i].semver;
        if (allowed.major === version.major &&
            allowed.minor === version.minor &&
            allowed.patch === version.patch) {
          return true
        }
      }
    }

    // Version has a -pre, but it's not one of the ones we like.
    return false
  }

  return true
}

exports.satisfies = satisfies;
function satisfies (version, range, options) {
  try {
    range = new Range(range, options);
  } catch (er) {
    return false
  }
  return range.test(version)
}

exports.maxSatisfying = maxSatisfying;
function maxSatisfying (versions, range, options) {
  var max = null;
  var maxSV = null;
  try {
    var rangeObj = new Range(range, options);
  } catch (er) {
    return null
  }
  versions.forEach(function (v) {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!max || maxSV.compare(v) === -1) {
        // compare(max, v, true)
        max = v;
        maxSV = new SemVer(max, options);
      }
    }
  });
  return max
}

exports.minSatisfying = minSatisfying;
function minSatisfying (versions, range, options) {
  var min = null;
  var minSV = null;
  try {
    var rangeObj = new Range(range, options);
  } catch (er) {
    return null
  }
  versions.forEach(function (v) {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!min || minSV.compare(v) === 1) {
        // compare(min, v, true)
        min = v;
        minSV = new SemVer(min, options);
      }
    }
  });
  return min
}

exports.minVersion = minVersion;
function minVersion (range, loose) {
  range = new Range(range, loose);

  var minver = new SemVer('0.0.0');
  if (range.test(minver)) {
    return minver
  }

  minver = new SemVer('0.0.0-0');
  if (range.test(minver)) {
    return minver
  }

  minver = null;
  for (var i = 0; i < range.set.length; ++i) {
    var comparators = range.set[i];

    comparators.forEach(function (comparator) {
      // Clone to avoid manipulating the comparator's semver object.
      var compver = new SemVer(comparator.semver.version);
      switch (comparator.operator) {
        case '>':
          if (compver.prerelease.length === 0) {
            compver.patch++;
          } else {
            compver.prerelease.push(0);
          }
          compver.raw = compver.format();
          /* fallthrough */
        case '':
        case '>=':
          if (!minver || gt(minver, compver)) {
            minver = compver;
          }
          break
        case '<':
        case '<=':
          /* Ignore maximum versions */
          break
        /* istanbul ignore next */
        default:
          throw new Error('Unexpected operation: ' + comparator.operator)
      }
    });
  }

  if (minver && range.test(minver)) {
    return minver
  }

  return null
}

exports.validRange = validRange;
function validRange (range, options) {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range, options).range || '*'
  } catch (er) {
    return null
  }
}

// Determine if version is less than all the versions possible in the range
exports.ltr = ltr;
function ltr (version, range, options) {
  return outside(version, range, '<', options)
}

// Determine if version is greater than all the versions possible in the range.
exports.gtr = gtr;
function gtr (version, range, options) {
  return outside(version, range, '>', options)
}

exports.outside = outside;
function outside (version, range, hilo, options) {
  version = new SemVer(version, options);
  range = new Range(range, options);

  var gtfn, ltefn, ltfn, comp, ecomp;
  switch (hilo) {
    case '>':
      gtfn = gt;
      ltefn = lte;
      ltfn = lt;
      comp = '>';
      ecomp = '>=';
      break
    case '<':
      gtfn = lt;
      ltefn = gte;
      ltfn = gt;
      comp = '<';
      ecomp = '<=';
      break
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"')
  }

  // If it satisifes the range it is not outside
  if (satisfies(version, range, options)) {
    return false
  }

  // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.

  for (var i = 0; i < range.set.length; ++i) {
    var comparators = range.set[i];

    var high = null;
    var low = null;

    comparators.forEach(function (comparator) {
      if (comparator.semver === ANY) {
        comparator = new Comparator('>=0.0.0');
      }
      high = high || comparator;
      low = low || comparator;
      if (gtfn(comparator.semver, high.semver, options)) {
        high = comparator;
      } else if (ltfn(comparator.semver, low.semver, options)) {
        low = comparator;
      }
    });

    // If the edge version comparator has a operator then our version
    // isn't outside it
    if (high.operator === comp || high.operator === ecomp) {
      return false
    }

    // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range
    if ((!low.operator || low.operator === comp) &&
        ltefn(version, low.semver)) {
      return false
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false
    }
  }
  return true
}

exports.prerelease = prerelease;
function prerelease (version, options) {
  var parsed = parse(version, options);
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
}

exports.intersects = intersects;
function intersects (r1, r2, options) {
  r1 = new Range(r1, options);
  r2 = new Range(r2, options);
  return r1.intersects(r2)
}

exports.coerce = coerce;
function coerce (version) {
  if (version instanceof SemVer) {
    return version
  }

  if (typeof version !== 'string') {
    return null
  }

  var match = version.match(re[COERCE]);

  if (match == null) {
    return null
  }

  return parse(match[1] +
    '.' + (match[2] || '0') +
    '.' + (match[3] || '0'))
}
});
var semver_1 = semver.SEMVER_SPEC_VERSION;
var semver_2 = semver.re;
var semver_3 = semver.src;
var semver_4 = semver.parse;
var semver_5 = semver.valid;
var semver_6 = semver.clean;
var semver_7 = semver.SemVer;
var semver_8 = semver.inc;
var semver_9 = semver.diff;
var semver_10 = semver.compareIdentifiers;
var semver_11 = semver.rcompareIdentifiers;
var semver_12 = semver.major;
var semver_13 = semver.minor;
var semver_14 = semver.patch;
var semver_15 = semver.compare;
var semver_16 = semver.compareLoose;
var semver_17 = semver.rcompare;
var semver_18 = semver.sort;
var semver_19 = semver.rsort;
var semver_20 = semver.gt;
var semver_21 = semver.lt;
var semver_22 = semver.eq;
var semver_23 = semver.neq;
var semver_24 = semver.gte;
var semver_25 = semver.lte;
var semver_26 = semver.cmp;
var semver_27 = semver.Comparator;
var semver_28 = semver.Range;
var semver_29 = semver.toComparators;
var semver_30 = semver.satisfies;
var semver_31 = semver.maxSatisfying;
var semver_32 = semver.minSatisfying;
var semver_33 = semver.minVersion;
var semver_34 = semver.validRange;
var semver_35 = semver.ltr;
var semver_36 = semver.gtr;
var semver_37 = semver.outside;
var semver_38 = semver.prerelease;
var semver_39 = semver.intersects;
var semver_40 = semver.coerce;

var psSupported = semver.satisfies(process.version, '^6.12.0 || >=8.0.0');

var PUB_KEY_ALGS = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512'];
var RSA_KEY_ALGS = ['RS256', 'RS384', 'RS512'];
var HS_ALGS = ['HS256', 'HS384', 'HS512'];

if (psSupported) {
  PUB_KEY_ALGS.splice(3, 0, 'PS256', 'PS384', 'PS512');
  RSA_KEY_ALGS.splice(3, 0, 'PS256', 'PS384', 'PS512');
}

var verify$1 = function (jwtString, secretOrPublicKey, options, callback) {
  if ((typeof options === 'function') && !callback) {
    callback = options;
    options = {};
  }

  if (!options) {
    options = {};
  }

  //clone this object since we are going to mutate it.
  options = Object.assign({}, options);

  var done;

  if (callback) {
    done = callback;
  } else {
    done = function(err, data) {
      if (err) throw err;
      return data;
    };
  }

  if (options.clockTimestamp && typeof options.clockTimestamp !== 'number') {
    return done(new JsonWebTokenError_1('clockTimestamp must be a number'));
  }

  if (options.nonce !== undefined && (typeof options.nonce !== 'string' || options.nonce.trim() === '')) {
    return done(new JsonWebTokenError_1('nonce must be a non-empty string'));
  }

  var clockTimestamp = options.clockTimestamp || Math.floor(Date.now() / 1000);

  if (!jwtString){
    return done(new JsonWebTokenError_1('jwt must be provided'));
  }

  if (typeof jwtString !== 'string') {
    return done(new JsonWebTokenError_1('jwt must be a string'));
  }

  var parts = jwtString.split('.');

  if (parts.length !== 3){
    return done(new JsonWebTokenError_1('jwt malformed'));
  }

  var decodedToken;

  try {
    decodedToken = decode$1(jwtString, { complete: true });
  } catch(err) {
    return done(err);
  }

  if (!decodedToken) {
    return done(new JsonWebTokenError_1('invalid token'));
  }

  var header = decodedToken.header;
  var getSecret;

  if(typeof secretOrPublicKey === 'function') {
    if(!callback) {
      return done(new JsonWebTokenError_1('verify must be called asynchronous if secret or public key is provided as a callback'));
    }

    getSecret = secretOrPublicKey;
  }
  else {
    getSecret = function(header, secretCallback) {
      return secretCallback(null, secretOrPublicKey);
    };
  }

  return getSecret(header, function(err, secretOrPublicKey) {
    if(err) {
      return done(new JsonWebTokenError_1('error in secret or public key callback: ' + err.message));
    }

    var hasSignature = parts[2].trim() !== '';

    if (!hasSignature && secretOrPublicKey){
      return done(new JsonWebTokenError_1('jwt signature is required'));
    }

    if (hasSignature && !secretOrPublicKey) {
      return done(new JsonWebTokenError_1('secret or public key must be provided'));
    }

    if (!hasSignature && !options.algorithms) {
      options.algorithms = ['none'];
    }

    if (!options.algorithms) {
      options.algorithms = ~secretOrPublicKey.toString().indexOf('BEGIN CERTIFICATE') ||
        ~secretOrPublicKey.toString().indexOf('BEGIN PUBLIC KEY') ? PUB_KEY_ALGS :
        ~secretOrPublicKey.toString().indexOf('BEGIN RSA PUBLIC KEY') ? RSA_KEY_ALGS : HS_ALGS;

    }

    if (!~options.algorithms.indexOf(decodedToken.header.alg)) {
      return done(new JsonWebTokenError_1('invalid algorithm'));
    }

    var valid;

    try {
      valid = jws.verify(jwtString, decodedToken.header.alg, secretOrPublicKey);
    } catch (e) {
      return done(e);
    }

    if (!valid) {
      return done(new JsonWebTokenError_1('invalid signature'));
    }

    var payload = decodedToken.payload;

    if (typeof payload.nbf !== 'undefined' && !options.ignoreNotBefore) {
      if (typeof payload.nbf !== 'number') {
        return done(new JsonWebTokenError_1('invalid nbf value'));
      }
      if (payload.nbf > clockTimestamp + (options.clockTolerance || 0)) {
        return done(new NotBeforeError_1('jwt not active', new Date(payload.nbf * 1000)));
      }
    }

    if (typeof payload.exp !== 'undefined' && !options.ignoreExpiration) {
      if (typeof payload.exp !== 'number') {
        return done(new JsonWebTokenError_1('invalid exp value'));
      }
      if (clockTimestamp >= payload.exp + (options.clockTolerance || 0)) {
        return done(new TokenExpiredError_1('jwt expired', new Date(payload.exp * 1000)));
      }
    }

    if (options.audience) {
      var audiences = Array.isArray(options.audience) ? options.audience : [options.audience];
      var target = Array.isArray(payload.aud) ? payload.aud : [payload.aud];

      var match = target.some(function (targetAudience) {
        return audiences.some(function (audience) {
          return audience instanceof RegExp ? audience.test(targetAudience) : audience === targetAudience;
        });
      });

      if (!match) {
        return done(new JsonWebTokenError_1('jwt audience invalid. expected: ' + audiences.join(' or ')));
      }
    }

    if (options.issuer) {
      var invalid_issuer =
              (typeof options.issuer === 'string' && payload.iss !== options.issuer) ||
              (Array.isArray(options.issuer) && options.issuer.indexOf(payload.iss) === -1);

      if (invalid_issuer) {
        return done(new JsonWebTokenError_1('jwt issuer invalid. expected: ' + options.issuer));
      }
    }

    if (options.subject) {
      if (payload.sub !== options.subject) {
        return done(new JsonWebTokenError_1('jwt subject invalid. expected: ' + options.subject));
      }
    }

    if (options.jwtid) {
      if (payload.jti !== options.jwtid) {
        return done(new JsonWebTokenError_1('jwt jwtid invalid. expected: ' + options.jwtid));
      }
    }

    if (options.nonce) {
      if (payload.nonce !== options.nonce) {
        return done(new JsonWebTokenError_1('jwt nonce invalid. expected: ' + options.nonce));
      }
    }

    if (options.maxAge) {
      if (typeof payload.iat !== 'number') {
        return done(new JsonWebTokenError_1('iat required when maxAge is specified'));
      }

      var maxAgeTimestamp = timespan(options.maxAge, payload.iat);
      if (typeof maxAgeTimestamp === 'undefined') {
        return done(new JsonWebTokenError_1('"maxAge" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
      }
      if (clockTimestamp >= maxAgeTimestamp + (options.clockTolerance || 0)) {
        return done(new TokenExpiredError_1('maxAge exceeded', new Date(maxAgeTimestamp * 1000)));
      }
    }

    if (options.complete === true) {
      var signature = decodedToken.signature;

      return done(null, {
        header: header,
        payload: payload,
        signature: signature
      });
    }

    return done(null, payload);
  });
};

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0,
    MAX_SAFE_INTEGER = 9007199254740991,
    MAX_INTEGER = 1.7976931348623157e+308,
    NAN = 0 / 0;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array ? array.length : 0,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  if (value !== value) {
    return baseFindIndex(array, baseIsNaN, fromIndex);
  }
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * The base implementation of `_.values` and `_.valuesIn` which creates an
 * array of `object` property values corresponding to the property names
 * of `props`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} props The property names to get values for.
 * @returns {Object} Returns the array of property values.
 */
function baseValues(object, props) {
  return arrayMap(props, function(key) {
    return object[key];
  });
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object),
    nativeMax = Math.max;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty$1.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$1.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Checks if `value` is in `collection`. If `collection` is a string, it's
 * checked for a substring of `value`, otherwise
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * is used for equality comparisons. If `fromIndex` is negative, it's used as
 * the offset from the end of `collection`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object|string} collection The collection to inspect.
 * @param {*} value The value to search for.
 * @param {number} [fromIndex=0] The index to search from.
 * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
 * @returns {boolean} Returns `true` if `value` is found, else `false`.
 * @example
 *
 * _.includes([1, 2, 3], 1);
 * // => true
 *
 * _.includes([1, 2, 3], 1, 2);
 * // => false
 *
 * _.includes({ 'a': 1, 'b': 2 }, 1);
 * // => true
 *
 * _.includes('abcd', 'bc');
 * // => true
 */
function includes(collection, value, fromIndex, guard) {
  collection = isArrayLike(collection) ? collection : values(collection);
  fromIndex = (fromIndex && !guard) ? toInteger(fromIndex) : 0;

  var length = collection.length;
  if (fromIndex < 0) {
    fromIndex = nativeMax(length + fromIndex, 0);
  }
  return isString(collection)
    ? (fromIndex <= length && collection.indexOf(value, fromIndex) > -1)
    : (!!length && baseIndexOf(collection, value, fromIndex) > -1);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty$1.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject$1(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject$1(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' ||
    (!isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag);
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a finite number.
 *
 * @static
 * @memberOf _
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * _.toFinite(3.2);
 * // => 3.2
 *
 * _.toFinite(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toFinite(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toFinite('3.2');
 * // => 3.2
 */
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber(value);
  if (value === INFINITY || value === -INFINITY) {
    var sign = (value < 0 ? -1 : 1);
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}

/**
 * Converts `value` to an integer.
 *
 * **Note:** This method is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3.2);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3.2');
 * // => 3
 */
function toInteger(value) {
  var result = toFinite(value),
      remainder = result % 1;

  return result === result ? (remainder ? result - remainder : result) : 0;
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject$1(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject$1(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

/**
 * Creates an array of the own enumerable string keyed property values of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property values.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.values(new Foo);
 * // => [1, 2] (iteration order is not guaranteed)
 *
 * _.values('hi');
 * // => ['h', 'i']
 */
function values(object) {
  return object ? baseValues(object, keys(object)) : [];
}

var lodash_includes = includes;

/**
 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var boolTag = '[object Boolean]';

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$1 = objectProto$1.toString;

/**
 * Checks if `value` is classified as a boolean primitive or object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isBoolean(false);
 * // => true
 *
 * _.isBoolean(null);
 * // => false
 */
function isBoolean(value) {
  return value === true || value === false ||
    (isObjectLike$1(value) && objectToString$1.call(value) == boolTag);
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike$1(value) {
  return !!value && typeof value == 'object';
}

var lodash_isboolean = isBoolean;

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var INFINITY$1 = 1 / 0,
    MAX_INTEGER$1 = 1.7976931348623157e+308,
    NAN$1 = 0 / 0;

/** `Object#toString` result references. */
var symbolTag$1 = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim$1 = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex$1 = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary$1 = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal$1 = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt$1 = parseInt;

/** Used for built-in method references. */
var objectProto$2 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$2 = objectProto$2.toString;

/**
 * Checks if `value` is an integer.
 *
 * **Note:** This method is based on
 * [`Number.isInteger`](https://mdn.io/Number/isInteger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an integer, else `false`.
 * @example
 *
 * _.isInteger(3);
 * // => true
 *
 * _.isInteger(Number.MIN_VALUE);
 * // => false
 *
 * _.isInteger(Infinity);
 * // => false
 *
 * _.isInteger('3');
 * // => false
 */
function isInteger(value) {
  return typeof value == 'number' && value == toInteger$1(value);
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject$2(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike$2(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol$1(value) {
  return typeof value == 'symbol' ||
    (isObjectLike$2(value) && objectToString$2.call(value) == symbolTag$1);
}

/**
 * Converts `value` to a finite number.
 *
 * @static
 * @memberOf _
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * _.toFinite(3.2);
 * // => 3.2
 *
 * _.toFinite(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toFinite(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toFinite('3.2');
 * // => 3.2
 */
function toFinite$1(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber$1(value);
  if (value === INFINITY$1 || value === -INFINITY$1) {
    var sign = (value < 0 ? -1 : 1);
    return sign * MAX_INTEGER$1;
  }
  return value === value ? value : 0;
}

/**
 * Converts `value` to an integer.
 *
 * **Note:** This method is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3.2);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3.2');
 * // => 3
 */
function toInteger$1(value) {
  var result = toFinite$1(value),
      remainder = result % 1;

  return result === result ? (remainder ? result - remainder : result) : 0;
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber$1(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol$1(value)) {
    return NAN$1;
  }
  if (isObject$2(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject$2(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim$1, '');
  var isBinary = reIsBinary$1.test(value);
  return (isBinary || reIsOctal$1.test(value))
    ? freeParseInt$1(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex$1.test(value) ? NAN$1 : +value);
}

var lodash_isinteger = isInteger;

/**
 * lodash 3.0.3 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var numberTag = '[object Number]';

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$3 = objectProto$3.toString;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike$3(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Number` primitive or object.
 *
 * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are classified
 * as numbers, use the `_.isFinite` method.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isNumber(3);
 * // => true
 *
 * _.isNumber(Number.MIN_VALUE);
 * // => true
 *
 * _.isNumber(Infinity);
 * // => true
 *
 * _.isNumber('3');
 * // => false
 */
function isNumber(value) {
  return typeof value == 'number' ||
    (isObjectLike$3(value) && objectToString$3.call(value) == numberTag);
}

var lodash_isnumber = isNumber;

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg$1(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto$4 = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$4.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$4 = objectProto$4.toString;

/** Built-in value references. */
var getPrototype = overArg$1(Object.getPrototypeOf, Object);

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike$4(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject$1(value) {
  if (!isObjectLike$4(value) ||
      objectToString$4.call(value) != objectTag || isHostObject(value)) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty$2.call(proto, 'constructor') && proto.constructor;
  return (typeof Ctor == 'function' &&
    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
}

var lodash_isplainobject = isPlainObject$1;

/**
 * lodash 4.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var stringTag$1 = '[object String]';

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$5 = objectProto$5.toString;

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray$1 = Array.isArray;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike$5(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString$1(value) {
  return typeof value == 'string' ||
    (!isArray$1(value) && isObjectLike$5(value) && objectToString$5.call(value) == stringTag$1);
}

var lodash_isstring = isString$1;

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var INFINITY$2 = 1 / 0,
    MAX_INTEGER$2 = 1.7976931348623157e+308,
    NAN$2 = 0 / 0;

/** `Object#toString` result references. */
var symbolTag$2 = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim$2 = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex$2 = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary$2 = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal$2 = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt$2 = parseInt;

/** Used for built-in method references. */
var objectProto$6 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString$6 = objectProto$6.toString;

/**
 * Creates a function that invokes `func`, with the `this` binding and arguments
 * of the created function, while it's called less than `n` times. Subsequent
 * calls to the created function return the result of the last `func` invocation.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Function
 * @param {number} n The number of calls at which `func` is no longer invoked.
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new restricted function.
 * @example
 *
 * jQuery(element).on('click', _.before(5, addContactToList));
 * // => Allows adding up to 4 contacts to the list.
 */
function before(n, func) {
  var result;
  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  n = toInteger$2(n);
  return function() {
    if (--n > 0) {
      result = func.apply(this, arguments);
    }
    if (n <= 1) {
      func = undefined;
    }
    return result;
  };
}

/**
 * Creates a function that is restricted to invoking `func` once. Repeat calls
 * to the function return the value of the first invocation. The `func` is
 * invoked with the `this` binding and arguments of the created function.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new restricted function.
 * @example
 *
 * var initialize = _.once(createApplication);
 * initialize();
 * initialize();
 * // => `createApplication` is invoked once
 */
function once(func) {
  return before(2, func);
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject$3(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike$6(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol$2(value) {
  return typeof value == 'symbol' ||
    (isObjectLike$6(value) && objectToString$6.call(value) == symbolTag$2);
}

/**
 * Converts `value` to a finite number.
 *
 * @static
 * @memberOf _
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * _.toFinite(3.2);
 * // => 3.2
 *
 * _.toFinite(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toFinite(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toFinite('3.2');
 * // => 3.2
 */
function toFinite$2(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = toNumber$2(value);
  if (value === INFINITY$2 || value === -INFINITY$2) {
    var sign = (value < 0 ? -1 : 1);
    return sign * MAX_INTEGER$2;
  }
  return value === value ? value : 0;
}

/**
 * Converts `value` to an integer.
 *
 * **Note:** This method is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3.2);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3.2');
 * // => 3
 */
function toInteger$2(value) {
  var result = toFinite$2(value),
      remainder = result % 1;

  return result === result ? (remainder ? result - remainder : result) : 0;
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber$2(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol$2(value)) {
    return NAN$2;
  }
  if (isObject$3(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject$3(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim$2, '');
  var isBinary = reIsBinary$2.test(value);
  return (isBinary || reIsOctal$2.test(value))
    ? freeParseInt$2(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex$2.test(value) ? NAN$2 : +value);
}

var lodash_once = once;

var SUPPORTED_ALGS = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'HS256', 'HS384', 'HS512', 'none'];
if (psSupported) {
  SUPPORTED_ALGS.splice(3, 0, 'PS256', 'PS384', 'PS512');
}

var sign_options_schema = {
  expiresIn: { isValid: function(value) { return lodash_isinteger(value) || (lodash_isstring(value) && value); }, message: '"expiresIn" should be a number of seconds or string representing a timespan' },
  notBefore: { isValid: function(value) { return lodash_isinteger(value) || (lodash_isstring(value) && value); }, message: '"notBefore" should be a number of seconds or string representing a timespan' },
  audience: { isValid: function(value) { return lodash_isstring(value) || Array.isArray(value); }, message: '"audience" must be a string or array' },
  algorithm: { isValid: lodash_includes.bind(null, SUPPORTED_ALGS), message: '"algorithm" must be a valid string enum value' },
  header: { isValid: lodash_isplainobject, message: '"header" must be an object' },
  encoding: { isValid: lodash_isstring, message: '"encoding" must be a string' },
  issuer: { isValid: lodash_isstring, message: '"issuer" must be a string' },
  subject: { isValid: lodash_isstring, message: '"subject" must be a string' },
  jwtid: { isValid: lodash_isstring, message: '"jwtid" must be a string' },
  noTimestamp: { isValid: lodash_isboolean, message: '"noTimestamp" must be a boolean' },
  keyid: { isValid: lodash_isstring, message: '"keyid" must be a string' },
  mutatePayload: { isValid: lodash_isboolean, message: '"mutatePayload" must be a boolean' }
};

var registered_claims_schema = {
  iat: { isValid: lodash_isnumber, message: '"iat" should be a number of seconds' },
  exp: { isValid: lodash_isnumber, message: '"exp" should be a number of seconds' },
  nbf: { isValid: lodash_isnumber, message: '"nbf" should be a number of seconds' }
};

function validate(schema, allowUnknown, object, parameterName) {
  if (!lodash_isplainobject(object)) {
    throw new Error('Expected "' + parameterName + '" to be a plain object.');
  }
  Object.keys(object)
    .forEach(function(key) {
      var validator = schema[key];
      if (!validator) {
        if (!allowUnknown) {
          throw new Error('"' + key + '" is not allowed in "' + parameterName + '"');
        }
        return;
      }
      if (!validator.isValid(object[key])) {
        throw new Error(validator.message);
      }
    });
}

function validateOptions(options) {
  return validate(sign_options_schema, false, options, 'options');
}

function validatePayload(payload) {
  return validate(registered_claims_schema, true, payload, 'payload');
}

var options_to_payload = {
  'audience': 'aud',
  'issuer': 'iss',
  'subject': 'sub',
  'jwtid': 'jti'
};

var options_for_objects = [
  'expiresIn',
  'notBefore',
  'noTimestamp',
  'audience',
  'issuer',
  'subject',
  'jwtid',
];

var sign$1 = function (payload, secretOrPrivateKey, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  } else {
    options = options || {};
  }

  var isObjectPayload = typeof payload === 'object' &&
                        !Buffer.isBuffer(payload);

  var header = Object.assign({
    alg: options.algorithm || 'HS256',
    typ: isObjectPayload ? 'JWT' : undefined,
    kid: options.keyid
  }, options.header);

  function failure(err) {
    if (callback) {
      return callback(err);
    }
    throw err;
  }

  if (!secretOrPrivateKey && options.algorithm !== 'none') {
    return failure(new Error('secretOrPrivateKey must have a value'));
  }

  if (typeof payload === 'undefined') {
    return failure(new Error('payload is required'));
  } else if (isObjectPayload) {
    try {
      validatePayload(payload);
    }
    catch (error) {
      return failure(error);
    }
    if (!options.mutatePayload) {
      payload = Object.assign({},payload);
    }
  } else {
    var invalid_options = options_for_objects.filter(function (opt) {
      return typeof options[opt] !== 'undefined';
    });

    if (invalid_options.length > 0) {
      return failure(new Error('invalid ' + invalid_options.join(',') + ' option for ' + (typeof payload ) + ' payload'));
    }
  }

  if (typeof payload.exp !== 'undefined' && typeof options.expiresIn !== 'undefined') {
    return failure(new Error('Bad "options.expiresIn" option the payload already has an "exp" property.'));
  }

  if (typeof payload.nbf !== 'undefined' && typeof options.notBefore !== 'undefined') {
    return failure(new Error('Bad "options.notBefore" option the payload already has an "nbf" property.'));
  }

  try {
    validateOptions(options);
  }
  catch (error) {
    return failure(error);
  }

  var timestamp = payload.iat || Math.floor(Date.now() / 1000);

  if (options.noTimestamp) {
    delete payload.iat;
  } else if (isObjectPayload) {
    payload.iat = timestamp;
  }

  if (typeof options.notBefore !== 'undefined') {
    try {
      payload.nbf = timespan(options.notBefore, timestamp);
    }
    catch (err) {
      return failure(err);
    }
    if (typeof payload.nbf === 'undefined') {
      return failure(new Error('"notBefore" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
    }
  }

  if (typeof options.expiresIn !== 'undefined' && typeof payload === 'object') {
    try {
      payload.exp = timespan(options.expiresIn, timestamp);
    }
    catch (err) {
      return failure(err);
    }
    if (typeof payload.exp === 'undefined') {
      return failure(new Error('"expiresIn" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60'));
    }
  }

  Object.keys(options_to_payload).forEach(function (key) {
    var claim = options_to_payload[key];
    if (typeof options[key] !== 'undefined') {
      if (typeof payload[claim] !== 'undefined') {
        return failure(new Error('Bad "options.' + key + '" option. The payload already has an "' + claim + '" property.'));
      }
      payload[claim] = options[key];
    }
  });

  var encoding = options.encoding || 'utf8';

  if (typeof callback === 'function') {
    callback = callback && lodash_once(callback);

    jws.createSign({
      header: header,
      privateKey: secretOrPrivateKey,
      payload: payload,
      encoding: encoding
    }).once('error', callback)
      .once('done', function (signature) {
        callback(null, signature);
      });
  } else {
    return jws.sign({header: header, payload: payload, secret: secretOrPrivateKey, encoding: encoding});
  }
};

var jsonwebtoken = {
  decode: decode$1,
  verify: verify$1,
  sign: sign$1,
  JsonWebTokenError: JsonWebTokenError_1,
  NotBeforeError: NotBeforeError_1,
  TokenExpiredError: TokenExpiredError_1,
};

/* eslint-disable camelcase */

let authKeys = [];

class Auth$3 {
  constructor (options) {
    this.fetched = false;
    this.options = Object.assign({
      baseUrl: 'https://appleid.apple.com',
      timeout: 10000
    }, options);
  }

  async _fetch (url, options) {
    const { baseUrl } = this.options;
    return uniCloud.httpclient.request(baseUrl + url, options)
  }

  async verifyIdentityToken (identityToken) {
    // 解密出kid，拿取key
    const jwtHeader = identityToken.split('.')[0];
    const kid = JSON.parse(Buffer.from(jwtHeader, 'base64').toString()).kid;

    if (!authKeys.length) {
      try {
        authKeys = await this.getAuthKeys();
      } catch (error) {
        return {
          code: 10705,
          msg: error.message,
          messageValues: {
            account: '苹果账号'
          }
        }
      }
    }

    // 从这组密钥中，选择具有匹配密钥标识符（kid）的密钥，以验证Apple发行的任何JSON Web令牌（JWT）的签名
    let usedKey = this.getUsedKey(authKeys, kid);

    if (!Object.keys(usedKey).length && !this.fetched) {
      try {
        authKeys = await this.getAuthKeys();
      } catch (error) {
        return {
          code: 10705,
          msg: error.message,
          messageValues: {
            account: '苹果账号'
          }
        }
      }
      usedKey = this.getUsedKey(authKeys, kid);
    }

    /* {
        iss: 'https://appleid.apple.com',aud: 'io.dcloud.hellouniapp',exp: 1610626724,
        iat: 1610540324,sub: '000628.30119d332d9b45a3be4a297f9391fd5c.0403',c_hash: 'oFfgewoG36cJX00KUbj45A',email: 'x2awmap99s@privaterelay.appleid.com',
        email_verified: 'true',is_private_email: 'true',auth_time: 1610540324,nonce_supported: true
    } */
    let jwtClaims = null;
    try {
      jwtClaims = jsonwebtoken.verify(identityToken, rsaPublicKeyPem(usedKey.n, usedKey.e), { algorithms: usedKey.alg });
    } catch (error) {
      return {
        code: 10705,
        msg: error.message,
        messageValues: {
          account: '苹果账号'
        }
      }
    }

    return {
      code: 0,
      msg: jwtClaims
    }
  }

  async getAuthKeys () {
    const { status, data } = await this._fetch('/auth/keys', {
      method: 'GET',
      dataType: 'json',
      timeout: this.options.timeout
    });
    this.fetched = true;
    if (status !== 200) throw new Error('request fail')
    return data.keys
  }

  getUsedKey (authKeys, kid) {
    // 从这组密钥中，选择具有匹配密钥标识符（kid）的密钥，以验证Apple发行的任何JSON Web令牌（JWT）的签名
    let usedKey = {};
    for (let index = 0; index < authKeys.length; index++) {
      const item = authKeys[index];
      if (item.kid === kid) {
        usedKey = item;
        break
      }
    }
    return usedKey
  }
}

var platformApi = {
  initWeixin: function (options = {}) {
    options.appId = options.appid;
    options.secret = options.appsecret;
    return createApi(Auth, options)
  },
  initQQ: function (options = {}) {
    options.appId = options.appid;
    options.secret = options.appsecret;
    return createApi(Auth$1, options)
  },
  initAlipay: function (options = {}) {
    options.appId = options.appid;
    return createApi(Auth$2, options)
  },
  initApple: function (options = {}) {
    return createApi(Auth$3, options)
  }
};

function getWeixinApi ({ platform } = {}) {
  const clientPlatform = platform || this.context.PLATFORM;
  if (!clientPlatform) {
    throw new Error('未能获取客户端平台信息，请主动传入platform')
  }
  const config = this._getConfig(clientPlatform);
  if (!config.oauth || !config.oauth.weixin) {
    throw new Error(`请在公用模块uni-id的config.json中添加${clientPlatform}平台微信登录配置项`)
  }
  const argsRequired = ['appid', 'appsecret'];
  argsRequired.forEach((item) => {
    if (!config.oauth.weixin[item]) {
      throw new Error(`请在公用模块uni-id的config.json中添加配置项：${clientPlatform}.oauth.weixin.${item}`)
    }
  });
  const weixinApi = platformApi.initWeixin({ ...config.oauth.weixin, clientType: clientPlatform });
  return weixinApi
}

function getQQApi () {
  const clientPlatform = this.context.PLATFORM;
  if (!clientPlatform) {
    throw new Error('未能获取客户端平台信息，请主动传入platform')
  }
  const config = this._getConfig(clientPlatform);
  if (!config.oauth || !config.oauth.qq) {
    throw new Error(`请在公用模块uni-id的config.json中添加${clientPlatform}平台QQ登录配置项`)
  }
  const argsRequired = ['appid', 'appsecret'];
  argsRequired.forEach((item) => {
    if (!config.oauth.qq[item]) {
      throw new Error(`请在公用模块uni-id的config.json中添加配置项：${clientPlatform}.oauth.qq.${item}`)
    }
  });
  const qqApi = platformApi.initQQ({ ...config.oauth.qq, clientType: clientPlatform });
  return qqApi
}

function getAlipayApi ({ platform } = {}) {
  const clientPlatform = platform || this.context.PLATFORM;
  if (!clientPlatform) {
    throw new Error('未能获取客户端平台信息，请主动传入platform')
  }
  const config = this._getConfig(clientPlatform);
  if (!config.oauth || !config.oauth.alipay) {
    throw new Error(`请在公用模块uni-id的config.json中添加${clientPlatform}平台支付宝登录配置项`)
  }
  const argsRequired = ['appid', 'privateKey'];
  argsRequired.forEach((item) => {
    if (!config.oauth.alipay[item]) {
      throw new Error(`请在公用模块uni-id的config.json中添加配置项：${clientPlatform}.oauth.alipay.${item}`)
    }
  });
  const alipayApi = platformApi.initAlipay({ ...config.oauth.alipay, clientType: clientPlatform });
  return alipayApi
}

// 邀请码由大写字母加数字组成，由于存在手动输入邀请码的场景，从可选字符中去除 0、1、I、O
function getRandomInviteCode (len = 6) {
  const charArr = ['2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  let code = '';
  for (let i = 0; i < len; i++) {
    code += charArr[Math.floor(Math.random() * charArr.length)];
  }
  return code
}

async function getValidInviteCode ({
  inviteCode
}) {
  let retry = 10;
  let code;
  if (inviteCode) {
    retry = 1;
    code = inviteCode;
  } else {
    code = getRandomInviteCode();
  }
  let codeValid = false;
  try {
    while (retry > 0 && !codeValid) {
      retry--;
      const codeInDb = await userCollection.where({
        invite_code: code
      }).get();
      if (codeInDb.data.length === 0) {
        codeValid = true;
        break
      }
      code = getRandomInviteCode();
    }
    if (!codeValid) {
      if (inviteCode) {
        return {
          code: 80401,
          msg: '邀请码重复，设置失败'
        }
      } else {
        return {
          code: 80402,
          msg: '邀请码设置失败稍后再试'
        }
      }
    }
    return {
      code: 0,
      inviteCode: code
    }
  } catch (error) {
    return {
      code: 90001,
      msg: '数据库读写异常'
    }
  }
}

async function loginExec (user, options = {}) {
  if (user.status === 1) {
    return {
      code: 10001,
      msg: '账号已禁用'
    }
  }

  const config = this._getConfig();
  // 过期token清理
  let tokenList = user.token || [];
  // 兼容旧版逻辑
  if (typeof tokenList === 'string') {
    tokenList = [tokenList];
  }
  const expiredToken = this._getExpiredToken(tokenList);
  tokenList = tokenList.filter(item => {
    return expiredToken.indexOf(item) === -1
  });

  let tokenInfo;
  if (config.removePermissionAndRoleFromToken) {
    const needPermission = options.needPermission;
    tokenInfo = await this.createToken({
      uid: user._id,
      needPermission
    });
  } else {
    const role = user.role || [];
    let permission;
    if (role.length === 0 || role.includes('admin')) {
      permission = [];
    } else {
      permission = await this._getPermissionListByRoleList(role);
    }
    tokenInfo = await this.createToken({
      uid: user._id,
      role,
      permission
    });
  }

  const {
    token,
    tokenExpired
  } = tokenInfo;

  tokenList.push(token);
  user.token = tokenList;

  const updateData = {
    last_login_date: Date.now(),
    last_login_ip: this.context.CLIENTIP,
    token: tokenList,
    ...options.extraData
  };

  // 更新不存在dcloud_appid的用户，设置上dcloud_appid。会导致不兼容，废弃此行为
  // if (!user.dcloud_appid) {
  //   updateData.dcloud_appid = [this.context.APPID]
  // }

  await userCollection.doc(user._id).update(updateData);

  const userInfo = Object.assign({}, user, updateData);

  return {
    code: 0,
    msg: '登录成功',
    token,
    uid: userInfo._id,
    username: userInfo.username,
    type: 'login',
    userInfo,
    tokenExpired
  }
}

async function addUser (user, {
  needPermission,
  autoSetDcloudAppid = true
} = {}) {
  const config = this._getConfig();
  const addData = {
    ...user,
    dcloud_appid: autoSetDcloudAppid ? [this.context.APPID] : [],
    register_date: Date.now(),
    register_ip: this.context.CLIENTIP
  };
  const addRes = await userCollection.add(addData);

  const uid = addRes.id;

  let tokenInfo;
  if (config.removePermissionAndRoleFromToken) {
    tokenInfo = await this.createToken({
      uid,
      needPermission
    });
  } else {
    const role = user.role || [];
    let permission;
    if (role.length === 0 || role.includes('admin')) {
      permission = [];
    } else {
      permission = await this._getPermissionListByRoleList(role);
    }
    tokenInfo = await this.createToken({
      uid,
      role,
      permission
    });
  }

  const {
    token,
    tokenExpired
  } = tokenInfo;

  await userCollection.doc(uid).update({
    token: [token]
  });

  return {
    token,
    tokenExpired,
    uid,
    type: 'register',
    userInfo: Object.assign({}, addData, { token })
  }
}

async function registerExec (user, {
  needPermission,
  autoSetDcloudAppid = true
} = {}) {
  const {
    my_invite_code: myInviteCode
  } = user;
  const config = this._getConfig();

  if (config.autoSetInviteCode || myInviteCode) {
    const validResult = await this._getValidInviteCode({
      inviteCode: myInviteCode
    });
    if (validResult.code) {
      return validResult
    }
    user.my_invite_code = validResult.inviteCode;
  }

  const registerResult = await this._addUser(user, {
    needPermission,
    autoSetDcloudAppid
  });

  return {
    code: 0,
    msg: '注册成功',
    ...registerResult
  }
}

/**
 * 根据用户列表获取匹配的用户，登录用接口
 * @param {Array} userList 数据库内查询到的用户列表
 * @param {Object[]} filterList 匹配规则
 * @param {string} filterList[].field 需要匹配的字段
 * @param {string} filterList[].value 需要匹配的字段值
 * @param {string} filterList[].fallbackValue 需要匹配的字段值
 * @returns {Object} 返回值，包含错误信息或被筛选出的用户
 */

function getMatchedUser (userList, filterList) {
  if (userList.length === 0) {
    return {
      code: 10002
    }
  }
  let userMatched;
  const userClassified = {};
  const fallbackValueMatchedMap = {};
  for (let i = userList.length - 1; i >= 0; i--) {
    const user = userList[i];
    for (let j = 0; j < filterList.length; j++) {
      const {
        field,
        value,
        fallbackValue
      } = filterList[j];
      if (value && user[field] === value) {
        userClassified[field] = user;
        userList.splice(i, 1);
      } else if (fallbackValue && user[field] === fallbackValue) {
        if (!userClassified[field]) {
          userClassified[field] = user;
        }
        fallbackValueMatchedMap[field] = true;
        userList.splice(i, 1);
      }
    }
  }
  const userClassifiedKeys = Object.keys(userClassified);
  let fieldMatched;
  switch (userClassifiedKeys.length) {
    case 0:
      userMatched = userList[0];
      userList.splice(0, 1);
      break
    case 1:
      fieldMatched = userClassifiedKeys[0];
      userMatched = userClassified[fieldMatched];
      break
    default:
      return {
        code: 10003,
        messageValues: {
          target: '用户'
        }
      }
  }
  if (userList.length > 0) {
    return {
      code: 10003,
      messageValues: {
        target: '用户'
      }
    }
  }
  return {
    code: 0,
    msg: '',
    userMatched,
    fieldMatched,
    isFallbackValueMatched: fieldMatched ? fallbackValueMatchedMap[fieldMatched] : false
  }
}

/**
 * 根据用户列表获取当前客户端应用匹配的用户
 * @param {Array} userList 数据库内查询到的用户列表
 * @returns {Object} 返回值，包含错误信息或被筛选出的用户
 */

function getCurrentAppUser (userList) {
  const dcloudAppid = this.context.APPID;
  return userList.filter(item => {
    // 空数组不允许登录
    return item.dcloud_appid === undefined || item.dcloud_appid === null || item.dcloud_appid.indexOf(dcloudAppid) > -1
  })
}

async function checkCanAuthorize ({
  uid,
  dcloudAppidList
} = {}) {
  if (!uid) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '用户ID'
      }
    }
  }
  if (!dcloudAppidList || dcloudAppidList.length === 0 || dcloudAppidList.some(item => item === undefined)) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '应用Appid'
      }
    }
  }
  const userRecord = await userCollection.doc(uid).get();
  const userInfo = userRecord && userRecord.data && userRecord.data[0];
  if (!userInfo) {
    return {
      code: 10002
    }
  }
  const uniqueUserParamList = Object.keys(uniqueUserParam);
  const userQuery = uniqueUserParamList.reduce((prev, keyPath) => {
    const key = keyPath;
    const value = getObjectValue(userInfo, keyPath);
    if (value) {
      prev.push({
        [key]: value
      });
    }
    return prev
  }, []);

  let query;
  const appidQuery = {
    dcloud_appid: db.command.in(dcloudAppidList)
  };
  switch (userQuery.length) {
    case 0:
      return {
        code: 10004,
        message: '用户缺少唯一标识（包括但不限于用户名、手机号、邮箱）'
      }
    case 1:
      query = db.command.and([
        userQuery[0],
        appidQuery
      ]);
      break
    default:
      query = db.command.and([
        db.command.or(userQuery),
        appidQuery
      ]);
      break
  }
  const checkUserRecord = await userCollection.where(query).limit(1).get();
  const checkUserInfo = checkUserRecord && checkUserRecord.data && checkUserRecord.data[0];
  if (!checkUserInfo) {
    return {
      code: 0
    }
  }
  const conflictKey = uniqueUserParamList.find(key => userInfo[key] === checkUserInfo[key]);
  return {
    code: 10005,
    message: `此用户的${uniqueUserParam[conflictKey]}已被授权登录，不可再次授权`
  }
}

async function setAuthorizedAppLogin ({
  uid,
  dcloudAppidList
} = {}) {
  const checkCanAuthorizeRes = await checkCanAuthorize({
    uid,
    dcloudAppidList
  });
  if (checkCanAuthorizeRes.code) {
    return checkCanAuthorizeRes
  }
  await userCollection.doc(uid).update({
    dcloud_appid: db.command.set(dcloudAppidList)
  });
  return {
    code: 0
  }
}

async function authorizeAppLogin ({
  uid,
  dcloudAppid
} = {}) {
  const checkCanAuthorizeRes = await checkCanAuthorize({
    uid,
    dcloudAppidList: [dcloudAppid]
  });
  if (checkCanAuthorizeRes.code) {
    return checkCanAuthorizeRes
  }
  await userCollection.doc(uid).update({
    dcloud_appid: db.command.push(dcloudAppid)
  });
  return {
    code: 0
  }
}

async function forbidAppLogin ({
  uid,
  dcloudAppid
} = {}) {
  if (!uid) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '用户ID'
      }
    }
  }
  await userCollection.doc(uid).update({
    dcloud_appid: db.command.pull(dcloudAppid)
  });
  return {
    code: 0
  }
}

const db$1 = uniCloud.database();
const dbCmd = db$1.command;

async function acceptInvite ({
  uid,
  inviteCode
}) {
  const inviter = await userCollection.where({
    _id: dbCmd.neq(uid),
    inviter_uid: dbCmd.not(dbCmd.all([uid])),
    my_invite_code: inviteCode
  }).get();
  if (inviter.data.length !== 1) {
    return {
      code: 80501,
      msg: '邀请码无效'
    }
  }
  const inviterUid = ([inviter.data[0]._id]).concat(inviter.data[0].inviter_uid || []);

  const userInfo = await userCollection.doc(uid).field({
    my_invite_code: true,
    inviter_uid: true
  }).get();

  if (userInfo.data.length === 0) {
    return {
      code: 80502
    }
  }

  if (userInfo.data[0].inviter_uid && userInfo.data[0].inviter_uid.length > 0) {
    return {
      code: 80503,
      msg: '邀请码不可修改'
    }
  }

  const now = Date.now();
  await userCollection.doc(uid).update({
    inviter_uid: inviterUid,
    invite_time: now
  });
  await userCollection.where({
    inviter_uid: uid
  }).update({
    inviter_uid: dbCmd.push(inviterUid)
  });
  return {
    code: 0,
    msg: '邀请码填写成功'
  }
}

async function getInvitedUser ({
  uid,
  level = 1,
  limit = 20,
  offset = 0,
  needTotal = false
}) {
  const res = await userCollection.where({
    [`inviter_uid.${level - 1}`]: uid
  })
    .field({
      _id: true,
      username: true,
      mobile: true,
      invite_time: true
    })
    .orderBy('invite_time', 'desc')
    .skip(offset)
    .limit(limit)
    .get();
  const result = {
    code: 0,
    msg: '获取邀请列表成功',
    invitedUser: res.data
  };
  if (needTotal) {
    const totalRes = await userCollection.where({
      [`inviter_uid.${level - 1}`]: uid
    })
      .count();
    result.total = totalRes.total;
  }
  return result
}

async function setUserInviteCode ({
  uid,
  myInviteCode
}) {
  const validResult = await this._getValidInviteCode({
    inviteCode: myInviteCode
  });
  if (validResult.code) {
    return validResult
  }
  await userCollection.doc(uid).update({
    my_invite_code: validResult.inviteCode
  });
  return {
    code: 0,
    msg: '邀请码设置成功',
    myInviteCode: validResult.inviteCode
  }
}

async function loginByAlipay (params) {
  if (typeof params === 'string') {
    params = {
      code: params
    };
  }

  const {
    needPermission,
    platform,
    code,
    myInviteCode,
    role
  } = params;

  const clientPlatform = platform || this.context.PLATFORM;
  const {
    openid
  } = await this._getAlipayApi({
    platform: clientPlatform
  }).code2Session(code);
  if (!openid) {
    return {
      code: 10501,
      messageValues: {
        account: '支付宝账号'
      }
    }
  }
  let userList = await userCollection.where({
    ali_openid: openid
  }).get();
  userList = this._getCurrentAppUser(userList.data);
  // openid已注册
  if (userList && userList.length > 0) {
    const userMatched = userList[0];

    const loginExecRes = await this._loginExec(userMatched, {
      needPermission
    });
    if (loginExecRes.code !== 0) {
      return loginExecRes
    }
    const {
      userInfo
    } = loginExecRes;

    return {
      ...loginExecRes,
      openid,
      mobileConfirmed: userInfo.mobile_confirmed === 1,
      emailConfirmed: userInfo.email_confirmed === 1
    }
  } else {
    const user = {
      ali_openid: openid
    };
    user.my_invite_code = myInviteCode;
    user.role = role;
    const registerExecResult = await this._registerExec(user, {
      needPermission
    });
    if (registerExecResult.code !== 0) {
      return registerExecResult
    }
    return {
      ...registerExecResult,
      openid,
      mobileConfirmed: false,
      emailConfirmed: false
    }
  }
}

const db$2 = uniCloud.database();
async function loginByEmail ({
  email,
  code,
  password,
  myInviteCode,
  type,
  needPermission,
  role
}) {
  email = email && email.trim();
  if (!email) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '邮箱'
      }
    }
  }
  const {
    emailToLowerCase
  } = this._getConfig();
  let emailParsed = email;
  if (emailToLowerCase) {
    emailParsed = email.toLowerCase();
  }
  const verifyRes = await this.verifyCode({
    email: emailParsed,
    code,
    type: type || 'login'
  });
  if (verifyRes.code !== 0) {
    return verifyRes // 验证失败
  }

  let query = {
    email,
    email_confirmed: 1
  };

  const filter = {
    field: 'email',
    value: email
  };

  const dbCmd = db$2.command;
  if (emailParsed !== email) {
    query = dbCmd.or(query, {
      email: emailParsed,
      email_confirmed: 1
    });
    filter.fallbackValue = emailParsed;
  }
  let userList = await userCollection.where(query).get();
  userList = this._getCurrentAppUser(userList.data);

  if (userList && userList.length > 0) {
    if (type === 'register') {
      return {
        code: 10301,
        messageValues: {
          type: '邮箱'
        }
      }
    }

    const getMatchedUserRes = this._getMatchedUser(userList, [filter]);
    if (getMatchedUserRes.code) {
      return getMatchedUserRes
    }

    const {
      userMatched
      // fieldMatched,
      // isFallbackValueMatched
    } = getMatchedUserRes;

    const loginExecRes = await this._loginExec(userMatched, {
      needPermission
    });
    if (loginExecRes.code !== 0) {
      return loginExecRes
    }

    return {
      ...loginExecRes,
      email: emailParsed
    }
  } else {
    // 注册用户
    if (type === 'login') {
      return {
        code: 10302,
        messageValues: {
          type: '邮箱'
        }
      }
    }
    const user = {
      email: emailParsed,
      email_confirmed: 1
    };
    const originPassword = password && password.trim();
    if (originPassword) {
      const {
        passwordHash,
        version
      } = this.encryptPwd(originPassword);
      user.password = passwordHash;
      if (version) {
        user.password_secret_version = version;
      }
    }
    user.my_invite_code = myInviteCode;
    user.role = role;

    const registerExecResult = await this._registerExec(user, {
      needPermission
    });
    if (registerExecResult.code !== 0) {
      return registerExecResult
    }
    return {
      ...registerExecResult,
      email: emailParsed
    }
  }
}

async function loginBySms ({
  mobile,
  code,
  password,
  inviteCode,
  myInviteCode,
  type,
  needPermission,
  role
}) {
  mobile = mobile && mobile.trim();
  if (!mobile) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '手机号码'
      }
    }
  }
  const config = this._getConfig();
  if (config.forceInviteCode && !type) {
    // 此类给开发者看的错误应直接抛出
    throw new Error('[loginBySms]强制使用邀请码注册时，需指明type为register还是login')
  }
  const verifyRes = await this.verifyCode({
    mobile,
    code,
    type: type || 'login'
  });
  if (verifyRes.code !== 0) {
    return verifyRes // 验证失败
  }
  const query = {
    mobile,
    mobile_confirmed: 1
  };
  let userList = await userCollection.where(query).get();
  userList = this._getCurrentAppUser(userList.data);

  if (userList && userList.length > 0) {
    if (type === 'register') {
      return {
        code: 10201,
        messageValues: {
          type: '手机号'
        }
      }
    }
    const userMatched = userList[0];
    const loginExecRes = await this._loginExec(userMatched, {
      needPermission
    });
    if (loginExecRes.code !== 0) {
      return loginExecRes
    }

    return {
      ...loginExecRes,
      mobile
    }
  } else {
    // 注册用户
    const now = Date.now();
    if (type === 'login') {
      return {
        code: 10202,
        messageValues: {
          type: '手机号'
        }
      }
    }
    const user = {
      mobile: mobile,
      mobile_confirmed: 1,
      register_ip: this.context.CLIENTIP,
      register_date: now
    };
    const originPassword = password && password.trim();
    if (originPassword) {
      const {
        passwordHash,
        version
      } = this.encryptPwd(originPassword);
      user.password = passwordHash;
      if (version) {
        user.password_secret_version = version;
      }
    }
    if (inviteCode) {
      const inviter = await userCollection.where({
        my_invite_code: inviteCode
      }).get();
      if (inviter.data.length !== 1) {
        return {
          code: 10203,
          msg: '邀请码无效'
        }
      }
      // 倒序排列全部邀请人
      user.inviter_uid = ([inviter.data[0]._id]).concat(inviter.data[0].inviter_uid || []);
      user.invite_time = now;
    } else if (config.forceInviteCode) {
      return {
        code: 10203,
        msg: '邀请码无效'
      }
    }
    user.my_invite_code = myInviteCode;
    user.role = role;

    const registerExecResult = await this._registerExec(user, {
      needPermission
    });
    if (registerExecResult.code !== 0) {
      return registerExecResult
    }

    return {
      ...registerExecResult,
      mobile
    }
  }
}

const db$3 = uniCloud.database();
async function loginByWeixin (params) {
  if (typeof params === 'string') {
    params = {
      code: params
    };
  }

  const {
    needPermission,
    platform,
    code,
    myInviteCode,
    role
  } = params;

  const clientPlatform = platform || this.context.PLATFORM;
  const isMpWeixin = clientPlatform === 'mp-weixin';
  const {
    openid,
    unionid,
    sessionKey,
    accessToken,
    refreshToken,
    expired: accessTokenExpired
  } = await this._getWeixinApi({
    platform: clientPlatform
  })[isMpWeixin ? 'code2Session' : 'getOauthAccessToken'](code);
  if (!openid) {
    return {
      code: 10401,
      messageValues: {
        account: '微信openid'
      }
    }
  }

  let result;
  if (isMpWeixin) {
    result = {
      sessionKey
    };
  } else {
    result = {
      accessToken,
      refreshToken,
      accessTokenExpired
    };
  }
  const dbCmd = db$3.command;
  const queryUser = [{
    wx_openid: {
      [clientPlatform]: openid
    }
  }];
  if (unionid) {
    queryUser.push({
      wx_unionid: unionid
    });
  }
  let userList = await userCollection.where(dbCmd.or(...queryUser)).get();
  userList = this._getCurrentAppUser(userList.data);
  // openid 或 unionid已注册
  if (userList && userList.length > 0) {
    const userMatched = userList[0];

    const extraData = {
      wx_openid: {
        [clientPlatform]: openid
      }
    };
    if (unionid) {
      extraData.wx_unionid = unionid;
    }

    const loginExecRes = await this._loginExec(userMatched, {
      needPermission,
      extraData
    });

    if (loginExecRes.code !== 0) {
      return loginExecRes
    }

    const {
      userInfo
    } = loginExecRes;

    return {
      ...loginExecRes,
      openid,
      unionid,
      ...result,
      mobileConfirmed: userInfo.mobile_confirmed === 1,
      emailConfirmed: userInfo.email_confirmed === 1
    }
  } else {
    const user = {
      wx_openid: {
        [clientPlatform]: openid
      },
      wx_unionid: unionid
    };
    user.my_invite_code = myInviteCode;
    user.role = role;

    const registerExecResult = await this._registerExec(user, {
      needPermission
    });
    if (registerExecResult.code !== 0) {
      return registerExecResult
    }
    return {
      ...registerExecResult,
      openid,
      unionid,
      ...result,
      mobileConfirmed: false,
      emailConfirmed: false
    }
  }
}

const db$4 = uniCloud.database();
async function loginByQQ ({
  code,
  accessToken,
  myInviteCode,
  needPermission,
  role
} = {}) {
  const clientPlatform = this.context.PLATFORM;
  const isMpQQ = clientPlatform === 'mp-qq';
  const {
    openid,
    unionid,
    sessionKey
  } = await this._getQQApi()[isMpQQ ? 'code2Session' : 'getOpenidByToken']({
    code,
    accessToken
  });
  if (!openid) {
    return {
      code: 10801,
      messageValues: {
        account: 'qq openid'
      }
    }
  }

  const result = {
    accessToken,
    sessionKey
  };
  const dbCmd = db$4.command;
  const queryUser = [{
    qq_openid: {
      [clientPlatform]: openid
    }
  }];
  if (unionid) {
    queryUser.push({
      qq_unionid: unionid
    });
  }
  let userList = await userCollection.where(dbCmd.or(...queryUser)).get();
  userList = this._getCurrentAppUser(userList.data);
  // openid 或 unionid已注册
  if (userList && userList.length > 0) {
    const userMatched = userList[0];

    const extraData = {
      qq_openid: {
        [clientPlatform]: openid
      }
    };
    if (unionid) {
      extraData.qq_unionid = unionid;
    }

    const loginExecRes = await this._loginExec(userMatched, {
      needPermission,
      extraData
    });

    if (loginExecRes.code !== 0) {
      return loginExecRes
    }

    const {
      userInfo
    } = loginExecRes;

    return {
      ...loginExecRes,
      openid,
      unionid,
      ...result,
      mobileConfirmed: userInfo.mobile_confirmed === 1,
      emailConfirmed: userInfo.email_confirmed === 1
    }
  } else {
    const user = {
      qq_openid: {
        [clientPlatform]: openid
      },
      qq_unionid: unionid
    };
    user.my_invite_code = myInviteCode;
    user.role = role;

    const registerExecResult = await this._registerExec(user);
    if (registerExecResult.code !== 0) {
      return registerExecResult
    }
    return {
      ...registerExecResult,
      openid,
      unionid,
      ...result,
      mobileConfirmed: false,
      emailConfirmed: false
    }
  }
}

const provider = 'univerify';
/**
 * @param {Object} params
 *
 * 在config中配置
 * @param {String} appid        应用的appid
 * @param {String} apiKey       一键登录控制台的apiKey
 * @param {String} apiSecret    一键登录控制台的apiSecret
 * uni.login返回
 * @param {String} access_token  uni.login返回的access_token
 * @param {String} openid       uni.login返回的openid
 */
async function getPhoneNumber (params) {
  const paramRequired = ['apiKey', 'apiSecret'];
  for (let i = 0, len = paramRequired.length; i < len; i++) {
    const paramName = paramRequired[i];
    if (!params[paramName]) {
      throw new Error(`请在config.json中service.univerify下配置${paramName}`)
    }
  }
  if (!(params.openid && params.access_token)) {
    throw new Error('一键登录需要传递openid和access_token')
  }
  const res = await uniCloud.getPhoneNumber({
    provider,
    ...params
  });

  return getPhoneNumberError(res)
}

/**
   * getPhoneNumber错误处理
   */
function getPhoneNumberError (res) {
  const ErrorCollection = {
    0: '成功',
    4000: '缺失参数',
    4001: 'apiKey不存在',
    4002: 'sign校验不通过',
    4003: 'appid不存在',
    4004: '应用未开通一键登录服务',
    4005: '应用开通的一键登录服务正在审核中',
    4006: '服务空间不在白名单中',
    4100: '账户余额不足',
    5000: '获取手机号失败，请稍后重试(或其他未知错误)'
  };

  return {
    ...res,
    msg: ErrorCollection[res.code]
      ? `[getPhoneNumber] 获取手机号: ${ErrorCollection[res.code]}`
      : res.errMsg
  }
}

/* eslint-disable camelcase */

/**
 *
 * @param {String} access_token      uni.login返回的access_token
 * @param {String} openid           uni.login返回的openid
 * @param {String} inviteCode       邀请人的邀请码，type为register时生效
 * @param {String} myInviteCode     设置当前注册用户自己的邀请码，type为register时生效
 * @param {String} type             指定操作类型，可选值为login、register，不传此参数时表现为手机号已注册则登录，手机号未注册则进行注册
 * @param {Boolean} needPermission  设置为true时会在checkToken时返回用户权限（permission），建议在管理控制台中使用
 */
async function loginByUniverify ({
  openid,
  access_token,
  password,
  inviteCode,
  myInviteCode,
  type,
  needPermission,
  role
}) {
  const config = this._getConfig();
  const univerifyConfig = config && config.service && config.service.univerify;

  // univerifyConfig配置错误处理
  if (!univerifyConfig) {
    throw new Error('请在config.json中配置service.univerify下一键登录相关参数')
  }

  if (config.forceInviteCode && !type) {
    throw new Error('[loginByUniverify] 强制使用邀请码注册时，需指明type为register还是login')
  }

  // 换取手机号
  const phoneInfo = await getPhoneNumber({
    ...univerifyConfig,
    openid,
    access_token
  });
  if (phoneInfo.code !== 0) {
    return phoneInfo
  }

  const mobile = String(phoneInfo.phoneNumber);
  let userList = await userCollection.where({ mobile }).get();
  userList = this._getCurrentAppUser(userList.data);

  /**
   * 以下为登录
   */
  if (userList && userList.length > 0) {
    if (type === 'register') {
      return {
        code: 10601,
        messageValues: {
          type: '手机号'
        }
      }
    }

    const userMatched = userList[0];
    const loginExecRes = await this._loginExec(userMatched, {
      needPermission
    });
    if (loginExecRes.code !== 0) {
      return loginExecRes
    }

    return {
      ...loginExecRes,
      mobile
    }
  }

  /**
   * 以下为注册
   */
  if (type === 'login') {
    return {
      code: 10602,
      messageValues: {
        type: '手机号'
      }
    }
  }

  const now = Date.now();
  const user = {
    mobile,
    my_invite_code: myInviteCode,
    mobile_confirmed: 1,
    role
  };

  // 密码
  const originPassword = password && password.trim();
  if (originPassword) {
    const {
      passwordHash,
      version
    } = this.encryptPwd(originPassword);
    user.password = passwordHash;
    if (version) {
      user.password_secret_version = version;
    }
  }

  // 邀请码
  if (inviteCode) {
    let inviter = await userCollection.where({
      my_invite_code: inviteCode
    }).get();
    if (inviter.data.length !== 1) {
      return {
        code: 10203,
        msg: '邀请码无效'
      }
    }
    inviter = inviter.data[0];
    // 倒序排列全部邀请人
    user.inviter_uid = ([inviter._id]).concat(inviter.inviter_uid || []);
    user.invite_time = now;
  } else if (config.forceInviteCode) {
    return {
      code: 10203,
      msg: '邀请码无效'
    }
  }
  user.my_invite_code = myInviteCode;

  // 注册用户，返回信息
  const registerExecResult = await this._registerExec(user, {
    needPermission
  });
  if (registerExecResult.code !== 0) {
    return registerExecResult
  }

  return {
    ...registerExecResult,
    mobile
  }
}

/* eslint-disable camelcase */

/**
 * Apple登录
 * @param {String} nickName   // 用户自定义昵称，若无，则为fullName拼接，若fullName无，则为email
 * @param {String} fullName   // 用户自定义名称
 * @param {String} email   // 用户邮箱，如果有则是私密邮箱，发邮件需通过Apple的服务器
 * @param {String} authorizationCode   // 用户标识码
 * @param {String} identityToken   // 身份令牌是JSON Web令牌（JWT），用于账户验证解析
 * @param {Number} realUserStatus   // 真实用户状态，0 Unsupported  1 Unknown  2  LikelyReal 真人
 */
async function loginByApple ({
  nickName,
  fullName,
  identityToken,
  myInviteCode,
  type,
  needPermission,
  platform,
  role
}) {
  const config = this._getConfig();

  const appleConfig = config && config['app-plus'] && config['app-plus'].oauth && config['app-plus'].oauth.apple;

  // univerifyConfig配置错误处理
  if (!appleConfig) {
    throw new Error('请在config.json或init方法中，app-plus.oauth.apple 下配置相关参数')
  }

  const { bundleId } = appleConfig;
  if (!bundleId) {
    throw new Error('请在config.json或init方法中 app-plus.oauth.apple 下配置bundleId')
  }

  if (!identityToken) {
    throw new Error('[loginByApple] 苹果登录需要传递identityToken')
  }

  const clientPlatform = platform || this.context.PLATFORM;
  fullName = nickName || (fullName && Object.keys(fullName).length > 0 ? fullName.familyName + fullName.givenName : '');

  const { code, msg } = await platformApi.initApple({
    clientType: clientPlatform
  }).verifyIdentityToken(identityToken);

  if (code !== 0) {
    return {
      code,
      msg
    }
  }

  const {
    iss,
    sub,
    aud,
    email: checkEmail
  } = msg;

  // 签名都是苹果签发的，因此此项应恒为 https://appleid.apple.com
  if (iss !== 'https://appleid.apple.com') {
    return {
      code: 10706,
      msg: '签发机构检验失败',
      messageValues: {
        account: '苹果账号'
      }
    }
  }

  if (!sub) {
    return {
      code: 10701,
      msg: '获取用户唯一标识符失败',
      messageValues: {
        account: '苹果账号'
      }
    }
  }

  if (bundleId !== aud) {
    return {
      code: 10702,
      msg: 'bundleId校验失败，请确认配置后重试',
      messageValues: {
        account: '苹果账号'
      }
    }
  }

  const nickname = fullName || `新用户${checkEmail.split('@')[0]}`;
  let userList = await userCollection.where({
    apple_openid: sub
  }).get();
  userList = this._getCurrentAppUser(userList.data);
  // openId 已注册
  if (userList && userList.length > 0) {
    if (type === 'register') {
      return {
        code: 10703,
        messageValues: {
          type: '苹果账号'
        }
      }
    }

    const userMatched = userList[0];

    const loginExecRes = await this._loginExec(userMatched, {
      needPermission
    });

    if (loginExecRes.code !== 0) {
      return loginExecRes
    }

    return {
      ...loginExecRes,
      openid: sub
    }
  }

  /**
     * 以下为注册
     */
  if (type === 'login') {
    return {
      code: 10704,
      messageValues: {
        type: '苹果账号'
      }
    }
  }

  const user = {
    nickname,
    apple_openid: sub,
    my_invite_code: myInviteCode,
    role
  };

  const registerExecResult = await this._registerExec(user, {
    needPermission
  });
  if (registerExecResult.code !== 0) {
    return registerExecResult
  }
  return {
    ...registerExecResult,
    openid: sub
  }
}

const db$5 = uniCloud.database();
async function login ({
  username,
  password,
  queryField = [],
  needPermission
}) {
  const dbCmd = db$5.command;
  const query = [];
  if (!queryField || !queryField.length) {
    queryField = ['username'];
  }

  if (queryField.length > 1) {
    console.warn('检测到当前使用queryField匹配多字段进行登录操作，需要注意：uni-id并未限制用户名不能是手机号或邮箱，需要开发者自行限制。否则可能出现用户输入abc@xx.com会同时匹配到邮箱为此值的用户和用户名为此值的用户，导致登录失败');
  }

  const {
    usernameToLowerCase,
    emailToLowerCase,
    passwordErrorLimit,
    passwordErrorRetryTime
  } = this._getConfig();

  const extraCond = {
    email: {
      email_confirmed: 1
    },
    mobile: {
      mobile_confirmed: 1
    }
  };
  const usernameParsed = {};
  const usernameTrim = username.trim();
  if (!usernameTrim) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '用户名'
      }
    }
  }
  if (usernameToLowerCase) {
    usernameParsed.username = usernameTrim.toLowerCase();
  }
  if (emailToLowerCase) {
    usernameParsed.email = usernameTrim.toLowerCase();
  }
  const filterList = [];
  queryField.forEach(item => {
    // 用于查询数据库
    query.push({
      [item]: username,
      ...extraCond[item]
    });
    // 用于对最终结果进行筛选
    const tempFilter = {
      field: item,
      value: username
    };
    // 同时兼容已处理、未处理的username、email
    if (item === 'username' && usernameParsed.username !== username) {
      query.push({
        [item]: usernameParsed.username,
        ...extraCond[item]
      });
      tempFilter.fallbackValue = usernameParsed.username;
    } else if (item === 'email' && usernameParsed.email !== username) {
      query.push({
        [item]: usernameParsed.email,
        ...extraCond[item]
      });
      tempFilter.fallbackValue = usernameParsed.email;
    }
    filterList.push(tempFilter);
  });
  let userList = await userCollection.where(dbCmd.or(...query)).limit(1).get();
  userList = this._getCurrentAppUser(userList.data);
  const clientIP = this.context.CLIENTIP;

  const getMatchedUserRes = this._getMatchedUser(userList, filterList);
  if (getMatchedUserRes.code) {
    return getMatchedUserRes
  }

  const {
    userMatched
    // fieldMatched,
    // isFallbackValueMatched
  } = getMatchedUserRes;

  // const shouldTransformUsername = fieldMatched && !isFallbackValueMatched

  // 根据ip地址，密码错误次数过多，锁定登录
  let loginIPLimit = userMatched.login_ip_limit || [];
  // 清理无用记录
  loginIPLimit = loginIPLimit.filter(item => item.last_error_time > Date.now() - passwordErrorRetryTime * 1000);
  let currentIPLimit = loginIPLimit.find(item => item.ip === clientIP);
  if (currentIPLimit && currentIPLimit.error_times >= passwordErrorLimit) {
    return {
      code: 10103,
      msg: `密码错误次数过多，请${friendlyDate(currentIPLimit.last_error_time + passwordErrorRetryTime * 1000)}再试。`
    }
  }
  const orginPassword = password && password.trim();
  if (!orginPassword) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '密码'
      }
    }
  }
  const checkPwdRes = this._checkPwd(userMatched, orginPassword);
  if (checkPwdRes.code === 0) {
    // 更新ip限制
    // 注意arr.splice(-1,1)也会删除第一个！！！
    const currentIPLimitIndex = loginIPLimit.indexOf(currentIPLimit);
    if (currentIPLimitIndex > -1) {
      loginIPLimit.splice(currentIPLimitIndex, 1);
    }
    const extraData = {
      login_ip_limit: loginIPLimit
    };

    // 迁移用户密码
    const {
      passwordHash,
      passwordVersion
    } = checkPwdRes;
    if (passwordHash && passwordVersion) {
      extraData.password = passwordHash;
      extraData.password_secret_version = passwordVersion;
    }

    const loginExecRes = await this._loginExec(userMatched, {
      needPermission,
      extraData
    });
    if (loginExecRes.code !== 0) {
      return loginExecRes
    }

    return loginExecRes
  } else {
    if (!currentIPLimit) {
      currentIPLimit = {
        ip: clientIP,
        error_times: 1,
        last_error_time: Date.now()
      };
      loginIPLimit.push(currentIPLimit);
    } else {
      currentIPLimit.error_times++;
      currentIPLimit.last_error_time = Date.now();
    }
    await userCollection.doc(userMatched._id).update({
      login_ip_limit: loginIPLimit
    });
    return {
      code: 10102,
      msg: '密码错误'
    }
  }
}

const db$6 = uniCloud.database();

// 初版历史遗留问题，此接口允许接收任意参数。看后续能不能在某个大版本改掉
async function register (user) {
  const query = [];
  const uniqueParam = [{
    name: 'username',
    desc: '用户名'
  }, {
    name: 'email',
    desc: '邮箱',
    extraCond: {
      email_confirmed: 1
    }
  }, {
    name: 'mobile',
    desc: '手机号',
    extraCond: {
      mobile_confirmed: 1
    }
  }];

  const {
    usernameToLowerCase,
    emailToLowerCase
  } = this._getConfig();

  uniqueParam.forEach(item => {
    const paramName = item.name;
    let paramValue = user[paramName] && user[paramName].trim();
    if (paramValue) {
      if ((item.name === 'username' && usernameToLowerCase) || (item.name === 'email' && emailToLowerCase)) {
        paramValue = paramValue.toLowerCase();
      }
      user[paramName] = paramValue;
      query.push({
        [paramName]: paramValue,
        ...item.extraCond
      });
    } else {
      delete user[paramName];
    }
  });

  // 注意这里获取的username、email等信息均已处理过，转小写，去空格
  const {
    username,
    email,
    mobile,
    myInviteCode,
    needPermission,
    autoSetDcloudAppid = true
  } = user;

  'needPermission' in user && delete user.needPermission;
  'autoSetDcloudAppid' in user && delete user.autoSetDcloudAppid;

  if (query.length === 0) {
    return {
      code: 20101,
      messageValues: {
        param: '用户名、邮箱或手机号'
      }
    }
  }

  const dbCmd = db$6.command;
  let userList = await userCollection.where(dbCmd.or(...query)).get();
  userList = this._getCurrentAppUser(userList.data);
  // 用户已存在
  if (userList && userList.length > 0) {
    const userToCheck = userList[0];
    for (let i = 0; i < uniqueParam.length; i++) {
      const paramItem = uniqueParam[i];
      let extraCondMatched = true;
      if (paramItem.extraCond) {
        extraCondMatched = Object.keys(paramItem.extraCond).every((key) => {
          return userToCheck[key] === paramItem.extraCond[key]
        });
      }
      if (userToCheck[paramItem.name] === user[paramItem.name] && extraCondMatched) {
        return {
          code: 20102,
          messageValues: {
            type: paramItem.desc
          }
        }
      }
    }
  }
  const orginPassword = user.password && user.password.trim();
  if (!orginPassword) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '密码'
      }
    }
  }
  const {
    passwordHash,
    version
  } = this.encryptPwd(orginPassword);
  user.password = passwordHash;
  if (version) {
    user.password_secret_version = version;
  }
  user.my_invite_code = myInviteCode;
  delete user.myInviteCode;

  const registerExecResult = await this._registerExec(user, {
    needPermission,
    autoSetDcloudAppid
  });
  if (registerExecResult.code !== 0) {
    return registerExecResult
  }

  return {
    ...registerExecResult,
    username,
    email,
    mobile
  }
}

const db$7 = uniCloud.database();
async function logout (token) {
  const payload = await this.checkToken(token);

  if (payload.code) {
    return payload
  }
  const dbCmd = db$7.command;
  await userCollection.doc(payload.uid).update({
    token: dbCmd.pull(token)
  });
  return {
    code: 0,
    msg: '退出成功'
  }
}

// role based access control

const db$8 = uniCloud.database();
const dbCmd$1 = db$8.command;

async function getRoleByUid ({
  uid
}) {
  if (!uid) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '用户Id'
      }
    }
  }
  const userRecord = await userCollection.doc(uid).get();
  if (userRecord.data.length === 0) {
    return {
      code: PublicErrorCode.USER_NOT_EXIST
    }
  }
  return {
    code: 0,
    msg: '获取角色成功',
    role: userRecord.data[0].role || []
  }
}

async function getPermissionByRole ({
  roleID
}) {
  if (!roleID) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '角色ID'
      }
    }
  }
  // admin特殊处理
  if (roleID === 'admin') {
    const permissionRecord = await permissionCollection.limit(1000).get();
    return {
      code: 0,
      msg: '获取权限成功',
      permission: permissionRecord.data.map(item => item.permission_id)
    }
  }

  const roleRecord = await roleCollection
    .where({
      role_id: roleID
    }).get();

  if (roleRecord.data.length === 0) {
    return {
      code: PublicErrorCode.ROLE_NOT_EXIST
    }
  }
  return {
    code: 0,
    msg: '获取权限成功',
    permission: roleRecord.data[0].permission || []
  }
}

async function getPermissionByUid ({
  uid
}) {
  const roleRecord = await userCollection.aggregate()
    .match({
      _id: uid
    })
    .project({
      role: true
    })
    .unwind('$role')
    .lookup({
      from: roleCollectionName,
      localField: 'role',
      foreignField: 'role_id',
      as: 'roleDetail'
    })
    .unwind('$roleDetail')
    .replaceRoot({
      newRoot: '$roleDetail'
    })
    .end();
  const permission = [];
  roleRecord.data.forEach(item => {
    Array.prototype.push.apply(permission, item.permission);
  });
  return {
    code: 0,
    msg: '获取权限成功',
    permission: getDistinctArray(permission)
  }
}

async function bindRole ({
  uid,
  roleList,
  // reset指定为true时表示整体覆盖，否则增量更新
  reset = false
}) {
  const data = {};
  if (typeof roleList === 'string') {
    roleList = [roleList];
  }
  if (reset) {
    data.role = roleList;
  } else {
    data.role = dbCmd$1.push(roleList);
  }
  await userCollection.doc(uid).update(data);
  return {
    code: 0,
    msg: '角色绑定成功'
  }
}

async function bindPermission ({
  roleID,
  permissionList,
  // reset指定为true时表示整体覆盖，否则增量更新
  reset = false
}) {
  const data = {};
  if (typeof permissionList === 'string') {
    permissionList = [permissionList];
  }
  if (reset) {
    data.permission = permissionList;
  } else {
    data.permission = dbCmd$1.push(permissionList);
  }
  await roleCollection.where({
    role_id: roleID
  }).update(data);
  return {
    code: 0,
    msg: '权限绑定成功'
  }
}

async function unbindRole ({
  uid,
  roleList
}) {
  if (typeof roleList === 'string') {
    roleList = [roleList];
  }
  await userCollection.doc(uid).update({
    role: dbCmd$1.pull(dbCmd$1.in(roleList))
  });
  return {
    code: 0,
    msg: '角色解绑成功'
  }
}

async function unbindPermission ({
  roleID,
  permissionList
}) {
  if (typeof permissionList === 'string') {
    permissionList = [permissionList];
  }
  await roleCollection.where({
    role_id: roleID
  }).update({
    permission: dbCmd$1.pull(dbCmd$1.in(permissionList))
  });
  return {
    code: 0,
    msg: '权限解绑成功'
  }
}

async function addRole ({
  roleID,
  roleName,
  comment,
  permission = []
}) {
  if (!roleID) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '角色Id'
      }
    }
  }
  if (roleID === 'admin') {
    return {
      code: PublicErrorCode.PARAM_ERROR,
      messageValues: {
        param: 'roleID',
        reason: '不可新增roleID为admin的角色'
      }
    }
  }
  await roleCollection.add({
    role_id: roleID,
    role_name: roleName,
    comment,
    permission,
    create_date: Date.now()
  });
  return {
    code: 0,
    msg: '角色新增成功'
  }
}

async function getRoleList ({
  limit = 20,
  offset = 0,
  needTotal = true
}) {
  const roleRecord = await roleCollection.skip(offset).limit(limit).get();
  const result = {
    code: 0,
    msg: '获取角色列表成功',
    roleList: roleRecord.data
  };
  if (needTotal) {
    const {
      total
    } = await roleCollection.where({
      _id: dbCmd$1.exists(true)
    }).count();
    result.total = total;
  }
  return result
}

async function getRoleInfo (roleID) {
  const roleRecord = await roleCollection.where({
    role_id: roleID
  }).get();
  if (roleRecord.data.length === 0) {
    return {
      code: PublicErrorCode.ROLE_NOT_EXIST
    }
  }
  return {
    code: 0,
    ...roleRecord.data[0]
  }
}

async function updateRole ({
  roleID,
  roleName,
  comment,
  permission
}) {
  if (!roleID) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '角色ID'
      }
    }
  }
  await roleCollection.where({
    role_id: roleID
  }).update({
    role_name: roleName,
    comment,
    permission
  });
  return {
    code: 0,
    msg: '角色更新成功'
  }
}

async function deleteRole ({
  roleID
}) {
  const roleIDType = getType(roleID);
  if (roleIDType === 'string') {
    roleID = [roleID];
  } else if (roleIDType !== 'array') {
    throw new Error('roleID只能为字符串或者数组')
  }
  await roleCollection.where({
    role_id: dbCmd$1.in(roleID)
  }).remove();
  await userCollection.where({
    role: dbCmd$1.elemMatch(dbCmd$1.in(roleID))
  }).update({
    role: dbCmd$1.pullAll(roleID)
  });
  return {
    code: 0,
    msg: '角色删除成功'
  }
}

async function addPermission ({
  permissionID,
  permissionName,
  comment
}) {
  if (!permissionID) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '权限ID'
      }
    }
  }
  await permissionCollection.add({
    permission_id: permissionID,
    permission_name: permissionName,
    comment,
    create_date: Date.now()
  });
  return {
    code: 0,
    msg: '权限新增成功'
  }
}

async function getPermissionList ({
  limit = 20,
  offset = 0,
  needTotal = true
}) {
  const permissionRecord = await permissionCollection.skip(offset).limit(limit).get();
  const result = {
    code: 0,
    msg: '获取权限列表成功',
    permissionList: permissionRecord.data
  };
  if (needTotal) {
    const {
      total
    } = await permissionCollection.where({
      _id: dbCmd$1.exists(true)
    }).count();
    result.total = total;
  }
  return result
}

async function getPermissionInfo (permissionID) {
  const permissionRecord = await permissionCollection.where({
    permission_id: permissionID
  }).get();
  if (permissionRecord.data.length === 0) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '权限ID'
      }
    }
  }
  return {
    code: 0,
    ...permissionRecord.data[0]
  }
}

async function updatePermission ({
  permissionID,
  permissionName,
  comment
}) {
  if (!permissionID) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '权限ID'
      }
    }
  }
  await permissionCollection.where({
    permission_id: permissionID
  }).update({
    permission_name: permissionName,
    comment
  });
  return {
    code: 0,
    msg: '权限更新成功'
  }
}

async function deletePermission ({
  permissionID
}) {
  const permissionIDType = getType(permissionID);
  if (permissionIDType === 'string') {
    permissionID = [permissionID];
  } else if (permissionIDType !== 'array') {
    throw new Error('permissionID只能为字符串或者数组')
  }
  await permissionCollection.where({
    permission_id: dbCmd$1.in(permissionID)
  }).remove();
  await roleCollection.where({
    permission: dbCmd$1.elemMatch(dbCmd$1.in(permissionID))
  }).update({
    permission: dbCmd$1.pullAll(permissionID)
  });
  return {
    code: 0,
    msg: '权限删除成功'
  }
}

async function bindAlipay ({
  uid,
  code,
  platform
}) {
  const clientPlatform = platform || this.context.PLATFORM;
  const {
    openid
  } = await this._getAlipayApi({
    platform: clientPlatform
  }).code2Session(code);
  if (!openid) {
    return {
      code: 60401,
      messageValues: {
        account: '支付宝账号'
      }
    }
  }
  let userList = await userCollection.where({
    ali_openid: openid
  }).get();
  userList = this._getCurrentAppUser(userList.data);
  // openid已注册
  if (userList && userList.length > 0) {
    return {
      code: 60402,
      messageValues: {
        type: '支付宝账号'
      }
    }
  }
  await userCollection.doc(uid).update({
    ali_openid: openid
  });
  return {
    code: 0,
    openid,
    msg: '绑定成功'
  }
}

async function bindEmail ({
  uid,
  email,
  // 不传递code时不验证直接绑定
  code
}) {
  email = email && email.trim();
  if (!email) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '邮箱'
      }
    }
  }
  const {
    emailToLowerCase
  } = this._getConfig();
  if (emailToLowerCase) {
    email = email.toLowerCase();
  }
  let userList = await userCollection.where({
    email,
    email_confirmed: 1
  }).get();
  userList = this._getCurrentAppUser(userList.data);
  if (userList && userList.length > 0) {
    return {
      code: 60201,
      messageValues: {
        type: '邮箱'
      }
    }
  }
  if (code) {
    const verifyRes = await this.verifyCode({
      email,
      code,
      type: 'bind'
    });
    if (verifyRes.code !== 0) {
      return verifyRes // 验证失败
    }
  }
  await userCollection.doc(uid).update({
    email,
    email_confirmed: 1
  });

  return {
    code: 0,
    msg: '邮箱绑定成功',
    email
  }
}

/**
 *
 * @param {string} uid 用户id
 * @param {string} mobile 手机号
 * @param {string} code 手机验证码
 * @param {string} openid 用户id
 * @param {string} access_token 用户id
 * @param {string} uid 用户id
 * @returns
 */
async function bindMobile ({
  uid,
  mobile,
  // 兼容旧版逻辑不传递code时不进行验证码校验
  code,
  openid,
  // eslint-disable-next-line camelcase
  access_token,
  type = 'sms'
}) {
  if (type === 'univerify') {
    const config = this._getConfig();
    const univerifyConfig = config && config.service && config.service.univerify;

    // univerifyConfig配置错误处理
    if (!univerifyConfig) {
      throw new Error('请在config.json中配置service.univerify下一键登录相关参数')
    }
    // 换取手机号
    const phoneInfo = await getPhoneNumber({
      ...univerifyConfig,
      openid,
      access_token
    });
    if (phoneInfo.code !== 0) {
      return phoneInfo
    }
    mobile = '' + phoneInfo.phoneNumber;
  }
  let userList = await userCollection.where({
    mobile: mobile,
    mobile_confirmed: 1
  }).get();
  userList = this._getCurrentAppUser(userList.data);
  if (userList && userList.length > 0) {
    return {
      code: 60101,
      messageValues: {
        type: '手机号'
      }
    }
  }
  if (type === 'sms' && code) {
    const verifyRes = await this.verifyCode({
      mobile,
      code,
      type: 'bind'
    });
    if (verifyRes.code !== 0) {
      return verifyRes // 验证失败
    }
  }
  await userCollection.doc(uid).update({
    mobile: mobile,
    mobile_confirmed: 1
  });

  return {
    code: 0,
    msg: '手机号码绑定成功',
    mobile
  }
}

const db$9 = uniCloud.database();
async function bindWeixin ({
  uid,
  code,
  platform
}) {
  const clientPlatform = platform || this.context.PLATFORM;
  const isMpWeixin = clientPlatform === 'mp-weixin';
  const {
    openid,
    unionid,
    sessionKey,
    accessToken,
    refreshToken,
    expired: accessTokenExpired
  } = await this._getWeixinApi({
    platform: clientPlatform
  })[isMpWeixin ? 'code2Session' : 'getOauthAccessToken'](code);
  if (!openid) {
    return {
      code: 60301,
      messageValues: {
        account: '微信openid'
      }
    }
  }
  const dbCmd = db$9.command;
  const queryUser = [{
    wx_openid: {
      [clientPlatform]: openid
    }
  }];
  if (unionid) {
    queryUser.push({
      wx_unionid: unionid
    });
  }
  let userList = await userCollection.where(dbCmd.or(...queryUser)).get();
  userList = this._getCurrentAppUser(userList.data);
  // openid 或 unionid已注册
  if (userList && userList.length > 0) {
    return {
      code: 60302,
      messageValues: {
        type: '微信账号'
      }
    }
  }
  const updateData = {
    wx_openid: {
      [clientPlatform]: openid
    }
  };
  if (unionid) {
    updateData.wx_unionid = unionid;
  }
  await userCollection.doc(uid).update(updateData);

  let result;
  if (isMpWeixin) {
    result = {
      sessionKey
    };
  } else {
    result = {
      accessToken,
      refreshToken,
      accessTokenExpired
    };
  }

  return {
    code: 0,
    openid,
    unionid,
    ...result,
    msg: '绑定成功'
  }
}

const db$a = uniCloud.database();
async function bindQQ ({
  uid,
  code,
  accessToken,
  platform
} = {}) {
  const clientPlatform = platform || this.context.PLATFORM;
  const isMpQQ = clientPlatform === 'mp-qq';
  const {
    openid,
    unionid,
    sessionKey
  } = await this._getQQApi()[isMpQQ ? 'code2Session' : 'getOpenidByToken']({
    code,
    accessToken
  });
  if (!openid) {
    return {
      code: 60501,
      messageValues: {
        account: 'qq openid'
      }
    }
  }
  const dbCmd = db$a.command;
  const queryUser = [{
    qq_openid: {
      [clientPlatform]: openid
    }
  }];
  if (unionid) {
    queryUser.push({
      qq_unionid: unionid
    });
  }
  let userList = await userCollection.where(dbCmd.or(...queryUser)).get();
  userList = this._getCurrentAppUser(userList.data);
  // openid 或 unionid已注册
  if (userList && userList.length > 0) {
    return {
      code: 60502,
      messageValues: {
        type: 'QQ账号'
      }
    }
  }
  const updateData = {
    qq_openid: {
      [clientPlatform]: openid
    }
  };
  if (unionid) {
    updateData.qq_unionid = unionid;
  }
  await userCollection.doc(uid).update(updateData);

  const result = {
    accessToken,
    sessionKey
  };

  return {
    code: 0,
    openid,
    unionid,
    ...result,
    msg: '绑定成功'
  }
}

const db$b = uniCloud.database();
async function unbindAlipay (uid) {
  const dbCmd = db$b.command;
  const upRes = await userCollection.doc(uid).update({
    ali_openid: dbCmd.remove()
  });
  log('upRes:', upRes);
  if (upRes.updated === 1) {
    return {
      code: 0,
      msg: '支付宝解绑成功'
    }
  } else {
    return {
      code: 70401,
      msg: '支付宝解绑失败，请稍后再试'
    }
  }
}

const db$c = uniCloud.database();
async function unbindEmail ({
  uid,
  email,
  // 不传递code时不进行验证码校验
  code
}) {
  email = email && email.trim();
  if (!uid || !email) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: !uid ? '用户Id' : '邮箱'
      }
    }
  }
  const {
    emailToLowerCase
  } = this._getConfig();
  if (code) {
    const verifyRes = await this.verifyCode({
      email,
      code,
      type: 'unbind'
    });
    if (verifyRes.code !== 0) {
      return verifyRes // 验证失败
    }
  }
  const dbCmd = db$c.command;
  let query = {
    _id: uid,
    email
  };
  if (emailToLowerCase) {
    const emailParsed = email.toLowerCase();
    if (emailParsed !== email) {
      query = dbCmd.or(query, {
        _id: uid,
        email: emailParsed
      });
    }
  }
  const upRes = await userCollection.where(query).update({
    email: dbCmd.remove(),
    email_confirmed: dbCmd.remove()
  });
  if (upRes.updated === 1) {
    return {
      code: 0,
      msg: '邮箱解绑成功'
    }
  } else {
    return {
      code: 70201,
      msg: '邮箱解绑失败，请稍后再试'
    }
  }
}

const db$d = uniCloud.database();
async function unbindMobile ({
  uid,
  mobile,
  // 不传递code时不进行验证码校验
  code
}) {
  if (code) {
    const verifyRes = await this.verifyCode({
      mobile,
      code,
      type: 'unbind'
    });
    if (verifyRes.code !== 0) {
      return verifyRes // 验证失败
    }
  }
  const dbCmd = db$d.command;
  const upRes = await userCollection.where({
    _id: uid,
    mobile
  }).update({
    mobile: dbCmd.remove(),
    mobile_confirmed: dbCmd.remove()
  });
  if (upRes.updated === 1) {
    return {
      code: 0,
      msg: '手机号解绑成功'
    }
  } else {
    return {
      code: 70101,
      msg: '手机号解绑失败，请稍后再试'
    }
  }
}

const db$e = uniCloud.database();
async function unbindWeixin (uid) {
  const dbCmd = db$e.command;
  const upRes = await userCollection.doc(uid).update({
    wx_openid: dbCmd.remove(),
    wx_unionid: dbCmd.remove()
  });
  log('upRes:', upRes);
  if (upRes.updated === 1) {
    return {
      code: 0,
      msg: '微信解绑成功'
    }
  } else {
    return {
      code: 70301,
      msg: '微信解绑失败，请稍后再试'
    }
  }
}

const db$f = uniCloud.database();
async function unbindQQ (uid) {
  const dbCmd = db$f.command;
  const upRes = await userCollection.doc(uid).update({
    qq_openid: dbCmd.remove(),
    qq_unionid: dbCmd.remove()
  });
  log('upRes:', upRes);
  if (upRes.updated === 1) {
    return {
      code: 0,
      msg: 'QQ解绑成功'
    }
  } else {
    return {
      code: 70501,
      msg: 'QQ解绑失败，请稍后再试'
    }
  }
}

async function code2SessionAlipay (code) {
  let params = code;
  if (typeof code === 'string') {
    params = {
      code
    };
  }
  try {
    const clientPlatform = params.platform || this.context.PLATFORM;
    const result = await this._getAlipayApi({
      platform: clientPlatform
    }).code2Session(params.code);
    if (!result.openid) {
      return {
        code: 80701,
        messageValues: {
          account: '支付宝账号'
        }
      }
    }
    return {
      code: 0,
      msg: '',
      ...result
    }
  } catch (error) {
    return {
      code: 80702,
      messageValues: {
        account: '支付宝账号'
      }
    }
  }
}

async function code2SessionWeixin (code) {
  let params = code;
  if (typeof code === 'string') {
    params = {
      code
    };
  }
  try {
    const clientPlatform = params.platform || this.context.PLATFORM;
    const result = await this._getWeixinApi({
      platform: clientPlatform
    })[clientPlatform === 'mp-weixin' ? 'code2Session' : 'getOauthAccessToken'](params.code);
    if (!result.openid) {
      return {
        code: 80601,
        messageValues: {
          account: '微信openid'
        }
      }
    }
    return {
      code: 0,
      msg: '',
      ...result
    }
  } catch (error) {
    return {
      code: 80602,
      messageValues: {
        account: '微信openid'
      }
    }
  }
}

async function verifyIdentityToken ({ identityToken, platform }) {
  const clientPlatform = platform || this.context.PLATFORM;
  const { code, msg } = await platformApi.initApple({
    clientType: clientPlatform
  }).verifyIdentityToken(identityToken);

  if (code !== 0) {
    return {
      code,
      msg
    }
  }

  return {
    code,
    msg: '验证通过',
    ...msg
  }
}

/**
 * 详情查看：https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/signature.html#%E5%8A%A0%E5%AF%86%E6%95%B0%E6%8D%AE%E8%A7%A3%E5%AF%86%E7%AE%97%E6%B3%95
 * @param {String} code           微信登录成功临时登录凭证code
 * @param {String} sessionKey     微信code2session返回的会话密钥
 * @param {String} encryptedData  包括敏感数据在内的完整用户信息的加密数据
 * @param {String} iv             加密算法的初始向量
 */
async function wxBizDataCrypt ({
  code,
  sessionKey,
  encryptedData,
  iv
}) {
  if (!encryptedData) {
    return {
      code: 80805,
      messageValues: {
        param: 'encryptedData'
      }
    }
  }

  if (!iv) {
    return {
      code: 80806,
      messageValues: {
        param: 'iv'
      }
    }
  }

  if (!code && !sessionKey) {
    return {
      code: 80804,
      messageValues: {
        param: 'code或sessionKey'
      }
    }
  }

  const WeiXinApi = this._getWeixinApi();

  if (!sessionKey) {
    const res = await WeiXinApi.code2Session(code);

    if (!res.sessionKey) {
      return {
        code: 80801,
        msg: 'sessionKey获取失败'
      }
    }

    sessionKey = res.sessionKey;
  }

  sessionKey = Buffer.from(sessionKey, 'base64');
  encryptedData = Buffer.from(encryptedData, 'base64');
  iv = Buffer.from(iv, 'base64');

  try {
    // 解密
    var decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv);
    // 设置自动 padding 为 true，删除填充补位
    decipher.setAutoPadding(true);
    var decoded = decipher.update(encryptedData, 'binary', 'utf8');
    decoded += decipher.final('utf8');

    decoded = JSON.parse(decoded);
  } catch (err) {
    return {
      code: 80802,
      msg: `解密失败：${err.message}`
    }
  }

  if (decoded.watermark.appid !== WeiXinApi.options.appId) {
    return {
      code: 80803,
      msg: 'appid不匹配'
    }
  }

  return {
    code: 0,
    msg: '解密成功',
    ...decoded
  }
}

// user对象
function checkPwd (user, password) {
  if (!password) {
    return {
      code: 1,
      message: '密码不能为空'
    }
  }
  const {
    password: pwdInDB,
    password_secret_version: passwordVersion
  } = user;
  const config = this._getConfig();
  const {
    passwordSecret
  } = config;
  const passwordSecretType = getType(passwordSecret);
  // 未配置passwordSecretList
  if (passwordSecretType === 'string') {
    const {
      passwordHash
    } = this.encryptPwd(password, { value: passwordSecret });
    if (passwordHash === pwdInDB) {
      return {
        code: 0,
        message: '密码校验通过'
      }
    }
    return {
      code: 2,
      message: '密码不正确'
    }
  }
  if (passwordSecretType !== 'array') {
    throw new Error('config内passwordSecret类型错误，只可设置string类型和array类型')
  }
  const passwordSecretList = passwordSecret;
  const secretList = passwordSecretList.sort((a, b) => {
    return a.version - b.version
  });
  let previousSecret;
  if (!passwordVersion) {
    previousSecret = secretList[0];
  } else {
    previousSecret = secretList.find(item => item.version === passwordVersion);
  }
  if (!previousSecret) {
    return {
      code: 3,
      message: 'secretVersion不正确'
    }
  }
  const currentSecret = secretList[secretList.length - 1];
  const {
    passwordHash: previousPasswordHash
  } = this.encryptPwd(password, previousSecret);
  if (previousPasswordHash === pwdInDB) {
    const result = {
      code: 0,
      message: '密码校验通过'
    };
    // 需要更新密码
    if (previousSecret !== currentSecret) {
      const {
        passwordHash: currentPasswordHash,
        version: currentVersion
      } = this.encryptPwd(password, currentSecret);
      result.passwordHash = currentPasswordHash;
      result.passwordVersion = currentVersion;
    }
    return result
  } else {
    return {
      code: 4,
      message: ''
    }
  }
}

function encryptPwd (password, { value: secret, version } = {}) {
  password = password && password.trim();
  if (!password) {
    throw new Error('密码不可为空')
  }
  if (!secret) {
    const config = this._getConfig();
    const {
      passwordSecret
    } = config;
    const passwordSecretType = getType(passwordSecret);
    if (passwordSecretType === 'array') {
      const secretList = passwordSecret.sort((a, b) => {
        return a.version - b.version
      });
      secret = secretList[secretList.length - 1].value;
      version = secretList[secretList.length - 1].version;
    } else {
      secret = passwordSecret;
    }
  }
  if (!secret) {
    throw new Error('passwordSecret不正确')
  }
  const hmac = crypto.createHmac('sha1', secret.toString('ascii'));
  hmac.update(password);
  return {
    passwordHash: hmac.digest('hex'),
    version
  }
}

function getClientUaHash () {
  const hash = crypto.createHash('md5');
  const hashContent = /MicroMessenger/i.test(this.context.CLIENTUA) ? this.context.CLIENTUA.replace(/(MicroMessenger\S+).*/i, '$1') : this.context.CLIENTUA;
  hash.update(hashContent);
  return hash.digest('hex')
}

function createTokenInternal ({
  signContent,
  config
}) {
  if (getType(signContent) !== 'object' || !signContent.uid) {
    return {
      code: 30101,
      messageValues: {
        param: '用户ID'
      }
    }
  }
  if (config.bindTokenToDevice) {
    signContent.clientId = this._getClientUaHash();
  }
  const token = jsonwebtoken.sign(signContent, config.tokenSecret, {
    expiresIn: config.tokenExpiresIn
  });

  return {
    token,
    tokenExpired: Date.now() + config.tokenExpiresIn * 1000
  }
}

function createToken ({
  uid,
  needPermission,
  role,
  permission
}) {
  if (!uid) {
    return {
      code: 30101,
      messageValues: {
        param: '用户ID'
      }
    }
  }
  const originSignContent = {
    uid,
    needPermission,
    role,
    permission
  };
  const config = this._getConfig();
  if (!this.interceptorMap.has('customToken')) {
    const signContent = { ...originSignContent };
    return this._createTokenInternal({
      signContent,
      config
    })
  }
  const customToken = this.interceptorMap.get('customToken');
  if (typeof customToken !== 'function') {
    throw new Error('custom-token.js应导出一个function')
  }
  const customTokenRes = customToken(originSignContent);
  if (!(customTokenRes instanceof Promise)) {
    return this._createTokenInternal({
      signContent: customTokenRes,
      config
    })
  }
  return customTokenRes.then(customTokenRes => {
    return this._createTokenInternal({
      signContent: customTokenRes,
      config
    })
  })
}

function verifyToken (token) {
  const config = this._getConfig();
  let payload;
  try {
    payload = jsonwebtoken.verify(token, config.tokenSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return {
        code: 30203,
        msg: 'token已过期，请重新登录',
        err: error
      }
    }
    return {
      code: 30204,
      msg: '非法token',
      err: error
    }
  }
  if (config.bindTokenToDevice && payload.clientId && payload.clientId !== this._getClientUaHash()) {
    return {
      code: 30201,
      msg: 'token不合法，请重新登录'
    }
  }
  return {
    code: 0,
    message: '',
    ...payload
  }
}

async function checkToken (token, {
  needPermission,
  needUserInfo = true
} = {}) {
  const config = this._getConfig();
  try {
    const payload = this._verifyToken(token);
    if (payload.code) {
      return payload
    }

    const {
      uid,
      needPermission: needPermissionInToken,
      role,
      permission,
      exp
    } = payload;

    // token内包含role、permission暂记为isV2Token
    const isV2Token = role && permission;

    needPermission = needPermission === undefined ? needPermissionInToken : needPermission;

    // admin不需要缓存role、permission在token内，判断是否有权限时推荐使用是否包含admin进行判断
    // 仅查询数据库，不验证token内的permission是否和库里的一致
    const needDBQuery = config.removePermissionAndRoleFromToken || !isV2Token || needUserInfo; // 新token且不需要用户信息的情况下不查库

    // 是否需要刷新token
    const needRefreshToken = (!config.removePermissionAndRoleFromToken && !isV2Token) || // 旧token新配置
      (config.removePermissionAndRoleFromToken && isV2Token) || // 新token旧配置
      (config.tokenExpiresThreshold && exp - Date.now() / 1000 < config.tokenExpiresThreshold); // token即将过期

    let userMatched = {};
    if (needDBQuery || needRefreshToken) {
      const userInDB = await userCollection.doc(uid).get();
      if (!userInDB.data || userInDB.data.length === 0 || !userInDB.data[0].token) {
        return {
          code: 30202,
          msg: 'token不合法，请重新登录'
        }
      }
      userMatched = userInDB.data[0];
      if (userMatched.status === 1) {
        return {
          code: 10001,
          msg: '账号已禁用'
        }
      }
      let tokenList = userMatched.token;
      if (!tokenList) {
        tokenList = [];
      } else if (typeof tokenList === 'string') {
        tokenList = [tokenList];
      }
      if (tokenList.indexOf(token) === -1) {
        return {
          code: 30202,
          msg: 'token不合法，请重新登录'
        }
      }
    }
    const result = {
      code: 0,
      msg: 'token校验通过',
      uid
    };

    // 新token直接返回token内的role、permission
    if (isV2Token) {
      result.role = role;
      result.permission = permission;
    }

    if (needUserInfo) {
      result.userInfo = userMatched;
    }

    // 旧token且需要返回permission的情况
    let currentRole;
    let currentPermission;
    if ((!isV2Token && needPermission) || needRefreshToken) {
      currentRole = result.role = userMatched.role || [];
      if (currentRole.length === 0 || currentRole.includes('admin')) {
        currentPermission = result.permission = [];
      } else {
        currentPermission = result.permission = await this._getPermissionListByRoleList(result.role);
      }
      // 尽量保持角色权限为最新且配套
      if (needPermission) {
        result.role = currentRole;
        result.permission = currentPermission;
      }
    }
    // 达到设置的token过期阈值或云端配置改变，需要重新下发一个token
    if (needRefreshToken) {
      let newTokeninfo;
      if (config.removePermissionAndRoleFromToken) {
        newTokeninfo = await this.createToken({
          uid,
          needPermission: needPermissionInToken
        });
      } else {
        newTokeninfo = await this.createToken({
          uid,
          role: currentRole,
          permission: currentPermission
        });
      }
      // 去除过期token防止文档过大
      let tokenList = userMatched.token;
      if (!tokenList) {
        tokenList = [];
      } else if (typeof tokenList === 'string') {
        tokenList = [tokenList];
      }
      const expiredToken = this._getExpiredToken(tokenList);
      tokenList = tokenList.filter(item => {
        return expiredToken.indexOf(item) === -1
      });
      tokenList.push(newTokeninfo.token);
      await userCollection.doc(uid).update({
        token: tokenList,
        last_login_date: Date.now(),
        last_login_ip: this.context.CLIENTIP
      });
      return {
        ...result,
        ...newTokeninfo
      }
    }

    return result
  } catch (error) {
    return {
      code: 90001,
      msg: '数据库读写异常：' + error.message,
      err: error
    }
  }
}
function getExpiredToken (tokenList) {
  const config = this._getConfig();
  const tokenExpired = [];
  tokenList.forEach(token => {
    try {
      jsonwebtoken.verify(token, config.tokenSecret);
    } catch (error) {
      tokenExpired.push(token);
    }
  });
  return tokenExpired
}

const db$g = uniCloud.database();
const dbCmd$2 = db$g.command;

async function getPermissionListByRoleList (roleList) {
  if (!Array.isArray(roleList)) {
    return []
  }
  if (roleList.length === 0) {
    return []
  }
  if (roleList.includes('admin')) {
    const permissionRecord = await permissionCollection.limit(500).get();
    return permissionRecord.data.map(item => item.permission_id)
  }
  const roleRecord = await roleCollection.where({
    role_id: dbCmd$2.in(roleList)
  }).get();
  const permission = [];
  roleRecord.data.forEach(item => {
    Array.prototype.push.apply(permission, item.permission);
  });
  return getDistinctArray(permission)
}

const db$h = uniCloud.database();

async function setVerifyCode ({
  mobile,
  email,
  code,
  expiresIn,
  type
}) {
  email = email && email.trim();
  mobile = mobile && mobile.trim();
  if (email) {
    const {
      emailToLowerCase
    } = this._getConfig();
    if (emailToLowerCase) {
      email = email.toLowerCase();
    }
  }
  if (!mobile && !email) {
    return {
      code: 50101,
      messageValues: {
        param: '手机号或邮箱'
      }
    }
  }
  if (mobile && email) {
    return {
      code: 50102,
      messageValues: {
        param: '参数',
        reason: '手机号和邮箱不可同时存在'
      }
    }
  }
  if (!code) {
    code = getSmsCode();
  }
  if (!expiresIn) {
    expiresIn = 180; // 默认180s过期时间
  }
  const now = Date.now();
  const record = {
    mobile,
    email,
    type,
    code,
    state: 0,
    ip: this.context.CLIENTIP,
    created_at: now,
    expired_at: now + expiresIn * 1000
  };

  const addRes = await verifyCollection.add(record);
  log('addRes', addRes);
  return {
    code: 0,
    mobile: mobile,
    email: email
  }
}

async function verifyCode ({
  mobile,
  email,
  code,
  type
}) {
  email = email && email.trim();
  mobile = mobile && mobile.trim();
  if (email) {
    const {
      emailToLowerCase
    } = this._getConfig();
    if (emailToLowerCase) {
      email = email.toLowerCase();
    }
  }
  if (!mobile && !email) {
    return {
      code: 50201,
      messageValues: {
        param: '手机号或邮箱'
      }
    }
  }
  if (mobile && email) {
    return {
      code: 50203,
      messageValues: {
        param: '参数',
        reason: '手机号和邮箱不可同时存在'
      }
    }
  }
  const dbCmd = db$h.command;
  const now = Date.now();
  const query = {
    mobile,
    email,
    type,
    code,
    state: 0,
    expired_at: dbCmd.gt(now)
  };
  const record = await verifyCollection.where(query).orderBy('created_at', 'desc').limit(1).get();

  log('verifyRecord:', record);

  if (record && record.data && record.data.length > 0) {
    // 验证通过
    const matched = record.data[0];
    // 状态改为已验证
    const upRes = await verifyCollection.doc(matched._id).update({
      state: 1
    });
    log('upRes', upRes);
    return {
      code: 0,
      msg: '验证通过'
    }
  } else {
    return {
      code: 50202,
      msg: '验证码错误或已失效'
    }
  }
}

async function sendSmsCode ({
  mobile,
  code,
  type,
  templateId
}) {
  if (!mobile) {
    throw new Error('手机号码不可为空')
  }
  if (!code) {
    code = getSmsCode();
  }
  if (!type) {
    throw new Error('验证码类型不可为空')
  }
  const config = this._getConfig();
  let smsConfig = config && config.service && config.service.sms;
  if (!smsConfig) {
    throw new Error('请在config.json或init方法中配置service.sms下短信相关参数')
  }
  smsConfig = Object.assign({
    codeExpiresIn: 300
  }, smsConfig);
  const paramRequired = ['smsKey', 'smsSecret'];
  if (!templateId && !smsConfig.name) {
    throw new Error('不传入templateId时应在config.json或init方法内service.sms下配置name字段以正确使用uniID_code模板')
  }
  for (let i = 0, len = paramRequired.length; i < len; i++) {
    const paramName = paramRequired[i];
    if (!smsConfig[paramName]) {
      throw new Error(`请在config.json或init方法中service.sms下配置${paramName}`)
    }
  }
  const {
    name,
    smsKey,
    smsSecret,
    codeExpiresIn
  } = smsConfig;
  let action;
  switch (type) {
    case 'login':
      action = '登录';
      break
    default:
      action = '验证手机号';
      break
  }
  try {
    const data = {
      name,
      code,
      action,
      expMinute: '' + Math.round(codeExpiresIn / 60)
    };
    if (name) {
      data.name = name;
    }
    await uniCloud.sendSms({
      smsKey,
      smsSecret,
      phone: mobile,
      templateId: templateId || 'uniID_code',
      data
    });
    const setCodeRes = await this.setVerifyCode({
      mobile,
      code,
      expiresIn: codeExpiresIn,
      type
    });
    if (setCodeRes.code >= 0) {
      return setCodeRes
    }
    return {
      code: 0,
      msg: '验证码发送成功'
    }
  } catch (e) {
    return {
      code: 50301,
      msg: `验证码发送失败, ${e.message}`
    }
  }
}



var methodList = /*#__PURE__*/Object.freeze({
  __proto__: null,
  getUserInfo: getUserInfo,
  getUserInfoByToken: getUserInfoByToken,
  resetPwd: resetPwd,
  setAvatar: setAvatar,
  updatePwd: updatePwd,
  updateUser: updateUser,
  _getAlipayApi: getAlipayApi,
  _getValidInviteCode: getValidInviteCode,
  _addUser: addUser,
  _loginExec: loginExec,
  _registerExec: registerExec,
  _getWeixinApi: getWeixinApi,
  _getQQApi: getQQApi,
  _getMatchedUser: getMatchedUser,
  _getCurrentAppUser: getCurrentAppUser,
  setAuthorizedAppLogin: setAuthorizedAppLogin,
  authorizeAppLogin: authorizeAppLogin,
  forbidAppLogin: forbidAppLogin,
  acceptInvite: acceptInvite,
  getInvitedUser: getInvitedUser,
  setUserInviteCode: setUserInviteCode,
  loginByAlipay: loginByAlipay,
  loginByEmail: loginByEmail,
  loginBySms: loginBySms,
  loginByWeixin: loginByWeixin,
  loginByQQ: loginByQQ,
  loginByUniverify: loginByUniverify,
  loginByApple: loginByApple,
  login: login,
  register: register,
  logout: logout,
  getRoleByUid: getRoleByUid,
  getPermissionByRole: getPermissionByRole,
  getPermissionByUid: getPermissionByUid,
  bindRole: bindRole,
  bindPermission: bindPermission,
  unbindRole: unbindRole,
  unbindPermission: unbindPermission,
  addRole: addRole,
  addPermission: addPermission,
  getRoleList: getRoleList,
  getRoleInfo: getRoleInfo,
  updateRole: updateRole,
  deleteRole: deleteRole,
  getPermissionList: getPermissionList,
  getPermissionInfo: getPermissionInfo,
  updatePermission: updatePermission,
  deletePermission: deletePermission,
  bindAlipay: bindAlipay,
  bindEmail: bindEmail,
  bindMobile: bindMobile,
  bindWeixin: bindWeixin,
  bindQQ: bindQQ,
  unbindAlipay: unbindAlipay,
  unbindEmail: unbindEmail,
  unbindMobile: unbindMobile,
  unbindWeixin: unbindWeixin,
  unbindQQ: unbindQQ,
  code2SessionAlipay: code2SessionAlipay,
  code2SessionWeixin: code2SessionWeixin,
  verifyAppleIdentityToken: verifyIdentityToken,
  wxBizDataCrypt: wxBizDataCrypt,
  encryptPwd: encryptPwd,
  checkToken: checkToken,
  createToken: createToken,
  _checkPwd: checkPwd,
  _verifyToken: verifyToken,
  _getExpiredToken: getExpiredToken,
  _getPermissionListByRoleList: getPermissionListByRoleList,
  _getClientUaHash: getClientUaHash,
  _createTokenInternal: createTokenInternal,
  setVerifyCode: setVerifyCode,
  verifyCode: verifyCode,
  sendSmsCode: sendSmsCode
});

let createConfig;
try {
  createConfig = require('uni-config-center');
} catch (error) { }

const configTips = '\n传入配置的方式有以下几种：\n- 在uni-config-center公共模块的uni-id目录下放置config.json文件（推荐）\n- 在uni-id公共模块的目录下放置config.json文件\n- 使用init方法传入配置\n- 如果使用uni-config-center且HBuilderX版本低于3.1.8，批量上传云函数及公共模块后需要再单独上传一次uni-id';
class UniID {
  constructor ({
    context,
    config
  } = {}) {
    const pluginConfig = createConfig && createConfig({
      pluginId: 'uni-id'
    });
    this.pluginConfig = pluginConfig;
    this.config = config || this._getConfigContent();
    // 兼容旧uni-id逻辑（非开发者调用createInstance创建），防止__ctx__被缓存在uni-id内部
    // this.context = context
    Object.defineProperty(this, 'context', {
      get () {
        return context || global.__ctx__
      }
    });
    // keys: customToken
    this.interceptorMap = new Map();
    if (pluginConfig && pluginConfig.hasFile('custom-token.js')) {
      this.setInterceptor('customToken', require(pluginConfig.resolve('custom-token.js')));
    }
  }

  get dev () {
    console.warn('当前正在使用uniID.dev属性，注意此属性仅可用于开发调试');
    return {
      getConfig: this._getConfig.bind(this)
    }
  }

  _getCurrentAppConfig (config) {
    if (!Array.isArray(config)) {
      return config
    }
    if (!this.context.APPID) {
      throw new Error('uni-id初始化时未传入DCloud AppId，如果使用云函数url化访问需要使用uniID.createInstance方法创建uni-id实例，并在context内传入APPID参数')
    }
    return config.find(item => item.dcloudAppid === this.context.APPID) || config.find(item => item.isDefaultConfig)
  }

  _getConfigContent () {
    // 使用uni-config-center
    if (this.pluginConfig && this.pluginConfig.hasFile('config.json')) {
      this._hasConfigFile = true;
      try {
        return this.pluginConfig.config()
      } catch (error) {
        return
      }
    }
    const configFilePath = path.resolve(__dirname, 'config.json');
    this._hasConfigFile = fs.existsSync(configFilePath);
    try {
      return require(configFilePath)
    } catch (error) { }
  }

  init (config) {
    console.warn('uniID.init接口已废弃，如需自行传入配置请使用uniID.createInstance接口创建uniID实例来使用');
    this.config = config;
  }

  setInterceptor (timing, handler) {
    this.interceptorMap.set(timing, handler);
  }

  _getConfig (platform) {
    // 每次都获取最新配置，不要修改此处逻辑
    const hasConfig = this.config && Object.keys(this.config).length !== 0;
    if (this._hasConfigFile && !hasConfig) {
      throw new Error('请确保公用模块uni-id对应的配置文件格式正确（不可包含注释）' + configTips)
    } else if (!hasConfig) {
      throw new Error('公用模块uni-id缺少配置信息' + configTips)
    }
    const currentAppConfig = this._getConfigContent(this.config);
    const platformConfig = Object.assign(currentAppConfig, currentAppConfig[platform || this.context.PLATFORM]) || {};
    const defaultConfig = {
      bindTokenToDevice: false,
      tokenExpiresIn: 7200,
      tokenExpiresThreshold: 1200,
      passwordErrorLimit: 6,
      passwordErrorRetryTime: 3600,
      usernameToLowerCase: true,
      emailToLowerCase: true
    };
    const config = Object.assign(defaultConfig, platformConfig);
    const argsRequired = ['passwordSecret', 'tokenSecret', 'tokenExpiresIn', 'passwordErrorLimit', 'passwordErrorRetryTime'];
    argsRequired.forEach((item) => {
      if (!config || !config[item]) {
        throw new Error(`请在公用模块uni-id的配置信息中内添加配置项：${item}`)
      }
    });
    return config
  }
}

for (const key in methodList) {
  UniID.prototype[key] = methodList[key];
  // if (key.indexOf('_') === 0) {
  //   UniID.prototype[key] = methodList[key]
  // } else {
  //   UniID.prototype[key] = wrapFn(methodList[key])
  // }
}

const deprecateMethodList = ['wxBizDataCrypt', 'verifyAppleIdentityToken', 'code2SessionWeixin', 'code2SessionAlipay'];

function createInstance ({
  context,
  config
} = {}) {
  const uniIDOrigin = new UniID({
    context,
    config
  });
  const uniID = new Proxy(uniIDOrigin, {
    get (target, prop) {
      if (prop in target && prop.indexOf('_') !== 0) {
        if (typeof target[prop] === 'function') {
          if (deprecateMethodList.indexOf(prop) > -1) {
            console.warn(`uniID.${prop}方法即将废弃，后续版本将不再暴露此方法`);
          }
          return wrapFn(target[prop]).bind(target)
        } else {
          return target[prop]
        }
      }
      return undefined
    }
  });
  return uniID
}

UniID.prototype.createInstance = createInstance;

var index = createInstance();

module.exports = index;
