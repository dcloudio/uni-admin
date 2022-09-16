'use strict';

const TAG = "UNI_OPEN_BRIDGE"

const HTTP_STATUS = {
  SUCCESS: 200
}

const PlatformType = {
  WEIXIN_MP: 'weixin-mp',
  WEIXIN_H5: 'weixin-h5',
  WEIXIN_APP: 'weixin-app',
  WEIXIN_WEB: 'weixin-web',
  QQ_MP: 'qq-mp',
  QQ_APP: 'qq-app'
}

const ErrorCodeType = {
  SYSTEM_ERROR: TAG + "_SYSTEM_ERROR"
}

module.exports = {
  HTTP_STATUS,
  PlatformType,
  ErrorCodeType
}
