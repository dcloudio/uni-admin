const db = uniCloud.database()
const _ = db.command

module.exports = async function ({ mediaId, tagId }) {
  if (!mediaId || !tagId) {
    return { errCode: 'PARAMS_EMPTY', errMsg: '参数不能为空' }
  }

  await db.collection('uni-media-library').doc(mediaId).update({
    tags: _.pull(tagId)
  })

  return { errCode: 0 }
}
