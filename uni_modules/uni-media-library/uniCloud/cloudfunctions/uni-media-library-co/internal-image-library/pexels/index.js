const API_URL = 'https://api.pexels.com/v1'

exports.search = async function (params = {}, config = {}){
  const {keyword, page, pageSize} = params
  const {apiKey} = config

  if (!apiKey) {
    throw new Error('Pexels provider is not enabled')
  }

  const url = `${API_URL}/search`
  const res = await uniCloud.request({
    url,
    data: {
      query: keyword,
      page,
      per_page: pageSize
    },
    header: {
      Authorization: `${apiKey}`
    }
  })

  if (res.statusCode !== 200) {
    console.error(res.statusCode, res.data)
    throw new Error(`statusCode: ${res.statusCode}`)
  }

  return res.data.photos.map(item => {
    return {
      id: item.id,
      url: item.src.original,
      thumbUrl: item.src.tiny,
      width: item.width,
      height: item.height,
      description: item.description,
      alt: item.alt,
      originalName: item.slug || item.id || "'",
    }
  })
}

exports.detail = async function (params = {}, config = {}) {
  const {id} = params
  const {apiKey} = config

  if (!apiKey) {
    throw new Error('Pexels provider is not enabled')
  }

  if (!id) {
    throw new Error('Pexels id is required')
  }

  const url = `${API_URL}/photos/${id}`
  const res = await uniCloud.request({
    url,
    header: {
      Authorization: `${apiKey}`
    }
  })

  if (res.statusCode !== 200) {
    console.error(res.statusCode, res.data)
    throw new Error(`statusCode: ${res.statusCode}`)
  }

  const {data} = res

  const filename = data.src.original.split('/').pop()
  const [name, ext = 'jpeg'] = filename.split('.')

  return {
    id: data.id,
    url: data.src.original,
    thumbUrl: data.src.tiny,
    width: data.width,
    height: data.height,
    description: data.description,
    alt: data.alt,
    originalName: filename || "",
    fileType: ext
  }
}
