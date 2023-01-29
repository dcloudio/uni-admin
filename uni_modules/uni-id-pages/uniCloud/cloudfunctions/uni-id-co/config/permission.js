// 各接口权限配置，未配置接口表示允许任何用户访问（包括未登录用户）
module.exports = {
  // 管理接口
  addUser: {
    // auth: true // 已登录用户方可操作，配置角色或权限时此项可不写
    role: ['admin'] // 允许进行此操作的角色，包含任一角色均可操作。
    // permission: [] // 允许进行此操作的权限，包含任一权限均可操作。
    // 权限角色均配置时，用户拥有任一权限或任一角色均可操作
  },
  updateUser: {
    role: ['admin']
  },
  authorizeAppLogin: {
    role: ['admin']
  },
  removeAuthorizedApp: {
    role: ['admin']
  },
  setAuthorizedApp: {
    role: ['admin']
  },

  // 用户接口
  closeAccount: {
    auth: true
  },
  updatePwd: {
    auth: true
  },
  logout: {
    auth: true
  },
  bindMobileBySms: {
    auth: true
  },
  bindMobileByUniverify: {
    auth: true
  },
  bindMobileByMpWeixin: {
    auth: true
  },
  bindAlipay: {
    auth: true
  },
  bindApple: {
    auth: true
  },
  bindQQ: {
    auth: true
  },
  bindWeixin: {
    auth: true
  },
  acceptInvite: {
    auth: true
  },
  getInvitedUser: {
    auth: true
  },
  setPushCid: {
    auth: true
  },
  getAccountInfo: {
    auth: true
  },
  unbindWeixin: {
    auth: true
  },
  unbindAlipay: {
    auth: true
  },
  unbindQQ: {
    auth: true
  },
  unbindApple: {
    auth: true
  },
  setPwd: {
    auth: true
  }
}
