const config = require('../../common/config')

async function getProviders() {
  return {
    errCode: 0,
    data: config.imageLibraryProviders.map(item => ({
      provider: item.provider,
      name: item.name,
      website: item.website,
    }))
  }
}

module.exports = getProviders
