const config = require('../common/config')

module.exports = async function (params) {
  const { cloudPath } = params
  const extStorageManager = config.getExtStorageManager()

  const result = extStorageManager.getUploadFileOptions({
    cloudPath,
    allowUpdate: false
  })

  return {
    errCode: 0,
    data: result
  }
}
