const config = require('../common/config')

module.exports = async function (params) {
  const { fileList = [] } = params
  const extStorageManager = config.getExtStorageManager()
  const result = await extStorageManager.getTempFileURL({ fileList })

  if (result.fileList && result.fileList.length > 0) {
    result.fileList.forEach(file => {
      file.tempFileURL = file.tempFileURL.split('?')[0]
    })
  }

  return {
    errCode: 0,
    data: result
  }
}
