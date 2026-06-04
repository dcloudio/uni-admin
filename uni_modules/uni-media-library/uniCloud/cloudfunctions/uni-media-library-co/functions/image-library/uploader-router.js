module.exports = async function (params) {
  if (params.storageProvider === 'ext-qiniu') {
    return require('./ext-qiniu-uploader')(params)
  }
  return require('./internal-uploader')(params)
}