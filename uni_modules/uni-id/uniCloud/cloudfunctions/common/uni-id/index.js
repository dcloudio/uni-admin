'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var crypto = _interopDefault(require('crypto'));
var buffer = _interopDefault(require('buffer'));
var stream = _interopDefault(require('stream'));
var util = _interopDefault(require('util'));

const PublicError = {
  PARAM_ERROR: {
    errCode: 'param-error'
  },
  PARAM_REQUIRED: {
    errCode: 'param-required'
  },
  USER_NOT_EXIST: {
    errCode: 'user-not-exist'
  },
  ROLE_NOT_EXIST: {
    errCode: 'role-not-exist'
  },
  PERMISSION_NOT_EXIST: {
    errCode: 'permission-not-exist'
  },
  MULTI_USER_MATCHED: {
    errCode: 'multi-user-matched'
  },
  USER_INFO_ERROR: {
    errCode: 'user-info-error'
  },
  USER_ACCOUNT_CONFLICT: {
    errCode: 'user-account-conflict'
  },
  USER_ACCOUNT_CLOSED: {
    errCode: 'user-account-closed'
  },
  ACCOUNT_ALREADY_REGISTED: {
    errCode: 'account-already-registed'
  },
  ACCOUNT_NOT_REGISTED: {
    errCode: 'account-not-registed'
  },
  ACCOUNT_already_BOUND: {
    errCode: 'account-already-bound'
  },
  UNBIND_FAILED: {
    errCode: 'unbind-failed'
  },
  INVALID_INVITE_CODE: {
    errCode: 'invalid-invite-code'
  },
  SET_INVITE_CODE_FAILED: {
    errCode: 'set-invite-code-failed'
  },
  GET_THIRD_PARTY_ACCOUNT_FAILED: {
    errCode: 'get-third-party-account-failed'
  },
  GET_THIRD_PARTY_USER_INFO_FAILED: {
    errCode: 'get-third-party-user-info-failed'
  }
};

const ErrorCode = {
  0: {
    errCode: 0,
    errMsg: ''
  },
  10001: {
    errCode: 'account-banned'
  },
  10002: PublicError.USER_NOT_EXIST,
  10003: PublicError.MULTI_USER_MATCHED,
  10004: PublicError.USER_INFO_ERROR,
  10005: PublicError.USER_ACCOUNT_CONFLICT,
  10006: PublicError.USER_ACCOUNT_CLOSED,
  10102: {
    errCode: 'password-error'
  },
  10103: {
    errCode: 'password-error-exceed-limit'
  },
  10201: PublicError.ACCOUNT_ALREADY_REGISTED,
  10202: PublicError.ACCOUNT_NOT_REGISTED,
  10203: PublicError.INVALID_INVITE_CODE,
  10301: PublicError.ACCOUNT_ALREADY_REGISTED,
  10302: PublicError.ACCOUNT_NOT_REGISTED,
  10401: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  10402: PublicError.ACCOUNT_ALREADY_REGISTED,
  10403: PublicError.ACCOUNT_NOT_REGISTED,
  10501: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  10502: PublicError.ACCOUNT_ALREADY_REGISTED,
  10503: PublicError.ACCOUNT_NOT_REGISTED,
  10601: PublicError.ACCOUNT_ALREADY_REGISTED,
  10602: PublicError.ACCOUNT_NOT_REGISTED,
  10701: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  10702: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  10703: PublicError.ACCOUNT_ALREADY_REGISTED,
  10704: PublicError.ACCOUNT_NOT_REGISTED,
  10705: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  10706: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  10801: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  10802: PublicError.ACCOUNT_ALREADY_REGISTED,
  10803: PublicError.ACCOUNT_NOT_REGISTED,
  20101: PublicError.PARAM_REQUIRED,
  20102: PublicError.ACCOUNT_ALREADY_REGISTED,
  30101: PublicError.PARAM_REQUIRED,
  30201: {
    errCode: 'check-device-feature-failed'
  },
  30202: {
    errCode: 'token-not-exist'
  },
  30203: {
    errCode: 'token-expired'
  },
  30204: {
    errCode: 'check-token-failed'
  },
  40201: PublicError.USER_NOT_EXIST,
  40202: {
    errCode: 'invalid-old-password'
  },
  50101: PublicError.PARAM_REQUIRED,
  50102: PublicError.PARAM_ERROR,
  50201: PublicError.PARAM_REQUIRED,
  50203: PublicError.PARAM_ERROR,
  50202: {
    errCode: 'invalid-verify-code'
  },
  50301: {
    errCode: 'send-sms-code-failed'
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
    errCode: 'modify-invite-code-is-not-allowed'
  },
  80601: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  80602: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  80701: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  80702: PublicError.GET_THIRD_PARTY_ACCOUNT_FAILED,
  80801: {
    errCode: 'decrypt-weixin-data-failed'
  },
  80802: {
    errCode: 'decrypt-weixin-data-failed'
  },
  80803: {
    errCode: 'invalid-weixin-appid'
  },
  80804: PublicError.PARAM_REQUIRED,
  80805: PublicError.PARAM_REQUIRED,
  80806: PublicError.PARAM_REQUIRED,
  80901: PublicError.GET_THIRD_PARTY_USER_INFO_FAILED,
  90001: {
    errCode: 'database-operation-failed'
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

const _toString = Object.prototype.toString;
const hasOwnProperty = Object.prototype.hasOwnProperty;

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
      // res.errDetail = `${res.code}, ${res.msg}`
      res.errMsg = this.t(errCodeDetail.errCode, res.messageValues || {}) || res.msg;
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
        parseResult.bind(this)(res);
        return res
      })
    } else {
      parseResult.bind(this)(res);
    }
    return res
  }
}

const word = {
  alipay: '支付宝',
  wechat: '微信',
  user: '用户',
  'user-id': '用户ID',
  'dcloud-appid': '应用Appid',
  'dcloud-appid-list': '应用列表',
  account: '账号',
  username: '用户名',
  email: '邮箱',
  mobile: '手机号',
  'wechat-openid': '微信openid',
  'wechat-account': '微信账号',
  'alipay-account': '支付宝账号',
  'qq-openid': 'QQ openid',
  'qq-account': 'QQ账号',
  'apple-account': '苹果账号',
  password: '密码',
  'verify-code': '验证码',
  'verify-code-type': '验证码类型',
  'user-unique-param': '用户名、邮箱或手机号',
  'role-id': '角色ID',
  'permission-id': '权限ID',
  login: '登录',
  'verify-mobile': '验证手机'
};

