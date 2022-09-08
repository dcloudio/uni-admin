const {
  getType
} = require('../../common/utils')
const crypto = require('crypto')

const PasswordHashMethod = {
  'hmac-sha1': function (content, secret) {
    const hmac = crypto.createHmac('sha1', secret.toString('ascii'))
    hmac.update(content)
    return hmac.digest('hex')
  }
}

class PasswordUtils {
  constructor ({
    passwordSecret
  } = {}) {
    const passwordSecretType = getType(passwordSecret)
    if (passwordSecretType === 'array') {
      this.passwordSecret = passwordSecret.sort((a, b) => {
        return a.version - b.version
      })
    } else if (passwordSecretType === 'string') {
      this.passwordSecret = [{ value: passwordSecret }]
    } else {
      throw new Error('Invalid password secret')
    }
  }

  getSecretByVersion (params = {}) {
    const {
      version
    } = params
    if (!version && version !== 0) {
      return this.getOldestSecret()
    }
    if (this.passwordSecret.length === 1) {
      return this.passwordSecret[0]
    }
    return this.passwordSecret.find(item => item.version === version)
  }

  getLastestSecret () {
    return this.passwordSecret[this.passwordSecret.length - 1]
  }

  getOldestSecret () {
    return this.passwordSecret[0]
  }

  checkUserPassword (params = {}) {
    const {
      password,
      passwordHash: passwordHashToCheck,
      passwordSecretVersion,
      autoRefresh = true
    } = params
    const currentPasswordSecret = this.getSecretByVersion({
      version: passwordSecretVersion
    })
    if (!currentPasswordSecret) {
      throw new Error('Invalid password version')
    }
    const {
      value: passwordSecret
    } = currentPasswordSecret
    const {
      passwordHash
    } = this.generatePasswordHash({
      password,
      passwordSecret,
      passwordSecretVersion
    })
    if (passwordHashToCheck !== passwordHash) {
      return {
        success: false
      }
    }
    let refreshPasswordInfo
    if (autoRefresh && passwordSecretVersion !== this.getLastestSecret().version) {
      refreshPasswordInfo = this.generatePasswordHash({
        password
      })
    }
    return {
      success: true,
      refreshPasswordInfo
    }
  }

  generatePasswordHash (params = {}) {
    let {
      password,
      passwordSecret,
      passwordSecretVersion
    } = params
    if (getType(password) !== 'string') {
      throw new Error('Invalid password')
    }
    password = password && password.trim()
    if (!password) {
      throw new Error('Invalid password')
    }
    if (!passwordSecret) {
      const lastestSecret = this.getLastestSecret()
      passwordSecret = lastestSecret.value
      passwordSecretVersion = lastestSecret.version
    }
    return {
      passwordHash: PasswordHashMethod['hmac-sha1'](password, passwordSecret),
      version: passwordSecretVersion
    }
  }
}

module.exports = PasswordUtils
