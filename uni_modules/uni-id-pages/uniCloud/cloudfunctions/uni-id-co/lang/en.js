const word = {
  login: 'login',
  'verify-mobile': 'verify phone number'
}

const sentence = {
  'uni-id-account-exists': 'Account exists',
  'uni-id-account-not-exists': 'Account does not exists',
  'uni-id-account-conflict': 'User account conflict',
  'uni-id-account-banned': 'Account has been banned',
  'uni-id-account-auditing': 'Account audit in progress',
  'uni-id-account-audit-failed': 'Account audit failed',
  'uni-id-account-closed': 'Account has been closed',
  'uni-id-captcha-required': 'Captcha required',
  'uni-id-password-error': 'Username or password error',
  'uni-id-password-error-exceed-limit': 'The number of password errors is excessive',
  'uni-id-invalid-username': 'Invalid username',
  'uni-id-invalid-password': 'invalid password',
  'uni-id-invalid-mobile': 'Invalid mobile phone number',
  'uni-id-invalid-email': 'Invalid email address',
  'uni-id-invalid-nickname': 'Invalid nickname',
  'uni-id-invalid-param': 'Invalid parameter',
  'uni-id-param-required': 'Parameter required: {param}',
  'uni-id-get-third-party-account-failed': 'Get third party account failed',
  'uni-id-get-third-party-user-info-failed': 'Get third party user info failed',
  'uni-id-mobile-verify-code-error': 'Verify code error or expired',
  'uni-id-email-verify-code-error': 'Verify code error or expired',
  'uni-id-admin-exists': 'Administrator exists',
  'uni-id-permission-error': 'Permission denied',
  'uni-id-system-error': 'System error',
  'uni-id-set-invite-code-failed': 'Set invite code failed',
  'uni-id-invalid-invite-code': 'Invalid invite code',
  'uni-id-change-inviter-forbidden': 'Change inviter is not allowed',
  'uni-id-bind-conflict': 'This account has been bound'
}

module.exports = {
  ...word,
  ...sentence
}
