const API_URL = 'https://api.unsplash.com'

exports.search = async function (params = {}, config = {}){
  const {keyword, page, pageSize} = params
  const {appId, accessKey, secretKey} = config

  if (!appId || !accessKey || !secretKey) {
    throw new Error('Unsplash provider is not enabled')
  }

  const url = `${API_URL}/search/photos`
  const res = await uniCloud.request({
    url,
    data: {
      query: keyword,
      page,
      per_page: pageSize
    },
    header: {
      Authorization: `Client-ID ${accessKey}`
    }
  })

  if (res.statusCode !== 200) {
    console.error(res.statusCode, res.data)
    throw new Error(`statusCode: ${res.statusCode}`)
  }

  return res.data.results.map(item => {
    return {
      id: item.id,
      url: item.urls.raw,
      thumbUrl: item.urls.thumb,
      width: item.width,
      height: item.height,
      description: item.description,
      alt: item.alt_description,
      originalName: item.slug || item.id || "'",
    }
  })
}

exports.detail = async function (params = {}, config = {}) {
  const {id} = params
  const {appId, accessKey, secretKey} = config

  if (!appId || !accessKey || !secretKey) {
    throw new Error('Unsplash provider is not enabled')
  }

  if (!id) {
    throw new Error('Unsplash id is required')
  }

  const url = `${API_URL}/photos/${id}`
  const res = await uniCloud.request({
    url,
    header: {
      Authorization: `Client-ID ${accessKey}`
    }
  })

  if (res.statusCode !== 200) {
    console.error(res.statusCode, res.data)
    throw new Error(`statusCode: ${res.statusCode}`)
  }

  const {data} = res


  return {
    id: data.id,
    url: data.urls.raw,
    thumbUrl: data.urls.thumb,
    width: data.width,
    height: data.height,
    description: data.description,
    alt: data.alt_description,
    originalName: data.slug || data.id || "",
  }
}
