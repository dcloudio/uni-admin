const { preRegister, postRegister } = require('../../lib/utils/register')

module.exports = async function (params = {}) {
  const schema = {
    unieid: 'username',
    nickname: {
      required: false,
      type: 'nickname'
    },
    gender: {
      required: false,
      type: 'number'
    },
    avatar: {
      required: false,
      type: 'string'
    }
  }

  this.middleware.validate(params, schema)

  const {
    unieid,
    avatar,
    gender,
    nickname
  } = params

  await preRegister.call(this, {
    user: {
      username: unieid
    }
  })

  const result = await postRegister.call(this, {
    user: {
      username: unieid,
      avatar,
      gender,
      nickname
    }
  })

  return {
    errCode: result.errCode,
    newToken: result.newToken,
    unieid,
    avatar,
    gender,
    nickname
  }
}
