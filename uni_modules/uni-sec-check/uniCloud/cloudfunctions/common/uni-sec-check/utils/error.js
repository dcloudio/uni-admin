const ErrorCode = {
  SYSTEM_ERROR: 'system-error',
  RISK_CONTENT: 'risk-content',
  INVALID_APPSECRET: 'invalid-appsecret',
  INVALID_MEDIA_TYPE: 'invalid-media-type',
  INVALID_FILE_TYPE: 'invalid-file-type',
  INVALID_MEDIA_SIZE: 'invalid-media-size',
  INVALID_IMAGE_SIZE: 'invalid-image-size',
  INVALID_AUDIO_SIZE: 'invalid-audio-size',
  INVALID_VIDEO_SIZE: 'invalid-video-size',
  INVALID_APPID: 'invalid-appid',
  INVALID_ACCESS_TOKEN: 'invalid-access-token',
  INVALID_REQUEST_URL: 'invalid-request-url',
  INVALID_REQUEST_PARAM: 'invalid-request-param',
  INVALID_REQUEST_FORMAT: 'invalid-request-format',
  PARAM_REQUIRED: 'param-required',
  ACCESS_TOKEN_EXPIRED: 'access-token-expired',
  EMPTY_MEDIA: 'empty-media',
  EMPTY_BODY: 'empty-body',
  EMPTY_IMAGE: 'empty-image',
  EMPTY_CONTENT: 'empty-content',
  INVOKE_OUT_OF_LIMIT: 'invoke-out-of-limit'
}

const errorCodePrefix = 'uni-sec-check'

for (let key in ErrorCode) {
  ErrorCode[key] = `${errorCodePrefix}-${ErrorCode[key]}`
}


module.exports = {
  ErrorCode
}
