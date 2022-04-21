/**
 * @class App应用模型
 * @function getAppByAppid 通过appid 获取应用信息
 */
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
}