const sentence = {
  // dev
  'context-param-required': 'context内缺少{param}，请使用uniID.createInstance传入客户端信息',
  'config-param-require': 'uni-id的配置内缺少{param}',
  'uni-verify-config-required': '请在config.json中配置service.univerify下一键登录相关参数',
  'login-with-invite-type-required': '强制使用邀请码注册时，需指明type为register还是login',
  'type-array-required': '{param}应为数组形式',
  'query-field-warning': '检测到当前使用queryField匹配多字段进行登录操作，需要注意：uni-id并未限制用户名不能是手机号或邮箱，需要开发者自行限制。否则可能出现用户输入abc@xx.com会同时匹配到邮箱为此值的用户和用户名为此值的用户，导致登录失败',
  'add-role-admin-is-not-allowed': '不可新增roleID为admin的角色',
  'password-secret-type-error': 'config内passwordSecret类型错误，只可设置string类型和array类型',
  'token-expires-config-warning': 'tokenExpiresIn不可小于或等于tokenExpiresThreshold',
  'type-function-required': '{param}应为function类型',
  'dev-warning': '当前正在使用uniID.dev属性，注意此属性仅可用于开发调试',
  'config-file-invalid': '请确保公用模块uni-id对应的配置文件（common/uni-config-center/uni-id/config.json）格式正确（不可包含注释）',
  'config-file-not-found': '请在common/uni-config-center/uni-id/config.json内添加uni-id相关配置信息',
  'hx-version-warning': '当前使用的HBuilderX版本过低，请升级HBuilderX到最新版本',
  // end user message
  'account-banned': '账号已禁用',
  'user-not-exist': '用户不存在',
  'multi-user-matched': '匹配到多个账号',
  'user-info-error': '用户信息不正确',
  'user-account-conflict': '用户账号冲突',
  'user-account-closed': '此账号已注销',
  'password-error': '密码错误',
  'password-error-exceed-limit': '密码错误次数过多，请稍后再试',
  'account-already-registed': '此{type}已注册',
  'account-not-registed': '此{type}尚未注册',
  'invalid-invite-code': '邀请码无效',
  'get-third-party-account-failed': '获取{account}失败',
  'get-third-party-user-info-failed': '获取用户信息失败',
  'param-required': '{param}不可为空',
  'check-device-feature-failed': '设备特征校验未通过',
  'token-not-exist': '云端已不包含此token',
  'token-expired': 'token已过期',
  'check-token-failed': 'token校验未通过',
  'invalid-old-password': '旧密码错误',
  'param-error': '{param}参数错误，{reason}',
  'invalid-verify-code': '验证码错误或已失效',
  'send-sms-code-failed': '验证码发送失败',
  'account-already-bound': '此{type}已绑定',
  'unbind-failed': '解绑失败',
  'set-invite-code-failed': '邀请码设置失败',
  'modify-invite-code-is-not-allowed': '邀请码不可修改',
  'decrypt-weixin-data-failed': '解密失败',
  'invalid-weixin-appid': 'appid不匹配',
  'database-operation-failed': '数据库读写异常',
  'role-not-exist': '角色不存在',
  'permission-not-exist': '权限不存在',
  'context-required': 'uni-id无法获取context.{key}，请使用uniID.createInstance方法传入',
  'limit-client-platform': '当前客户端平台不支持此接口'
};

var zhHans = {
  ...word,
  ...sentence
};

const word$1 = {
  alipay: 'alipay',
  wechat: 'wechat',
  user: 'user',
  'user-id': 'user id',
  'dcloud-appid': 'DCloud appid',
  'dcloud-appid-list': 'DCloud appid list',
  account: 'account',
  username: 'username',
  email: 'email',
  mobile: 'phone number',
  'wechat-openid': 'wechat openid',
  'wechat-account': 'wechat account',
  'alipay-account': 'alipay account',
  'qq-openid': 'QQ openid',
  'qq-account': 'QQ account',
  'apple-account': 'apple account',
  password: 'password',
  'verify-code': 'verify code',
  'verify-code-type': 'verify code type',
  'user-unique-param': 'username, email or mobile phone number',
  'role-id': 'role id',
  'permission-id': 'permission id',
  login: 'login',
  'verify-mobile': 'verify mobile phone number'
};

const sentence$1 = {
  // dev
  'context-param-required': 'You should pass {param} in context using uniID.createInstance',
  'config-param-require': '{param} is required in uni-id\'s config',
  'uni-verify-config-required': 'univerify config required: service.univerify',
  'login-with-invite-type-required': 'parameter type is required when forceInviteCode set to true',
  'type-array-required': 'type of {param} must be array',
  'query-field-warning': 'You are using multi query field to login, be aware that uni-id will not check username\'s fromat, eg: abc@xx.com is a valid username for uni-id. You should check username in your code.',
  'add-role-admin-is-not-allowed': 'add role with an id of "admin" is not allowed',
  'password-secret-type-error': 'passwordSecret in config must be string or array',
  'token-expires-config-warning': 'tokenExpiresIn must be greater than tokenExpiresThreshold',
  'type-function-required': '{param} must be a function',
  'dev-warning': 'warning: uniID.dev is only for development',
  'config-file-invalid': 'invalid config file (common/uni-config-center/uni-id/config.json), please note that comment is not allowed',
  'config-file-not-found': 'config file (common/uni-config-center/uni-id/config.json) not found',
  'hx-version-warning': 'The HBuilderX you are using is too old, please upgrade to the latest version of HBuilderX',
  // end user message
  'account-banned': 'account is banned',
  'user-not-exist': 'user does not exist',
  'multi-user-matched': 'multiple users are matched',
  'user-info-error': 'user info error',
  'user-account-conflict': 'user account conflict',
  'user-account-closed': 'user account was closed',
  'password-error': 'password is incorrect',
  'password-error-exceed-limit': 'password error exceed limit',
  'account-already-registed': '{type} is already registed',
  'account-not-registed': '{type} is not registed',
  'invalid-invite-code': 'invalid invite code',
  'get-third-party-account-failed': 'get {account} failed',
  'get-third-party-user-info-failed': 'get user info failed',
  'param-required': '{param} is required',
  'check-device-feature-failed': 'check device feature failed',
  'token-not-exist': 'token is not exist',
  'token-expired': 'token is expired',
  'check-token-failed': 'check token failed',
  'invalid-old-password': 'invalid old password',
  'param-error': '{param} error, {reason}',
  'invalid-verify-code': 'invalid verify code',
  'send-sms-code-failed': 'send sms code failed',
  'account-already-bound': '{type} is already bound',
  'unbind-failed': 'unbind failed',
  'set-invite-code-failed': 'set invite code failed',
  'modify-invite-code-is-not-allowed': 'invite code modification is not allowed',
  'decrypt-weixin-data-failed': 'decrypt weixin data failed',
  'invalid-weixin-appid': 'invalid weixin appid',
  'database-operation-failed': 'database operation failed',
  'role-not-exist': 'role does not exist',
  'permission-not-exist': 'permission does not exist',
  'context-required': 'context.{key} is required, you should pass context using uniID.createInstance',
  'limit-client-platform': 'unsupported client platform'
};

