const {
  db,
  dbCmd,
  userCollection
} = require('../../common/constants')
const {
  USER_IDENTIFIER
} = require('../../common/constants')
const {
  batchFindObjctValue,
  getType
} = require('../../common/utils')

/**
 * 查询满足条件的用户
 * @param {Object} params
 * @param {Object} params.userQuery 用户唯一标识组成的查询条件
 * @param {Object} params.authorizedApp 用户允许登录的应用
 * @returns userMatched 满足条件的用户列表
 */
async function findUser (params = {}) {
  const {
    userQuery,
    authorizedApp = []
  } = params
  const condition = getUserQueryCondition(userQuery)
  if (condition.length === 0) {
    throw new Error('Invalid user query')
  }
  const authorizedAppType = getType(authorizedApp)
  let appQuery = null
  if (authorizedAppType === 'string') {
    // 传入authorizedApp为单个appId时
    appQuery = dbCmd.or(
      {
        dcloud_appid: authorizedApp
      },
      {
        dcloud_appid: dbCmd.exists(false)
      }
    )
  } else if (authorizedAppType === 'array') {
    if (authorizedApp.length === 0) {
      // 传入空数组表示希望获取不能登录任一客户端的用户
      appQuery = {
        dcloud_appid: []
      }
    } else if (authorizedApp.length === 1) {
      appQuery = dbCmd.or(
        {
          dcloud_appid: authorizedApp[0]
        },
        {
          dcloud_appid: dbCmd.exists(false)
        }
      )
    } else {
      appQuery = dbCmd.or(
        {
          dcloud_appid: db.command.in(authorizedApp)
        },
        {
          dcloud_appid: dbCmd.exists(false)
        }
      )
    }
  } else {
    throw new Error('Invalid authorized app')
  }

  let finalQuery

  if (condition.length === 1) {
    finalQuery = dbCmd.and(condition[0], appQuery)
  } else {
    finalQuery = dbCmd.and(
      dbCmd.or(condition),
      appQuery
    )
  }
  const userQueryRes = await userCollection.where(finalQuery).get()
  return userQueryRes.data
}

function getUserIdentifier (userRecord = {}) {
  const keys = Object.keys(USER_IDENTIFIER)
  return batchFindObjctValue(userRecord, keys)
}

function getUserQueryCondition (userRecord = {}) {
  const userIdentifier = getUserIdentifier(userRecord)
  const condition = []
  for (const key in userIdentifier) {
    const value = userIdentifier[key]
    if (!value) {
      // 过滤所有value为假值的条件，在查询用户时没有意义
      continue
    }
    const queryItem = {
      [key]: value
    }
    // 为兼容用户老数据用户名及邮箱需要同时查小写及原始大小写数据
    if (key === 'mobile') {
      queryItem.mobile_confirmed = 1
    } else if (key === 'email') {
      queryItem.email_confirmed = 1
      const email = userIdentifier.email
      if (email.toLowerCase() !== email) {
        condition.push({
          email: email.toLowerCase(),
          email_confirmed: 1
        })
      }
    } else if (key === 'username') {
      const username = userIdentifier.username
      if (username.toLowerCase() !== username) {
        condition.push({
          username: username.toLowerCase()
        })
      }
    }
    condition.push(queryItem)
  }
  return condition
}

module.exports = {
  findUser,
  getUserIdentifier
}
