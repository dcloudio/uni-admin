const {
  userCollection
} = require('../../common/constants')
const {
  ERROR
} = require('../../common/error')

function getQQPlatform () {
  const platform = this.clientPlatform
  switch (platform) {
    case 'app':
    case 'app-plus':
      return 'app'
    case 'mp-qq':
      return 'mp'
    default:
      throw new Error('Unsupported qq platform')
  }
}

function generateQQCache ({
  sessionKey, // QQ小程序用户sessionKey
  accessToken, // App端QQ用户accessToken
  accessTokenExpired // App端QQ用户accessToken过期时间
} = {}) {
  const platform = getQQPlatform.call(this)
  let cache
  switch (platform) {
    case 'app':
      cache = {
        access_token: accessToken,
        access_token_expired: accessTokenExpired
      }
      break
    case 'mp':
      cache = {
        session_key: sessionKey
      }
      break
    default:
      throw new Error('Unsupported qq platform')
  }
  return {
    third_party: {
      [`${platform}_qq`]: cache
    }
  }
}

async function getQQCache ({
  uid,
  userRecord,
  key
} = {}) {
  const platform = getQQPlatform.call(this)
  if (!userRecord) {
    const getUserRes = await userCollection.doc(uid).get()
    userRecord = getUserRes.data[0]
  }
  if (!userRecord) {
    throw {
      errCode: ERROR.ACCOUNT_NOT_EXISTS
    }
  }
  return userRecord &&
    userRecord.third_party &&
    userRecord.third_party[`${platform}_qq`] &&
    userRecord.third_party[`${platform}_qq`][key]
}

module.exports = {
  getQQPlatform,
  generateQQCache,
  getQQCache
}
