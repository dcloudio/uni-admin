// 运行错误日志
const BaseMod = require('./base')
module.exports = class RunErrors extends BaseMod {
  constructor () {
    super()
    this.tableName = 'run-errors'
  }

  async create (params) {
    if (!params) return
    const res = await this.insert(this.tableName, params)
    return res
  }
}