var en = {
  ...word$1,
  ...sentence$1
};

var messages = {
  'zh-Hans': zhHans,
  en: en
};

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
// 返回国际化的key
const uniqueUserParam = {
  username: 'username',
  mobile: 'mobile',
  email: 'email',
  wx_unionid: 'wechat-account',
  'wx_openid.app-plus': 'wechat-account',
  'wx_openid.app': 'wechat-account',
  'wx_openid.mp-weixin': 'wechat-account',
  qq_unionid: 'qq-account',
  'qq_openid.app-plus': 'qq-account',
  'qq_openid.app': 'qq-account',
  'qq_openid.mp-weixin': 'qq-account',
  ali_openid: 'alipay-account',
  apple_openid: 'alipay-account'
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

const UserStatus = {
  normal: 0,
  banned: 1,
  audit: 2,
  auditFailed: 3,
  closed: 4
};

async function getUserInfo ({
  uid,
  field
}) {
  if (!uid) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: this.t('user-id')
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
    msg: '',
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
    msg: ''
  }
}

async function resetPwdBySms ({
  mobile,
  code,
  password
}) {
  const verifyRes = await this.verifyCode({
    mobile,
    code,
    type: 'reset-pwd'
  });
  if (verifyRes.code !== 0) {
    return verifyRes // 验证失败
  }
  const userRecord = userCollection.where({
    mobile
  });
  const userList = userRecord.data;
  if (userList.length === 0) {
    return {
      code: 10002
    }
  } else if (userList.length > 1) {
    return {
      code: 10005
    }
  }
  const uid = userList[0]._id;
  return this.resetPwd({
    uid,
    password
  })
}

// import uniToken from './uniToken.js'

async function setAvatar (params) {
  await userCollection.doc(params.uid).update({
    avatar: params.avatar
  });

  return {
    code: 0,
    msg: ''
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
        msg: ''
      }
    } else {
      return {
        code: 40202
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
        param: this.t('user-id')
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
    msg: ''
  }
}

async function updateStatus ({
  uid,
  status
} = {}) {
  if (!uid) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: this.t('user-id')
      }
    }
  }
  await userCollection.doc(uid).update({
    status,
    status_update_date: Date.now()
  });
  return {
    code: 0
  }
}

// 以下接口后续可能增加参数，暂时以对象形式传参
async function banAccount ({ uid } = {}) {
  return updateStatus.call(this, {
    uid,
    status: UserStatus.banned
  })
}

async function unbanAccount ({ uid } = {}) {
  return updateStatus.call(this, {
    uid,
    status: UserStatus.normal
  })
}

async function closeAccount ({ uid } = {}) {
  return updateStatus.call(this, {
    uid,
    status: UserStatus.closed
  })
}

