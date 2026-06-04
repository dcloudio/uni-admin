const config = require('../../common/config')

module.exports = async function (params) {
  const {keyword = '', page = 1, pageSize = 20, provider = ''} = params
  const imageLibraryProviders = config.imageLibraryProviders || []
  const providerConfig = imageLibraryProviders.find(item => item.provider === provider)

  if (!providerConfig) {
    return {
      errCode: 400,
      errMsg: `Provider ${provider} is not found`
    }
  }

  const entry = require(providerConfig.entryFilePath)

  try {
    const res = await entry.search({
      keyword,
      page,
      pageSize
    }, providerConfig.options)
    return {
      errCode: 0,
      data: res
    }
  } catch (e) {
    return {
      errCode: 500,
      errMsg: e.message
    }
  }
}
