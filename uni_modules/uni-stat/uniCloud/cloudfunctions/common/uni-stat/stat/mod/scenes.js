// 场景值
const BaseMod = require('./base')
const Platform = require('./platform')
module.exports = class Scenes extends BaseMod {
  constructor () {
    super()
    this.tableName = 'mp-scenes'
  }

  async getScenes (platform, code) {
    const cacheKey = 'uni-stat-scenes-' + platform + '-' + code
    let scenesData = await this.getCache(cacheKey)
    if (!scenesData) {
      const scenesInfo = await this.getCollection(this.tableName).where({
        platform: platform,
        scene_code: code
      }).limit(1).get()
      scenesData = []
      if (scenesInfo.data.length > 0) {
        scenesData = scenesInfo.data[0]
        await this.setCache(cacheKey, scenesData)
      }
    }
    return scenesData
  }

  async getScenesByPlatformId (platformId, code) {
    const platform = new Platform()
    let platformInfo = await this.getCollection(platform.tableName).where({
      _id: platformId
    }).limit(1).get()
    let scenesData
    if (platformInfo.data.length > 0) {
      platformInfo = platformInfo.data[0]
      scenesData = await this.getScenes(platformInfo.code, code)
    } else {
      scenesData = []
    }
    return scenesData
  }

  async getScenesName (platform, code) {
    const scenesData = await this.getScenes(platform, code)
    if (scenesData.length === 0) {
      return ''
    }
    return scenesData.scene_name
  }

  async getScenesNameByPlatformId (platformId, code) {
    const scenesData = await this.getScenesByPlatformId(platformId, code)
    if (scenesData.length === 0) {
      return ''
    }
    return scenesData.scene_name
  }
}