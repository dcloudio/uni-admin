const db = uniCloud.database()
const $ = db.command.aggregate

module.exports = async function () {
  // 优化聚合查询：先过滤无标签文档，再展开计数
  const countRes = await db.collection('uni-media-library')
    .aggregate()
    .match({
      tags: db.command.not(db.command.eq(null)).and(db.command.exists(true))
    })
    .project({
      tags: 1
    })
    .unwind('$tags')
    .group({
      _id: '$tags',
      count: $.sum(1)
    })
    .end()

  // 构建计数映射
  const countMap = {}
  if (countRes.data) {
    for (const item of countRes.data) {
      countMap[item._id] = item.count
    }
  }

  // 获取所有标签
  const tagsRes = await db.collection('uni-media-tags').orderBy('createDate', 'desc').get()
  const tags = tagsRes.data || []

  // 返回带数量的标签列表
  const result = tags.map(tag => ({
    ...tag,
    count: countMap[tag._id] || 0
  }))

  return { errCode: 0, data: result }
}
