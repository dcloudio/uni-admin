async function deleteMedia (params) {
  const {mediaIds = []} = params
  const db = uniCloud.database()

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

  const mediaFileIds = mediaList.data.filter(item => item.src).map(item => item.src)
  const coverFileIds = mediaList.data.filter(item => item.type === 'video' && item.cover).map(item => item.cover)

  try {
    await Promise.all([
      // 删除云数据库中的记录
      db.collection('uni-media-library').where({
        _id: db.command.in(mediaIds)
      }).remove(),
      // 删除云存储中的文件
      mediaFileIds.length && uniCloud.deleteFile({
        fileList: mediaFileIds
      }),
      // 删除云存储中的文件
      coverFileIds.length && uniCloud.deleteFile({
        fileList: coverFileIds
      })
    ])
  } catch (e) {
    console.log('删除云存储图片失败', e)
  }

  return {
    errCode: 0
  }
}

module.exports = deleteMedia