async function openAccount ({ uid } = {}) {
  return updateStatus.call(this, {
    uid,
    status: UserStatus.normal
  })
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

  async getUserInfo ({
    accessToken,
    openid
  } = {}) {
    const url = '/sns/userinfo';
    const {
      nickname,
      headimgurl: avatar
    } = await this._requestWxOpenapi({
      name: 'getUserInfo',
      url,
      data: {
        accessToken,
        openid,
        appid: this.options.appId,
        secret: this.options.secret,
        scope: 'snsapi_userinfo'
      }
    });
    return {
      nickname,
      avatar
    }
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
        message: 'appid not match'
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
        throw new Error('check sign error')
      }
    } else if (errorResponse) {
      throw new Error(errorResponse.sub_msg || errorResponse.msg || 'request fail')
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

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

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

var ms = function (val, options) {
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
    const { kid } = JSON.parse(Buffer.from(jwtHeader, 'base64').toString());

    if (!authKeys.length) {
      try {
        authKeys = await this.getAuthKeys();
      } catch (error) {
        return {
          code: 10705,
          msg: error.message
        }
      }
    }

    const usedKey = this.getUsedKey(authKeys, kid);

    if (!Object.keys(usedKey).length && !this.fetched) {
      try {
        authKeys = await this.getAuthKeys();
      } catch (error) {
        return {
          code: 10705,
          msg: error.message
        }
      }
    }

    /**
     * identityToken 格式
     *
     * {
     *   iss: 'https://appleid.apple.com',
     *   aud: 'io.dcloud.hellouniapp',
     *   exp: 1610626724,
     *   iat: 1610540324,
     *   sub: '000628.30119d332d9b45a3be4a297f9391fd5c.0403',
     *   c_hash: 'oFfgewoG36cJX00KUbj45A',
     *   email: 'x2awmap99s@privaterelay.appleid.com',
     *   email_verified: 'true',
     *   is_private_email: 'true',
     *   auth_time: 1610540324,
     *   nonce_supported: true
     * }
     */
    let jwtClaims = null;
    try {
      jwtClaims = jsonwebtoken.verify(identityToken, rsaPublicKeyPem(usedKey.n, usedKey.e), { algorithms: usedKey.alg });
    } catch (error) {
      return {
        code: 10705,
        msg: error.message
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
    if (status !== 200) throw new Error('request https://appleid.apple.com/auth/keys fail')
    return data.keys
  }

  /**
   * 从这组密钥中，选择具有匹配密钥标识符（kid）的密钥，以验证Apple发行的任何JSON Web令牌（JWT）的签名
   */
  getUsedKey (authKeys, kid) {
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

function getWeixinApi () {
  const clientPlatform = this.context.PLATFORM;
  const config = this._getConfig();
  if (!config.oauth || !config.oauth.weixin) {
    throw new Error(this.t('config-param-require', {
      param: `${clientPlatform}.weixin`
    }))
  }
  const argsRequired = ['appid', 'appsecret'];
  argsRequired.forEach((item) => {
    if (!config.oauth.weixin[item]) {
      throw new Error(this.t('config-param-require', {
        param: `${clientPlatform}.weixin.${item}`
      }))
    }
  });
  const weixinApi = platformApi.initWeixin({ ...config.oauth.weixin });
  return weixinApi
}

function getQQApi () {
  const clientPlatform = this.context.PLATFORM;
  const config = this._getConfig();
  if (!config.oauth || !config.oauth.qq) {
    throw new Error(this.t('config-param-require', {
      param: `${clientPlatform}.qq`
    }))
  }
  const argsRequired = ['appid', 'appsecret'];
  argsRequired.forEach((item) => {
    if (!config.oauth.qq[item]) {
      throw new Error(this.t('config-param-require', {
        param: `${clientPlatform}.qq.${item}`
      }))
    }
  });
  const qqApi = platformApi.initQQ({ ...config.oauth.qq });
  return qqApi
}

function getAlipayApi () {
  const clientPlatform = this.context.PLATFORM;
  const config = this._getConfig();
  if (!config.oauth || !config.oauth.alipay) {
    throw new Error(this.t('config-param-require', {
      param: `${clientPlatform}.alipay`
    }))
  }
  const argsRequired = ['appid', 'privateKey'];
  argsRequired.forEach((item) => {
    if (!config.oauth.alipay[item]) {
      throw new Error(this.t('config-param-require', {
        param: `${clientPlatform}.alipay.${item}`
      }))
    }
  });
  const alipayApi = platformApi.initAlipay({ ...config.oauth.alipay });
  return alipayApi
}

async function loginExec (user, options = {}) {
  if (user.status === UserStatus.banned) {
    return {
      code: 10001
    }
  }
  if (user.status === UserStatus.closed) {
    return {
      code: 10006
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
    msg: '',
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
    register_date: Date.now()
    // register_ip: this.context.CLIENTIP
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

  const {
    PLATFORM,
    appId,
    appid,
    APPID,
    uniPlatform,
    appName,
    appVersion,
    appVersionCode,
    channel,
    clientIP,
    CLIENTIP
  } = this.context;

  user.register_env = {
    appId: appId || appid || APPID || '',
    uniPlatform: uniPlatform || PLATFORM || '',
    appName: appName || '',
    appVersion: appVersion || '',
    appVersionCode: appVersionCode || '',
    channel: channel ? channel + '' : '', // channel可能为数字，统一存为字符串
    clientIP: clientIP || CLIENTIP || ''
  };

  const registerResult = await this._addUser(user, {
    needPermission,
    autoSetDcloudAppid
  });

  return {
    code: 0,
    msg: '',
    ...registerResult
  }
}

function checkLoginUserList (userList) {
  if (!userList || userList.length === 1) {
    return
  }
  if (userList[0].status === UserStatus.closed) {
    return {
      code: 10006
    }
  }
  return {
    code: 10005
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
    // 防止开发者漏传appid导致用户重复注册，item.dcloud_appid.indexOf(null) > -1
    return item.dcloud_appid === undefined || item.dcloud_appid === null || item.dcloud_appid.indexOf(dcloudAppid) > -1 || item.dcloud_appid.indexOf(null) > -1
  })
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
        my_invite_code: code
      }).get();
      if (codeInDb.data.length === 0) {
        codeValid = true;
        break
      }
      code = getRandomInviteCode();
    }
    code = getRandomInviteCode();
  } catch (e) {}
  if (!codeValid) {
    if (inviteCode) {
      return {
        code: 80401
      }
    } else {
      return {
        code: 80402
      }
    }
  }
  return {
    code: 0,
    inviteCode: code
  }
}

const dbCmd = db.command;

async function checkCanAuthorize ({
  uid,
  dcloudAppidList
} = {}) {
  if (!uid) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: this.t('user-id')
      }
    }
  }
  if (!dcloudAppidList || dcloudAppidList.length === 0 || dcloudAppidList.some(item => item === undefined)) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: this.t('dcloud-appid')
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

  // 与其他存在dcloud_appid的用户冲突时，不可设置
  const appidQuery = {
    dcloud_appid: dbCmd.in(dcloudAppidList),
    _id: dbCmd.neq(userInfo._id)
  };

  // 与其他不存在dcloud_appid的用户冲突时，不可设置
  const appidNotExistQuery = {
    dcloud_appid: dbCmd.exists(false),
    _id: dbCmd.neq(userInfo._id)
  };

  switch (userQuery.length) {
    case 0:
      return {
        code: 10004
      }
    case 1:
      query = dbCmd.or([
        dbCmd.and([
          userQuery[0],
          appidQuery
        ]),
        dbCmd.and([
          userQuery[0],
          appidNotExistQuery
        ])
      ]);
      break
    default:
      query = dbCmd.or([
        dbCmd.and([
          dbCmd.or(userQuery),
          appidQuery
        ]),
        dbCmd.and([
          dbCmd.or(userQuery),
          appidNotExistQuery
        ])
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
  // const conflictKey = uniqueUserParamList.find(key => userInfo[key] === checkUserInfo[key])
  return {
    code: 10005
    // msg: `此用户的${this.t(uniqueUserParam[conflictKey])}已被授权登录，不可再次授权`
  }
}

async function setAuthorizedAppLogin ({
  uid,
  dcloudAppidList
} = {}) {
  if (getType(dcloudAppidList) !== 'array') {
    return {
      code: PublicErrorCode.PARAM_ERROR,
      messageValues: {
        param: 'dcloudAppidList',
        reason: this.t('type-array-required', {
          param: this.t('dcloud-appid-list')
        })
      }
    }
  }
  if (dcloudAppidList && dcloudAppidList.length !== 0) {
    const checkCanAuthorizeRes = await checkCanAuthorize.bind(this)({
      uid,
      dcloudAppidList
    });
    if (checkCanAuthorizeRes.code) {
      return checkCanAuthorizeRes
    }
  }
  await userCollection.doc(uid).update({
    dcloud_appid: dbCmd.set(dcloudAppidList)
  });
  return {
    code: 0
  }
}

async function authorizeAppLogin ({
  uid,
  dcloudAppid
} = {}) {
  const checkCanAuthorizeRes = await checkCanAuthorize.bind(this)({
    uid,
    dcloudAppidList: [dcloudAppid]
  });
  if (checkCanAuthorizeRes.code) {
    return checkCanAuthorizeRes
  }
  await userCollection.doc(uid).update({
    dcloud_appid: dbCmd.push(dcloudAppid)
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
        param: this.t('user-id')
      }
    }
  }
  await userCollection.doc(uid).update({
    dcloud_appid: dbCmd.pull(dcloudAppid)
  });
  return {
    code: 0
  }
}

const db$1 = uniCloud.database();
const dbCmd$1 = db$1.command;

async function acceptInvite ({
  uid,
  inviteCode
}) {
  const inviter = await userCollection.where({
    _id: dbCmd$1.neq(uid),
    inviter_uid: dbCmd$1.not(dbCmd$1.all([uid])),
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
    inviter_uid: dbCmd$1.push(inviterUid)
  });
  return {
    code: 0,
    msg: ''
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
    msg: '',
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
    msg: '',
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
    code,
    myInviteCode,
    role,
    type
  } = params;

  const {
    openid
  } = await this._getAlipayApi().code2Session(code);
  if (!openid) {
    return {
      code: 10501,
      messageValues: {
        account: this.t('alipay-account')
      }
    }
  }
  let userList = await userCollection.where({
    ali_openid: openid
  }).get();
  userList = this._getCurrentAppUser(userList.data);
  // openid已注册
  if (userList && userList.length > 0) {
    if (type === 'register') {
      return {
        code: 10502,
        messageValues: {
          type: this.t('alipay-account')
        }
      }
    }
    if (userList.length !== 1) {
      return {
        code: 10005
      }
    }
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
    if (type === 'login') {
      return {
        code: 10503,
        messageValues: {
          type: this.t('alipay-account')
        }
      }
    }
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
        param: this.t('mobile')
      }
    }
  }
  const config = this._getConfig();
  if (config.forceInviteCode && !type) {
    throw new Error(this.t('login-with-invite-type-required'))
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
          type: this.t('mobile')
        }
      }
    }
    if (userList.length !== 1) {
      return {
        code: 10005
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
          type: this.t('mobile')
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
          code: 10203
        }
      }
      // 倒序排列全部邀请人
      user.inviter_uid = ([inviter.data[0]._id]).concat(inviter.data[0].inviter_uid || []);
      user.invite_time = now;
    } else if (config.forceInviteCode) {
      return {
        code: 10203
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
    role,
    type
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
  } = await this._getWeixinApi()[isMpWeixin ? 'code2Session' : 'getOauthAccessToken'](code);
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
    if (type === 'register') {
      return {
        code: 10402,
        messageValues: {
          type: this.t('wechat-account')
        }
      }
    }
    if (userList.length !== 1) {
      return {
        code: 10005
      }
    }
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
    if (type === 'login') {
      return {
        code: 10403,
        messageValues: {
          type: this.t('wechat-account')
        }
      }
    }
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
  role,
  type
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
    if (type === 'register') {
      return {
        code: 10802,
        messageValues: {
          type: this.t('qq-account')
        }
      }
    }

    if (userList.length !== 1) {
      return {
        code: 10005
      }
    }

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
    if (type === 'login') {
      return {
        code: 10803,
        messageValues: {
          type: this.t('qq-account')
        }
      }
    }
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
      throw new Error(this.t('config-param-requred', {
        param: `service.univerify.${paramName}`
      }))
    }
  }
  if (!(params.openid && params.access_token)) {
    throw new Error(this.t('config-param-requred', {
      param: 'openid, access_token'
    }))
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
function getPhoneNumberError (res, t) {
  const ErrorCollection = {
    0: '',
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
    throw new Error(this.t('uni-verify-config-required'))
  }

  if (config.forceInviteCode && !type) {
    throw new Error(this.t('login-with-invite-type-required'))
  }

  // 换取手机号
  const phoneInfo = await getPhoneNumber.bind(this)({
    ...univerifyConfig,
    openid,
    access_token
  });
  if (phoneInfo.code !== 0) {
    return phoneInfo
  }

  const mobile = String(phoneInfo.phoneNumber);
  let userList = await userCollection.where({
    mobile,
    mobile_confirmed: 1
  }).get();
  userList = this._getCurrentAppUser(userList.data);

  /**
   * 以下为登录
   */
  if (userList && userList.length > 0) {
    if (type === 'register') {
      return {
        code: 10601,
        messageValues: {
          type: this.t('mobile')
        }
      }
    }
    if (userList.length !== 1) {
      return {
        code: 10005
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
        type: this.t('mobile')
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
        code: 10203
      }
    }
    inviter = inviter.data[0];
    // 倒序排列全部邀请人
    user.inviter_uid = ([inviter._id]).concat(inviter.inviter_uid || []);
    user.invite_time = now;
  } else if (config.forceInviteCode) {
    return {
      code: 10203
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
  role
}) {
  const config = this._getConfig();

  const appleConfig = config && config.oauth && config.oauth.apple;

  const bundleId = appleConfig && appleConfig.bundleId;
  if (!bundleId) {
    throw new Error(this.t('config-param-require', {
      param: '(app || app-plus).apple.bundleId'
    }))
  }

  if (!identityToken) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: 'identityToken'
      }
    }
  }

  fullName = nickName || (fullName && Object.keys(fullName).length > 0 ? fullName.familyName + fullName.givenName : '');

  const { code, msg } = await platformApi.initApple().verifyIdentityToken(identityToken);

  if (code !== 0) {
    return {
      code,
      msg,
      messageValues: {
        account: this.t('apple-account')
      }
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
      messageValues: {
        account: this.t('apple-account')
      }
    }
  }

  if (!sub) {
    return {
      code: 10701,
      messageValues: {
        account: this.t('apple-account')
      }
    }
  }

  if (bundleId !== aud) {
    return {
      code: 10702,
      messageValues: {
        account: this.t('apple-account')
      }
    }
  }

  const nickname = fullName || `User-${checkEmail ? checkEmail.split('@')[0] : Math.random().toString(32).slice(2)}`;
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
          type: this.t('apple-account')
        }
      }
    }

    if (userList.length !== 1) {
      return {
        code: 10005
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
        type: this.t('apple-account')
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
    console.warn(this.t('query-field-warning'));
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
  const usernameTrim = username && username.trim();
  if (!usernameTrim) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: this.t('username')
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
  let userList = await userCollection.where(dbCmd.or(...query)).get();
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
      code: 10103
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
    desc: this.t('username')
  }, {
    name: 'email',
    desc: this.t('email'),
    extraCond: {
      email_confirmed: 1
    }
  }, {
    name: 'mobile',
    desc: this.t('mobile'),
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
        param: this.t('user-unique-param')
      }
    }
  }

  const dbCmd = db$6.command;
  let userList = await userCollection.where(dbCmd.or(...query)).get();
  userList = this._getCurrentAppUser(userList.data);
  // 用户已存在
  if (userList && userList.length > 0) {
    const userToCheck = userList[0];
    if (userToCheck.status === UserStatus.closed) {
      return {
        code: 10006
      }
    }
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
        param: this.t('password')
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
    msg: ''
  }
}

