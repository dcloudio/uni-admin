const _toString = Object.prototype.toString

function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]'
}

function isFn(fn) {
  return typeof fn === 'function'
}

module.exports = {
  isPlainObject,
  isFn
}
