const {
  findUser
} = require('./account')
const {
  ERROR
} = require('../../common/error')
const {
  userCollection
} = require('../../common/constants')

/**
 *
 * @param {object} param
 * @param {string} param.uid 用户id
 * @param {string} param.bindAccount 要绑定的三方账户、手机号或邮箱
 */
async function preBind ({
  uid,
  bindAccount,
  logType
} = {}) {
  const userMatched = await findUser({
    userQuery: bindAccount,
    authorizedApp: this.getClientInfo().appId
  })
  if (userMatched.length > 0) {
    await this.middleware.uniIdLog({
      data: {
        user_id: uid
      },
      type: logType,
      success: false
    })
    throw {
      errCode: ERROR.BIND_CONFLICT
    }
  }
}

async function postBind ({
  uid,
  extraData = {},
  bindAccount,
  logType
} = {}) {
  await userCollection.doc(uid).update({
    ...bindAccount,
    ...extraData
  })
  await this.middleware.uniIdLog({
    data: {
      user_id: uid
    },
    type: logType
  })
  return {
    errCode: 0
  }
}

module.exports = {
  preBind,
  postBind
}
