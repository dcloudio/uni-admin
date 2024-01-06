const createConfig = safeRequire('uni-config-center')
const config = createConfig({
  pluginId: 'uni-media-library'
}).config()

const coverCropRule = {
  aliyun: {
    listCover: '?x-oss-process=image/auto-orient,1/resize,m_fill,w_150,h_150/quality,q_80',
    detailCover: '?x-oss-process=image/auto-orient,1/resize,m_fill,w_300,h_180/quality,q_80'
  },
  tencent: {
    listCover: '?imageMogr2/thumbnail/!150x150r/quality/80',
    detailCover: '?imageMogr2/thumbnail/!300x180r/quality/80',
  }
}

function safeRequire(module) {
  try {
    return require(module)
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      throw new Error(`${module} 公共模块不存在，请在 uniCloud/database 目录右击"配置schema扩展公共模块"添加 ${module} 模块`)
    }
  }
}
function getImageCropRule (url) {
  return /^cloud:\/\//.test(url) ? coverCropRule.tencent : coverCropRule.aliyun
}
function getOssProcessUrls (url) {
  const urls = {}

  if (!url) return urls

  const cropRules = getImageCropRule(url)
  const cropMediaAssetsConfig = config.cropMediaAssets || false

  for (const key in cropRules) {
    // webp 格式不支持缩略图
    if (/.webp/.test(url) || !cropMediaAssetsConfig) {
      urls[key] = url
    } else {
      urls[key] = url + cropRules[key]
    }
  }
  return urls
}
function cropImage (result) {
  if (result && result.data && result.data.length > 0) {
    result.data.forEach(item => {
      item.thumb = {}

      if (item.type === 'video') {
        item.thumb = getOssProcessUrls(item.cover)
      } else {
        item.thumb = getOssProcessUrls(item.src)
      }
    })
  }
}

module.exports = {
  trigger: {
    afterRead: ({result}) => {
      // 处理缩略图
      try {
        cropImage(result)
      } catch (e) {
        console.error(e)
        throw new Error("媒体资源应用缩略图规则失败，请看下云函数日志获取详细错误")
      }
    }
  }
}
