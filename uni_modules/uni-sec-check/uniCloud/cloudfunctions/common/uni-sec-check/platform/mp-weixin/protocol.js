const {
  hasOwn,
  ErrorCode
} = require('../../utils/index')

const errCodeMap = {
  '-1': ErrorCode.SYSTEM_ERROR,
  87014: ErrorCode.RISK_CONTENT,
  40001: ErrorCode.INVALID_APPSECRET,
  40004: ErrorCode.INVALID_MEDIA_TYPE,
  40005: ErrorCode.INVALID_FILE_TYPE,
  40006: ErrorCode.INVALID_MEDIA_SIZE,
  40009: ErrorCode.INVALID_IMAGE_SIZE,
  40010: ErrorCode.INVALID_AUDIO_SIZE,
  40011: ErrorCode.INVALID_VIDEO_SIZE,
  40013: ErrorCode.INVALID_APPID,
  40014: ErrorCode.INVALID_ACCESS_TOKEN,
  40033: ErrorCode.INVALID_REQUEST_URL,
  40035: ErrorCode.INVALID_REQUEST_PARAM,
  40038: ErrorCode.INVALID_REQUEST_FORMAT,
  41011: ErrorCode.PARAM_REQUIRED,
  42001: ErrorCode.ACCESS_TOKEN_EXPIRED,
  44001: ErrorCode.EMPTY_MEDIA,
  44002: ErrorCode.EMPTY_BODY,
  44003: ErrorCode.EMPTY_IMAGE,
  44004: ErrorCode.EMPTY_CONTENT,
  45009: ErrorCode.INVOKE_OUT_OF_LIMIT
}

const labels = {
  100: '正常',
  10001: '广告',
  20001: '时政',
  20002: '色情',
  20003: '辱骂',
  20006: '违法犯罪',
  20008: '欺诈',
  20012: '低俗',
  20013: '版权',
  21000: '其他'
}

function parseErrCode(returnValue) {
  if (returnValue.errCode === 0) {
    return
  }
  returnValue.errMsg += ` errCode: ${returnValue.errCode}`
  if (hasOwn(errCodeMap, returnValue.errCode)) {
    returnValue.errCode = errCodeMap[returnValue.errCode]
  } else {
    returnValue.errCode = `uni-sec-check-mp-weixin-${returnValue.errCode}`
  }
}

function filterValue (returnValue) {
  delete returnValue.detail
  if (returnValue.result) {
    returnValue.result = {
      suggest: returnValue.result.suggest,
      label: labels[returnValue.result.label] || '未知'
    }
    if (returnValue.result.suggest !== 'pass') {
      returnValue.errCode = ErrorCode.RISK_CONTENT
    }
  }
}

module.exports = {
  imgSecCheck: {
    returnValue: (returnValue) => {
      parseErrCode(returnValue)
      filterValue(returnValue)

      return returnValue
    }
  },
  mediaSecCheck: {
    returnValue: (returnValue) => {
      parseErrCode(returnValue)
      filterValue(returnValue)

      return returnValue
    }
  },
  textSecCheck: {
    returnValue: (returnValue) => {
      parseErrCode(returnValue)
      filterValue(returnValue)

      return returnValue
    }
  }
}
