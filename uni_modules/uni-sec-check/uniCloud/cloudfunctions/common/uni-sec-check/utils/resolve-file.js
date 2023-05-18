const {
  getMimeType,
  getExtension,
  getFilename,
} = require('./utils')

async function resolveFilePath(file) {
  const filename = getFilename(file)
  const extension = filename.split('.').pop()
  const contentType = getMimeType(extension)
  if (!extension) {
    throw new Error(`不支持的文件类型：${extension}`)
  }
  return new Promise((resolve, reject) => {
    require('fs').readFile(file, (err, buffer) => {
      if (err) {
        reject(err)
        return
      }
      resolve({
        buffer,
        contentType,
        filename
      })
    })
  })
}

async function resolveFileUrl(file) {
  const res = await uniCloud.httpclient.request(file)
  const contentType = res.headers['content-type'].split(';')[0]
  const buffer = res.data
  const extension = getExtension(contentType)
  if (!extension) {
    throw new Error('不支持的文件mime type：contentType')
  }
  const filename = Date.now() + '.' + extension
  return {
    buffer,
    contentType,
    filename
  }
}

async function resolveFileId(file) {
  const filename = getFilename(file)
  const extension = filename.split('.').pop()
  const contentType = getMimeType(extension)
  if (!extension) {
    throw new Error(`不支持的文件类型：${extension}`)
  }
  const {
    fileContent: buffer
  } = await uniCloud.downloadFile({
    fileID: file
  })
  return {
    buffer,
    contentType,
    filename
  }
}

async function resolveFile(file) {
  // 可以接收绝对路径、http://、cloudFileId
  let fileType = 'path'
  if (/^(?:https?:)/.test(file)) {
    fileType = 'url'
  } else if (/^cloud:/.test(file)) {
    fileType = 'id'
  }
  switch (fileType) {
    case 'path':
      return resolveFilePath(file)
    case 'url':
      return resolveFileUrl(file)
    case 'id':
      return resolveFileId(file)
    default:
      break;
  }
}

module.exports = {
  resolveFile
}
