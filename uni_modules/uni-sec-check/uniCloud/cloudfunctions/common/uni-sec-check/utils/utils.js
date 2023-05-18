const hasOwnProperty = Object.prototype.hasOwnProperty

function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key)
}

const extension2Type = {
  image: 'image/*',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
}

function getMimeType(extension) {
  return extension2Type[extension.toLowerCase()]
}

function getExtension(mimeType) {
  return Object.keys(extension2Type).find(extension => extension2Type[extension] === mimeType)
}

function getFilename(path) {
  return path.replace(/\\/g, '/').split('/').pop()
}

module.exports = {
  getMimeType,
  getExtension,
  getFilename,
  hasOwn
}
