const API_URL = 'https://api.giphy.com/v1'

exports.search = async function (params = {}, config = {}){
  const {keyword, page = 1, pageSize} = params
  const {apiKey} = config

  if (!apiKey) {
    throw new Error('Giphy provider is not enabled')
  }

  if (pageSize > 50) {
    throw new Error('pageSize should not be greater than 50')
  }

  const url = `${API_URL}/gifs/search?api_key=${apiKey}`
  const res = await uniCloud.request({
    url,
    data: {
      q: keyword,
      offset: (page - 1) * pageSize,
      limit: pageSize
    }
  })

  const {statusCode, data} = res

  if (statusCode !== 200) {
    console.error(statusCode, res.data)
    throw new Error(`statusCode: ${statusCode}`)
  }

  if (data.meta && data.meta.status !== 200) {
    console.error(data.meta.status, data.meta.msg)
    throw new Error(`status: ${data.meta.status}, errMsg: ${data.meta.msg}`)
  }

  if (!data.data) return []

  return data.data.map(item => {
    return {
      id: item.id,
      url: item.images.original.webp,
      thumbUrl: item.images.preview_gif.url,
      width: Number(item.images.original.width),
      height: Number(item.images.original.height),
      size: Number(item.images.original.webp_size),
      description: item.title,
      alt: item.alt_text,
      originalName: item.slug || item.id || "'",
    }
  })
}

exports.detail = async function (params = {}, config = {}) {
  const {id} = params
  const {apiKey} = config

  if (!apiKey) {
    throw new Error('Giphy provider is not enabled')
  }

  if (!id) {
    throw new Error('Giphy id is required')
  }

  const url = `${API_URL}/gifs/${id}?api_key=${apiKey}`
  const res = await uniCloud.request({
    url
  })

  const {statusCode, data} = res

  if (statusCode !== 200) {
    console.error(statusCode, data)
    throw new Error(`statusCode: ${statusCode}`)
  }

  if (data.meta && data.meta.status !== 200) {
    console.error(data.meta.status, data.meta.msg)
    throw new Error(`status: ${data.meta.status}, errMsg: ${data.meta.msg}`)
  }

  const result = data.data

  return {
    id: result.id,
    url: result.images.original.webp,
    thumbUrl: result.images.preview_gif.url,
    width: Number(result.images.original.width),
    height: Number(result.images.original.height),
    size: Number(result.images.original.webp_size),
    description: result.title,
    alt: result.alt_text,
    originalName: result.slug || result.id || "",
    fileType: 'webp'
  }
}
