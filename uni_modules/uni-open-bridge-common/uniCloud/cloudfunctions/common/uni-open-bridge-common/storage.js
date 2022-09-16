'use strict';

const {
  Validator
} = require('./validator.js')

const {
  CacheKeyCascade
} = require('./uni-cloud-cache.js')

class Storage {

  constructor(type, keys) {
    this._type = type || null
    this._keys = keys || []
  }

  async get(key, fallback) {
    this.validateKey(key)
    const result = await this.create(key, fallback).get()
    return result.value
  }

  async set(key, value, expiresIn) {
    this.validateKey(key)
    this.validateValue(value)
    const expires_in = this.getExpiresIn(expiresIn)
    if (expires_in !== 0) {
      await this.create(key).set(this.getValue(value), expires_in)
    }
  }

  async remove(key) {
    this.validateKey(key)
    await this.create(key).remove()
  }

  async ttl(key) {
    this.validateKey(key)
    // 后续考虑支持
  }

  getKeyString(key) {
    const keyArray = [Storage.Prefix]
    this._keys.forEach((name) => {
      keyArray.push(key[name])
    })
    keyArray.push(this._type)
    return keyArray.join(':')
  }

  getValue(value) {
    return value
  }

  getExpiresIn(value) {
    if (value !== undefined) {
      return value
    }
    return -1
  }

  validateKey(key) {
    Validator.Key(this._keys, key)
  }

  validateValue(value) {
    Validator.Value(value)
  }

  create(key, fallback) {
    const keyString = this.getKeyString(key)
    const options = {
      layers: [{
        type: 'database',
        key: keyString
      }, {
        type: 'redis',
        key: keyString
      }]
    }
    if (fallback !== null) {
      const fallbackFunction = fallback || this.fallback
      if (fallbackFunction) {
        options.fallback = async () => {
          return await fallbackFunction(key)
        }
      }
    }
    return new CacheKeyCascade(options)
  }
}
Storage.Prefix = "uni-id"

const Factory = {

  async Get(T, key, fallback) {
    return await Factory.MakeUnique(T).get(key, fallback)
  },

  async Set(T, key, value, expiresIn) {
    await Factory.MakeUnique(T).set(key, value, expiresIn)
  },

  async Remove(T, key) {
    await Factory.MakeUnique(T).remove(key)
  },

  MakeUnique(T) {
    return new T()
  }
}

module.exports = {
  Storage,
  Factory
};
