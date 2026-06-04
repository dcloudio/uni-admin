const fs = require('fs')
// const stream = require("stream")
const config = require('../../common/config')

module.exports = async function (params) {
  const {url = '', id, provider = ''} = params
  const cloudInfo = uniCloud.getCloudInfos()[0]
  const isAliyun = cloudInfo.provider === 'aliyun'
  const imageLibraryProviders = config.imageLibraryProviders || []
  const providerConfig = imageLibraryProviders.find(item => item.provider === provider)

  let imageDetail = {
    fileType: 'jpeg'
  }

  if (id && providerConfig) {
    const entry = require(providerConfig.entryFilePath)
    try {
      const detail = await entry.detail({
        id
      }, providerConfig.options)
      imageDetail = Object.assign(imageDetail, detail)
    } catch (e) {
      return {
        errCode: 500,
        errMsg: e.message
      }
    }
  }

  const response = await uniCloud.httpclient.request(url, {
    streaming: !isAliyun,
    timeout: 600000
  })

  if (response.status !== 200) {
    return {
      errCode: response.status,
      errMsg: '上传失败'
    }
  }

  // 未获取到文件大小时，尝试从响应头中获取
  if (!imageDetail.size && response.headers['content-length']) {
    imageDetail.size = Number(response.headers['content-length'])
  }

  const res = await uniCloud.uploadFile({
    cloudPath: `uni-media-library/${Date.now()}.${imageDetail.fileType}`,
    fileContent: isAliyun ? response.data: response.res
  })

  return {
    errCode: 0,
    data: {
      fileID: res.fileID,
      detail: imageDetail
    }
  }
}
