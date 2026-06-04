const db = uniCloud.database()

module.exports = async function ({ tagId }) {
  if (!tagId) {
    return { errCode: 'TAG_ID_EMPTY', errMsg: '标签ID不能为空' }
  }

  // 从所有关联媒体的 tags 数组中移除该 tagId
  await db.collection('uni-media-library').where({
    tags: db.command.in([tagId])
  }).update({
    tags: db.command.pull(tagId)
  })

  // 删除标签文档
  await db.collection('uni-media-tags').doc(tagId).remove()

  return { errCode: 0 }
}
