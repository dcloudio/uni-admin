// 应用
const BaseMod = require('./base')
module.exports = class App extends BaseMod {
  constructor () {
    super()
	this.tablePrefix = false
    this.tableName = 'opendb-app-list'
  }

  // 获取应用信息
  async getAppByAppid (appId) {
    const appInfo = await this.getCollection(this.tableName, false).where({
      appid: appId
    }).limit(1).get()

    return appInfo.data.length > 0 ? appInfo.data[0] : []
  }

  // 获取应用_id
  async getAppIdByAppid (appId) {
    const app = await this.getAppByAppid(appId)
    return app.length > 0 ? app._id : ''
  }
}