const db = uniCloud.database()

async function report (params) {
  const {
    src,
    cover,
    type,
    originalName,
    fileType,
    size,
    resolution = {},
    duration,
    uploadUser,
  } = params

  await db.collection('uni-media-library').add({
    src,
    cover,
    type,
    originalName,
    fileType,
    size,
    resolution,
    duration,
    uploadUser,
    createDate: Date.now()
  })

  return {
    errCode: 0
  }
}

module.exports = report
