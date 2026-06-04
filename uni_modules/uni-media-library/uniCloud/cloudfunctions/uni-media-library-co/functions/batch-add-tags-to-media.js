const db = uniCloud.database()

module.exports = async function ({ mediaIds = [], tagIds = [] }) {
  mediaIds = Array.from(new Set(mediaIds.filter(Boolean)))
  tagIds = Array.from(new Set(tagIds.filter(Boolean)))

  if (!mediaIds.length || !tagIds.length) {
    return { errCode: 'PARAMS_EMPTY', errMsg: '参数不能为空' }
  }

  const mediaRes = await db.collection('uni-media-library').where({
    _id: db.command.in(mediaIds)
  }).field({
    _id: true,
    tags: true
  }).get()

  const mediaList = mediaRes.data || []
  let addedCount = 0
  const addedTagCounts = {}

  for (const media of mediaList) {
    const oldTags = Array.isArray(media.tags) ? media.tags : []
    const nextTags = Array.from(new Set(oldTags.concat(tagIds)))
    const addedTags = nextTags.filter(tagId => !oldTags.includes(tagId))

    if (!addedTags.length) continue

    await db.collection('uni-media-library').doc(media._id).update({
      tags: nextTags
    })

    addedCount += addedTags.length
    addedTags.forEach(tagId => {
      addedTagCounts[tagId] = (addedTagCounts[tagId] || 0) + 1
    })
  }

  return {
    errCode: 0,
    data: {
      addedCount,
      addedTagCounts
    }
  }
}
