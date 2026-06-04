const fs = require('fs')
const path = require('path')
const safeRequire = require('./safe-require')
const createConfig = safeRequire('uni-config-center')
const shareConfig = createConfig({
  pluginId: 'uni-media-library'
})
const config = shareConfig.config()

const internalImageLibrary = [
  {
    provider: "unsplash",
    name: "Unsplash",
    website: 'https://unsplash.com',
    requiredFields: ["appId", "accessKey", 'secretKey'],
  }, {
    provider: "giphy",
    name: "Giphy",
    website: 'https://giphy.com',
    requiredFields: ["apiKey"],
  }, {
    provider: "pexels",
    name: "Pexels",
    website: 'https://www.pexels.com',
    requiredFields: ["apiKey"],
  }
]


function getProviders() {
  const imageLibraryProviders = []
  const internalLibraryProviders = internalImageLibrary.map(item => item.provider)
  const imageLibraryProvidersConfig = config.imageLibraryProviders || {}

  for (const provider of internalLibraryProviders) {
    const library = internalImageLibrary.find(item => item.provider === provider)
    const libraryConfig = imageLibraryProvidersConfig[provider]

    if (!libraryConfig) continue

    if (
      provider.requiredFields &&
      provider.requiredFields.some(field => !libraryConfig[field])
    ) {
      console.warn(`The provider "${provider}" requires the following fields: ${provider.requiredFields.join(', ')}`)
      continue
    }

    imageLibraryProviders.push({
      provider: library.provider,
      name: library.name,
      website: library.website,
      internal: true,
      entryFilePath: path.resolve(__dirname, '../internal-image-library', provider, 'index.js'),
      options: libraryConfig
    })
  }

  if (imageLibraryProvidersConfig.others && imageLibraryProvidersConfig.others.length) {
    for (const library of imageLibraryProvidersConfig.others) {
      if (internalLibraryProviders.includes(library.provider)) {
        console.warn(`The provider "${library.provider}" is an internal provider, please do not use it in "imageLibraryProvidersConfig.others"`)
        continue
      }

      const entryFilePath = shareConfig.resolve(`image-library/${library.provider}/index.js`)
      if (!fs.existsSync(entryFilePath)) {
        console.warn('The provider entry file does not exist: ' + entryFilePath)
        continue
      }

      imageLibraryProviders.push({
        provider: library.provider,
        name: library.name,
        website: library.website,
        internal: false,
        entryFilePath: entryFilePath,
        options: library.options
      })
    }
  }

  return imageLibraryProviders
}

module.exports = {
  ...config,
  imageLibraryProviders: getProviders(),
  getExtStorageManager() {
    if (!this._extStorageManager) {
      const extConfig = config.extStorage || {}

      if (typeof uniCloud.getExtStorageManager !== 'function') {
        throw new Error('uni-cloud-ext-storage 扩展库未引入，请在云对象中关联此扩展库')
      }

      if (extConfig.provider !== 'qiniu') {
        throw new Error('扩展存储未配置 provider，请在 uni-media-library/config.json 中配置 extStorage.provider，当前仅支持 qiniu')

      }
      if (!extConfig.domain) {
        throw new Error('扩展存储未配置 domain，请在 uni-media-library/config.json 中配置 extStorage.domain')
      }

      this._extStorageManager = uniCloud.getExtStorageManager(extConfig)
    }
    return this._extStorageManager
  },
  hasExtStorage() {
    try {
      this.getExtStorageManager()
      return {
        exists: true
      }
    } catch (e) {
      return {
        exists: false,
        message: e.message
      }
    }
  }
}
