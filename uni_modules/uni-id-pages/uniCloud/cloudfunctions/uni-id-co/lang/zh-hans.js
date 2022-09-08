const word = {
  login: '登录',
  'verify-mobile': '验证手机号'
}

const sentence = {
  'uni-id-account-exists': '此账号已注册',
  'uni-id-account-not-exists': '此账号未注册',
  'uni-id-account-conflict': '用户账号冲突',
  'uni-id-account-banned': '此账号已封禁',
  'uni-id-account-auditing': '此账号正在审核中',
  'uni-id-account-audit-failed': '此账号审核失败',
  'uni-id-account-closed': '此账号已注销',
  'uni-id-captcha-required': '请输入图形验证码',
  'uni-id-password-error': '用户名或密码错误',
  'uni-id-password-error-exceed-limit': '密码错误次数过多，请稍后再试',
  'uni-id-invalid-username': '用户名不合法',
  'uni-id-invalid-password': '密码不合法',
  'uni-id-invalid-mobile': '手机号码不合法',
  'uni-id-invalid-email': '邮箱不合法',
  'uni-id-invalid-nickname': '昵称不合法',
  'uni-id-invalid-param': '参数错误',
  'uni-id-param-required': '缺少参数: {param}',
  'uni-id-get-third-party-account-failed': '获取第三方账号失败',
  'uni-id-get-third-party-user-info-failed': '获取用户信息失败',
  'uni-id-mobile-verify-code-error': '手机验证码错误或已过期',
  'uni-id-email-verify-code-error': '邮箱验证码错误或已过期',
  'uni-id-admin-exists': '超级管理员已存在',
  'uni-id-permission-error': '权限错误',
  'uni-id-system-error': '系统错误',
  'uni-id-set-invite-code-failed': '设置邀请码失败',
  'uni-id-invalid-invite-code': '邀请码不可用',
  'uni-id-change-inviter-forbidden': '禁止修改邀请人',
  'uni-id-bind-conflict': '此账号已被绑定'
}

module.exports = {
  ...word,
  ...sentence
}