// role based access control

const db$8 = uniCloud.database();
const dbCmd$2 = db$8.command;

async function getRoleByUid ({
  uid
}) {
  if (!uid) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: this.t('user-id')
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
    msg: '',
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
        param: 'roleID'
      }
    }
  }
  // admin特殊处理
  if (roleID === 'admin') {
    const permissionRecord = await permissionCollection.limit(1000).get();
    return {
      code: 0,
      msg: '',
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
    msg: '',
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
    msg: '',
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
    data.role = dbCmd$2.push(roleList);
  }
  await userCollection.doc(uid).update(data);
  return {
    code: 0,
    msg: ''
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
    data.permission = dbCmd$2.push(permissionList);
  }
  await roleCollection.where({
    role_id: roleID
  }).update(data);
  return {
    code: 0,
    msg: ''
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
    role: dbCmd$2.pull(dbCmd$2.in(roleList))
  });
  return {
    code: 0,
    msg: ''
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
    permission: dbCmd$2.pull(dbCmd$2.in(permissionList))
  });
  return {
    code: 0,
    msg: ''
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
        param: this.t('role-id')
      }
    }
  }
  if (roleID === 'admin') {
    return {
      code: PublicErrorCode.PARAM_ERROR,
      messageValues: {
        param: 'roleID',
        reason: this.t('add-role-admin-is-not-allowed')
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
    msg: ''
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
    msg: '',
    roleList: roleRecord.data
  };
  if (needTotal) {
    const {
      total
    } = await roleCollection.where({
      _id: dbCmd$2.exists(true)
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
        param: this.t('role-id')
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
    msg: ''
  }
}

async function deleteRole ({
  roleID
}) {
  const roleIDType = getType(roleID);
  if (roleIDType === 'string') {
    roleID = [roleID];
  } else if (roleIDType !== 'array') {
    throw new Error('typeof roleID must be array or string')
  }
  await roleCollection.where({
    role_id: dbCmd$2.in(roleID)
  }).remove();
  await userCollection.where({
    role: dbCmd$2.elemMatch(dbCmd$2.in(roleID))
  }).update({
    role: dbCmd$2.pullAll(roleID)
  });
  return {
    code: 0,
    msg: ''
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
        param: this.t('permission-id')
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
    msg: ''
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
    msg: '',
    permissionList: permissionRecord.data
  };
  if (needTotal) {
    const {
      total
    } = await permissionCollection.where({
      _id: dbCmd$2.exists(true)
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
        param: this.t('permission-id')
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
        param: this.t('permission-id')
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
    msg: ''
  }
}

async function deletePermission ({
  permissionID
}) {
  const permissionIDType = getType(permissionID);
  if (permissionIDType === 'string') {
    permissionID = [permissionID];
  } else if (permissionIDType !== 'array') {
    throw new Error('typeof permissionID must be array or string')
  }
  await permissionCollection.where({
    permission_id: dbCmd$2.in(permissionID)
  }).remove();
  await roleCollection.where({
    permission: dbCmd$2.elemMatch(dbCmd$2.in(permissionID))
  }).update({
    permission: dbCmd$2.pullAll(permissionID)
  });
  return {
    code: 0,
    msg: ''
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
        account: this.t('alipay-account')
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
        type: this.t('alipay-account')
      }
    }
  }
  await userCollection.doc(uid).update({
    ali_openid: openid
  });
  return {
    code: 0,
    openid,
    msg: ''
  }
}

async function bindEmail ({
  uid,
  email,
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
  if (!code) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: '验证码'
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
    msg: '',
    email
  }
}

/**
 *
 * @param {string} uid user id
 * @param {string} mobile 手机号
 * @param {string} code 手机验证码
 * @param {string} openid client openid
 * @param {string} access_token client access_token
 * @returns
 */
async function bindMobile ({
  uid,
  mobile,
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
    const phoneInfo = await getPhoneNumber.bind(this)({
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
    if (!mobile) {
      return {
        code: PublicErrorCode.PARAM_REQUIRED,
        messageValues: {
          param: this.t('mobile')
        }
      }
    }
    if (!code) {
      return {
        code: PublicErrorCode.PARAM_REQUIRED,
        messageValues: {
          param: this.t('verify-code')
        }
      }
    }
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
    msg: '',
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
        type: this.t('wechat-account')
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
    msg: '',
    openid,
    unionid,
    ...result
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
        type: this.t('qq-account')
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
    msg: '',
    openid,
    unionid,
    ...result
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
      msg: ''
    }
  } else {
    return {
      code: 70401
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
        param: !uid ? this.t('user-id') : this.t('email')
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
      msg: ''
    }
  } else {
    return {
      code: 70201
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
      msg: ''
    }
  } else {
    return {
      code: 70101
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
      msg: ''
    }
  } else {
    return {
      code: 70301
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
      msg: ''
    }
  } else {
    return {
      code: 70501
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
          account: this.t('alipay-account')
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
        account: this.t('alipay-account')
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
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: 'encryptedData'
      }
    }
  }

  if (!iv) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: 'iv'
      }
    }
  }

  if (!code && !sessionKey) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: 'sessionKey'
      }
    }
  }

  const WeiXinApi = this._getWeixinApi();

  if (!sessionKey) {
    const res = await WeiXinApi.code2Session(code);

    if (!res.sessionKey) {
      return {
        code: 80801
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
    console.error(err);
    return {
      code: 80802
    }
  }

  if (decoded.watermark.appid !== WeiXinApi.options.appId) {
    return {
      code: 80803
    }
  }

  return {
    code: 0,
    msg: '',
    ...decoded
  }
}

async function getWeixinUserInfo ({
  accessToken,
  openid
} = {}) {
  const clientPlatform = this.context.PLATFORM;
  if (clientPlatform !== 'app' && clientPlatform !== 'app-plus') {
    throw new Error(this.t('limit-client-platform'))
  }
  try {
    const result = await this._getWeixinApi().getUserInfo({
      accessToken,
      openid
    });
    return {
      code: 0,
      msg: '',
      ...result
    }
  } catch (error) {
    return {
      code: 80901
    }
  }
}

// user对象
function checkPwd (user, password) {
  if (!password) {
    return {
      code: 1
      // message: '密码不能为空'
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
        message: ''
      }
    }
    return {
      code: 2
      // message: '密码不正确'
    }
  }
  if (passwordSecretType !== 'array') {
    throw new Error(this.t('password-secret-type-error'))
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
      code: 3
      // message: 'secretVersion不正确'
    }
  }
  const currentSecret = secretList[secretList.length - 1];
  const {
    passwordHash: previousPasswordHash
  } = this.encryptPwd(password, previousSecret);
  if (previousPasswordHash === pwdInDB) {
    const result = {
      code: 0
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
    throw new Error(this.t('param-required', {
      param: this.t('password')
    }))
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
    throw new Error(this.t('param-error', {
      param: 'passwordSecret',
      reason: 'invalid passwordSecret'
    }))
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
  if (config.tokenExpiresIn && config.tokenExpiresThreshold && config.tokenExpiresIn <= config.tokenExpiresThreshold) {
    throw new Error(this.t('token-expires-config-warning'))
  }
  if (getType(signContent) !== 'object' || !signContent.uid) {
    return {
      code: 30101,
      messageValues: {
        param: this.t('user-id')
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
        param: this.t('user-id')
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
    throw new Error(this.t('type-function-required', 'customToken'))
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
        err: error
      }
    }
    return {
      code: 30204,
      err: error
    }
  }
  if (config.bindTokenToDevice && payload.clientId && payload.clientId !== this._getClientUaHash()) {
    return {
      code: 30201
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
  const payload = this._verifyToken(token);
  if (payload.code) {
    return payload
  }

  const {
    uid,
    needPermission: needPermissionInToken,
    role,
    permission,
    exp,
    iat,
    ...restPayload
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
        code: 30202
      }
    }
    userMatched = userInDB.data[0];
    if (userMatched.status === UserStatus.banned) {
      return {
        code: 10001
      }
    }
    if (userMatched.status === UserStatus.closed) {
      return {
        code: 10006
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
        code: 30202
      }
    }
  }
  const result = {
    code: 0,
    uid,
    ...restPayload
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
const dbCmd$3 = db$g.command;

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
    role_id: dbCmd$3.in(roleList)
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
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: this.t('mobile')
      }
    }
  }
  if (!code) {
    code = getSmsCode();
  }
  if (!type) {
    return {
      code: PublicErrorCode.PARAM_REQUIRED,
      messageValues: {
        param: this.t('verify-code-type')
      }
    }
  }
  const config = this._getConfig();
  let smsConfig = config && config.service && config.service.sms;
  if (!smsConfig) {
    throw new Error(this.t('config-param-required', {
      param: 'service.sms'
    }))
  }
  smsConfig = Object.assign({
    codeExpiresIn: 300
  }, smsConfig);
  const paramRequired = ['smsKey', 'smsSecret'];
  for (let i = 0, len = paramRequired.length; i < len; i++) {
    const paramName = paramRequired[i];
    if (!smsConfig[paramName]) {
      throw new Error(this.t('config-param-required', {
        param: `service.sms.${paramName}`
      }))
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
      action = this.t('login');
      break
    default:
      action = this.t('verify-mobile');
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
      msg: ''
    }
  } catch (e) {
    return {
      code: 50301
    }
  }
}



