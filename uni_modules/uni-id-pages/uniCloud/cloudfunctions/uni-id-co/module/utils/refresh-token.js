/**
 * 刷新token
 * @tutorial https://uniapp.dcloud.net.cn/uniCloud/uni-id-pages.html#refresh-token
 */
module.exports = async function () {
  const {
    token,
    tokenExpired
  } = await this.uniIdCommon.refreshToken({
    token: this.getUniversalUniIdToken()
  })
  return {
    errCode: 0,
    newToken: {
      token,
      tokenExpired
    }
  }
}
