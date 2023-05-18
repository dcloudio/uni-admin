const db = uniCloud.database()
class Cache {
  constructor({
    type = 'db',
    collection = "opendb-cloud-cache"
  } = {}) {
    this.type = type
    this.collection = collection
  }

  async set(key, value, expired) {
    if (typeof key !== 'string' || !key) {
      return
    };
    !expired && (expired = 0)
    await db.collection(this.collection).doc(key).set({
      value,
      expired
    })
  }

  async get(key) {
    const res = await db.collection(this.collection).doc(key).get()
    const cache = res.data[0] || {
      key,
      value: undefined,
      expired: -1
    }
    return cache
    // 永不过期时expired需设置为0
    // if (cache.expired && cache.expired < Date.now()) {
    //   return
    // }
    // return value
  }

  async remove(key) {
    await db.collection(this.collection).doc(key).remove()
  }
}

module.exports = {
  Cache
}