var methodList = /*#__PURE__*/Object.freeze({
  __proto__: null,
  getUserInfo: getUserInfo,
  getUserInfoByToken: getUserInfoByToken,
  resetPwd: resetPwd,
  resetPwdBySms: resetPwdBySms,
  setAvatar: setAvatar,
  updatePwd: updatePwd,
  updateUser: updateUser,
  banAccount: banAccount,
  unbanAccount: unbanAccount,
  closeAccount: closeAccount,
  openAccount: openAccount,
  _getAlipayApi: getAlipayApi,
  _getValidInviteCode: getValidInviteCode,
  _addUser: addUser,
  _loginExec: loginExec,
  _registerExec: registerExec,
  _getWeixinApi: getWeixinApi,
  _getQQApi: getQQApi,
  _getMatchedUser: getMatchedUser,
  _getCurrentAppUser: getCurrentAppUser,
  _checkLoginUserList: checkLoginUserList,
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
  getWeixinUserInfo: getWeixinUserInfo,
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

var lodash_merge = createCommonjsModule(function (module, exports) {
/**
 * Lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    asyncTag = '[object AsyncFunction]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    nullTag = '[object Null]',
    objectTag = '[object Object]',
    proxyTag = '[object Proxy]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    undefinedTag = '[object Undefined]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Detect free variable `exports`. */
var freeExports =  exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
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
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
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
var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined,
    getPrototype = overArg(Object.getPrototypeOf, Object),
    objectCreate = Object.create,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice,
    symToStringTag = Symbol ? Symbol.toStringTag : undefined;

var defineProperty = (function() {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeMax = Math.max,
    nativeNow = Date.now;

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map'),
    nativeCreate = getNative(Object, 'create');

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ListCache;
  this.size = 0;
}

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

// Add methods to `Stack`.
Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * This function is like `assignValue` except that it doesn't assign
 * `undefined` values.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignMergeValue(object, key, value) {
  if ((value !== undefined && !eq(object[key], value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    baseAssignValue(object, key, value);
  }
}

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = createBaseFor();

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }
  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * The base implementation of `_.merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  baseFor(source, function(srcValue, key) {
    stack || (stack = new Stack);
    if (isObject(srcValue)) {
      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    }
    else {
      var newValue = customizer
        ? customizer(safeGet(object, key), srcValue, (key + ''), object, source, stack)
        : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }
      assignMergeValue(object, key, newValue);
    }
  }, keysIn);
}

/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = safeGet(object, key),
      srcValue = safeGet(source, key),
      stacked = stack.get(srcValue);

  if (stacked) {
    assignMergeValue(object, key, stacked);
    return;
  }
  var newValue = customizer
    ? customizer(objValue, srcValue, (key + ''), object, source, stack)
    : undefined;

  var isCommon = newValue === undefined;

  if (isCommon) {
    var isArr = isArray(srcValue),
        isBuff = !isArr && isBuffer(srcValue),
        isTyped = !isArr && !isBuff && isTypedArray(srcValue);

    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray(objValue)) {
        newValue = objValue;
      }
      else if (isArrayLikeObject(objValue)) {
        newValue = copyArray(objValue);
      }
      else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer(srcValue, true);
      }
      else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray(srcValue, true);
      }
      else {
        newValue = [];
      }
    }
    else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      newValue = objValue;
      if (isArguments(objValue)) {
        newValue = toPlainObject(objValue);
      }
      else if (!isObject(objValue) || isFunction(objValue)) {
        newValue = initCloneObject(srcValue);
      }
    }
    else {
      isCommon = false;
    }
  }
  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }
  assignMergeValue(object, key, newValue);
}

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }
  return object;
}

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !isPrototype(object))
    ? baseCreate(getPrototype(object))
    : {};
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
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
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
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}

/**
 * Gets the value at `key`, unless `key` is "__proto__" or "constructor".
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function safeGet(object, key) {
  if (key === 'constructor' && typeof object[key] === 'function') {
    return;
  }

  if (key == '__proto__') {
    return;
  }

  return object[key];
}

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = shortOut(baseSetToString);

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
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
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

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
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

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
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
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
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
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
  return value != null && typeof value == 'object';
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
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

/**
 * Converts `value` to a plain object flattening inherited enumerable string
 * keyed properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject(value) {
  return copyObject(value, keysIn(value));
}

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
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
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

/**
 * This method is like `_.assign` except that it recursively merges own and
 * inherited enumerable string keyed properties of source objects into the
 * destination object. Source properties that resolve to `undefined` are
 * skipped if a destination value exists. Array and plain object properties
 * are merged recursively. Other objects and value types are overridden by
 * assignment. Source objects are applied from left to right. Subsequent
 * sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 0.5.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = {
 *   'a': [{ 'b': 2 }, { 'd': 4 }]
 * };
 *
 * var other = {
 *   'a': [{ 'c': 3 }, { 'e': 5 }]
 * };
 *
 * _.merge(object, other);
 * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
 */
var merge = createAssigner(function(object, source, srcIndex) {
  baseMerge(object, source, srcIndex);
});

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = merge;
});

let createConfig;
try {
  createConfig = require('uni-config-center');
} catch (error) {
  throw new Error('Plugin[uni-config-center] was not found')
}

class UniID {
  constructor ({
    context,
    clientInfo,
    config
  } = {}) {
    const pluginConfig = createConfig({
      pluginId: 'uni-id'
    });
    this.pluginConfig = pluginConfig;
    this.config = config || this._getConfigContent();
    this._configCache = {}; // appid_platform : {}
    // 兼容旧uni-id逻辑（非开发者调用createInstance创建），防止__ctx__被缓存在uni-id内部
    // this.context = context
    Object.defineProperty(this, 'context', {
      get () {
        let realContext;
        if (clientInfo) {
          realContext = {
            OS: clientInfo.os,
            CLIENTIP: clientInfo.clientIP,
            CLIENTUA: clientInfo.userAgent,
            PLATFORM: clientInfo.platform,
            APPID: clientInfo.appId,
            LOCALE: clientInfo.locale,
            DEVICEID: clientInfo.deviceId
          };
        } else {
          realContext = Object.assign({}, context || global.__ctx__ || {});
        }
        const required = ['CLIENTIP', 'PLATFORM', 'APPID', 'LOCALE'];
        for (let i = 0; i < required.length; i++) {
          const key = required[i];
          if (realContext[key] === undefined) {
            console.warn(i18n.t('context-required', {
              key
            }));
          }
        }
        const appid = realContext.APPID;
        const platform = realContext.PLATFORM;

        // TODO 优化此处逻辑，现在都写在get context里面太混乱了，并且性能也不好
        // 允许开发者通过配置纠正app-plus、app平台配置
        const config = this._getAppConfig(this.config, appid);
        if (config && (platform === 'app' || platform === 'app-plus')) {
          if (config.preferedAppPlatform) {
            if (config.preferedAppPlatform !== 'app' && config.preferedAppPlatform !== 'app-plus') {
              throw new Error('invalid preferedAppPlatform value in config')
            }
            realContext.PLATFORM = config.preferedAppPlatform;
          }
          // 校验用户配置和platform不匹配的情况，包括未配置preferedAppPlatform的场景
          if (
            (realContext.PLATFORM === 'app' && config['app-plus']) ||
            (realContext.PLATFORM === 'app-plus' && config.app)) {
            throw new Error(`Client platform is ${realContext.PLATFORM}, but ${realContext.PLATFORM === 'app' ? 'app-plus' : 'app'} was found in config. Please refer to: https://uniapp.dcloud.net.cn/uniCloud/uni-id?id=prefered-app-platform`)
          }
        }
        return realContext
      }
    });
    // keys: customToken
    this.interceptorMap = new Map();
    if (pluginConfig && pluginConfig.hasFile('custom-token.js')) {
      this.setInterceptor('customToken', require(pluginConfig.resolve('custom-token.js')));
    }
    let i18nMessage = messages;
    if (pluginConfig && pluginConfig.hasFile('lang/index.js')) {
      const langInConfig = pluginConfig.requireFile('lang/index.js');
      i18nMessage = lodash_merge(messages, langInConfig);
    }
    let i18n;
    if (uniCloud.initI18n) {
      i18n = uniCloud.initI18n({
        locale: 'en',
        fallbackLocale: 'zh-Hans',
        messages: i18nMessage
      });
    } else {
      throw new Error('The HBuilderX you are using is too old, please upgrade to the latest version of HBuilderX')
    }
    Object.defineProperty(this, 't', {
      get () {
        i18n.setLocale(this.context.LOCALE || 'zh-Hans');
        return i18n.t.bind(i18n)
      }
    });
  }

  get dev () {
    console.warn(this.t('dev-warning'));
    return {
      getConfig: this._getConfig.bind(this)
    }
  }

  _getAppConfig (config, appid) {
    if (!Array.isArray(config)) {
      return config
    }
    return config.find(item => item.dcloudAppid === appid) || config.find(item => item.isDefaultConfig)
  }

  /**
   * 获取config.json的内容
   * @returns {Object|Array}
   */
  _getConfigContent () {
    // 使用uni-config-center
    // 此处if条件务必判断config.json存在，用户可能通过其他方式传递config
    if (this.pluginConfig && this.pluginConfig.hasFile('config.json')) {
      let configContent;
      try {
        configContent = this.pluginConfig.config();
      } catch (error) {
        throw new Error(this.t('config-file-invalid') + '\n' + error.messages)
      }
      // require [1,2] => {0:1,1:2}
      if (Array.isArray(configContent)) {
        return configContent
      }
      return configContent[0] ? Object.values(configContent) : configContent
    }
  }

  init () {
    throw new Error('uniID.init has been deprecated, use uniID.createInstance instead')
  }

  setInterceptor (timing, handler) {
    this.interceptorMap.set(timing, handler);
  }

  _getConfig ({
    appid,
    platform
  } = {}) {
    appid = appid || this.context.APPID;
    platform = platform || this.context.PLATFORM;
    const configCacheKey = `${appid}_${platform}`;
    if (this._configCache[configCacheKey]) {
      return this._configCache[configCacheKey]
    }
    // 每次都获取最新配置，不要修改此处逻辑
    const hasConfig = this.config && Object.keys(this.config).length !== 0;
    if (!hasConfig) {
      throw new Error(this.t('config-file-not-found'))
    }
    const currentAppConfig = this._getAppConfig(this.config);
    const platformConfig = Object.assign(currentAppConfig, currentAppConfig[platform]) || {};
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
        throw new Error(this.t('config-param-required', {
          param: item
        }))
      }
    });
    this._configCache[configCacheKey] = config;
    return config
  }
}

for (const key in methodList) {
  UniID.prototype[key] = methodList[key];
}

// const deprecateMethodList = ['wxBizDataCrypt', 'verifyAppleIdentityToken', 'code2SessionWeixin', 'code2SessionAlipay']

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
          // if (deprecateMethodList.indexOf(prop) > -1) {
          //   console.warn(`uniID.${prop}方法即将废弃，后续版本将不再暴露此方法`)
          // }
          return wrapFn(target[prop]).bind(target)
        } else if (prop === 'context' || prop === 'config') ; else {
          return target[prop]
        }
      }
    }
  });
  return uniID
}

UniID.prototype.createInstance = createInstance;

var index = createInstance();

module.exports = index;
