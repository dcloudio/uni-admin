const crypto = require('crypto')
const createConfig = require('uni-config-center')
const config = createConfig({
  pluginId: 'uni-cms'
}).config()

const unlockRecordDBName = 'uni-cms-unlock-record'

exports.main = async function (event) {
  const {trans_id, extra: _extra, sign} = event
  let extra = {}
  try {
    extra = JSON.parse(_extra)
  } catch (e) {}

  if (!config.adConfig || !config.adConfig.securityKey) throw new Error('请先配置adConfig.securityKey')
  if (!extra.article_id) return null

  // 签名验证
  const reSign = crypto.createHash('sha256').update(`${config.adConfig.securityKey}:${trans_id}`).digest('hex')
  if (sign !== reSign) {
    console.log('签名错误', `${config.adConfig.securityKey}:${trans_id}`)
    return null
  }

  const db = uniCloud.database()
  const unlockRecord = await db.collection(unlockRecordDBName).where({
    trans_id
  }).get()

  if (unlockRecord.data.length) {
    console.log('已经解锁过了')
    return null // 已经解锁过了
  }

  await db.collection(unlockRecordDBName).add({
    unique_id: extra.unique_id,
    unique_type: extra.unique_type,
    article_id: extra.article_id,
    trans_id,
    create_date: Date.now()
  })

  console.log('解锁成功')

  return {
    isValid: true
  }
}
