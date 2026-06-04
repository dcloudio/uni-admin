async function deleteMedia (params) {
  const {mediaIds = [], deleteOriginalFile = true} = params
  const db = uniCloud.database()
  const config = require('../common/config')

  if (mediaIds.length <= 0) {
    return {
      errCode: 0
    }
  }

  const mediaList = await db.collection('uni-media-library').where({
    _id: db.command.in(mediaIds)
  }).get()

  if (!mediaList.data || mediaList.data.length <= 0) {
    return {
      errCode: 0
    }
  }

  const mediaFileIds = mediaList.data.filter(item => item.src && (item.storageProvider || 'internal') === 'internal').map(item => item.src)
  const coverFileIds = mediaList.data.filter(item => item.type === 'video' && item.cover && (item.storageProvider || 'internal') === 'internal').map(item => item.cover)

  const qiniuFileIds = mediaList.data.filter(item => item.src && item.storageProvider === 'ext-qiniu').map(item => item.src)
  const qiniuCoverFileIds = mediaList.data.filter(item => item.type === 'video' && item.cover && item.storageProvider === 'ext-qiniu').map(item => item.cover)

  const allQiniuFiles = [...qiniuFileIds, ...qiniuCoverFileIds]

  try {
    const deletions = [
      db.collection('uni-media-library').where({
        _id: db.command.in(mediaIds)
      }).remove()
    ]

    if (deleteOriginalFile && mediaFileIds.length) {
      deletions.push(uniCloud.deleteFile({ fileList: mediaFileIds }))
    }
    if (deleteOriginalFile && coverFileIds.length) {
      deletions.push(uniCloud.deleteFile({ fileList: coverFileIds }))
    }
    if (deleteOriginalFile && allQiniuFiles.length) {
      const extStorageManager = config.getExtStorageManager()
      deletions.push(extStorageManager.deleteFile({ fileList: allQiniuFiles }))
    }

    await Promise.all(deletions)
  } catch (e) {
    console.log('删除云存储图片失败', e)
  }

  return {
    errCode: 0
  }
}

module.exports = deleteMedia
