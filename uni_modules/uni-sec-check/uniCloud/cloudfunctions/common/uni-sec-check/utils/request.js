async function request({
  method = 'GET',
  url,
  content,
  headers,
  dataType = 'json'
} = {}) {
  return await uniCloud.httpclient.request(url, {
    method,
    headers,
    content,
    dataType
  })
}

module.exports = {
  request
}
