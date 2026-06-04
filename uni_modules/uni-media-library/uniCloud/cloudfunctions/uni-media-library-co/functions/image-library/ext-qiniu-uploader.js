const config = require('../../common/config')

module.exports = async function (params) {
  const { url = '', id, provider = '' } = params
  const imageLibraryProviders = config.imageLibraryProviders || []
  const providerConfig = imageLibraryProviders.find(item => item.provider === provider)

  let imageDetail = {
    fileType: 'jpeg'
  }

  if (id && providerConfig) {
    const entry = require(providerConfig.entryFilePath)
    try {
      const detail = await entry.detail({ id }, providerConfig.options)
      imageDetail = Object.assign(imageDetail, detail)
    } catch (e) {
      return {
        errCode: 500,
        errMsg: e.message
      }
    }
  }

  const response = await uniCloud.request({
    url,
    method: 'GET',
    responseType: 'buffer',
    timeout: 600000,
    header: {
      'cache-control': 'no-cache'
    }
  })

  if (response.statusCode !== 200) {
    return {
      errCode: response.statusCode,
      errMsg: '上传失败'
    }
  }

  if (!response.data || !response.data.length) {
    return {
      errCode: 500,
      errMsg: '下载文件为空'
    }
  }

  const responseHeaders = response.header || response.headers || {}
  const contentLength = responseHeaders['content-length'] || responseHeaders['Content-Length']
  if (!imageDetail.size && contentLength) {
    imageDetail.size = Number(contentLength)
  }

  if (!imageDetail.size) {
    imageDetail.size = response.data.length
  }

  const extStorageManager = config.getExtStorageManager()

  const res = await extStorageManager.uploadFile({
    cloudPath: `uni-media-library/${Date.now()}.${imageDetail.fileType}`,
    fileContent: response.data,
    allowUpdate: false
  })

  return {
    errCode: 0,
    data: {
      fileID: res.fileID,
      detail: imageDetail
    }
  }
}
