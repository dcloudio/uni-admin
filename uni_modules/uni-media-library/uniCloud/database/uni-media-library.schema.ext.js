const createConfig = safeRequire('uni-config-center')
const config = createConfig({
  pluginId: 'uni-media-library'
}).config()

const coverCropRule = {
  aliyun: {
    listCover: 'x-oss-process=image/auto-orient,1/resize,m_fill,w_150,h_150/quality,q_80',
    detailCover: 'x-oss-process=image/auto-orient,1/resize,m_fill,w_300,h_180/quality,q_80'
  },
  tencent: {
    listCover: 'imageMogr2/thumbnail/!150x150r/quality/80',
    detailCover: 'imageMogr2/thumbnail/!300x180r/quality/80',
  },
  qiniu: {
    listCover: 'imageView2/1/w/150/h/150/format/webp',
    detailCover: 'imageView2/1/w/300/h/180/format/webp'
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
  if (/^qiniu:\/\//.test(url)) {
    return coverCropRule.qiniu
  }

  if (/^cloud:\/\/env-/.test(url)) {
    return coverCropRule.aliyun
  }

  if (/^cloud:\/\//.test(url)) {
    return coverCropRule.tencent
  }

  return coverCropRule.aliyun
}

function getThumbRules (assetsUrl) {
  const cropMediaAssetsConfig = config.cropMediaAssets || false

  if (!cropMediaAssetsConfig) return {}

  return getImageCropRule(assetsUrl)
}
function cropImage (result) {
  if (result && result.data && result.data.length > 0) {
    result.data.forEach(item => {
      item.thumbRules = {}

      if (item.type === 'video') {
        item.thumbRules = getThumbRules(item.cover)
      } else {
        item.thumbRules = getThumbRules(item.src)
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
        throw new Error("媒体资源应用缩略图规则失败，查看云函数日志获取详细错误")
      }
    }
  }
}
