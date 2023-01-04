const { preLogin, postLogin } = require('../../lib/utils/login')

module.exports = async function (params = {}) {
  const schema = {
    unieid: 'username'
  }

  this.middleware.validate(params, schema)

  const {
    unieid
  } = params

  const user = await preLogin.call(this, {
    user: {
      username: unieid
    }
  })

  const result = await postLogin.call(this, {
    user
  })

  return {
    errCode: result.errCode,
    newToken: result.newToken,
    unieid
  }
}
