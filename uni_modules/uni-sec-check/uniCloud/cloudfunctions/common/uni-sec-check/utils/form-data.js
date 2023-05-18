// author: wangyaqi@dcloud.io
// 搭配uniCloud.httpclient.request使用
// content: formData.getBuffer()
// header: formData.getHeaders(userHeaders)
class FormData {
  constructor () {
    this._boundary =
      '------FormDataBaseBoundary' + Math.random().toString(36).substring(2)
    this.dataList = []
  }

  _addData (data) {
    // 优化 减少Buffer.concat执行次数
    const lastData = this.dataList[this.dataList.length - 1]
    if (typeof data === 'string' && typeof lastData === 'string') {
      this.dataList[this.dataList.length - 1] = lastData + '\r\n' + data
    } else {
      this.dataList.push(data)
    }
  }

  append (name, value, options) {
    this._addData('--' + this._boundary)
    let leading = `Content-Disposition: form-data; name="${name}"`
    switch (Buffer.isBuffer(value)) {
      case true:
        if (!options.filename || !options.contentType) {
          throw new Error('filename and contentType required')
        }
        leading += `; filename="${options.filename}"`
        this._addData(leading)
        this._addData(`Content-Type: ${options.contentType}`)
        this._addData('')
        this._addData(value)
        break
      default:
        this._addData('')
        this._addData(value)
    }
  }

  getHeaders (options) {
    const headers = {
      'Content-Type': 'multipart/form-data; boundary=' + this._boundary
    }
    return Object.assign(headers, options)
  }

  getBuffer () {
    let dataBuffer = Buffer.alloc(0)
    this.dataList.forEach((item) => {
      if (Buffer.isBuffer(item)) {
        dataBuffer = Buffer.concat([dataBuffer, item])
      } else {
        dataBuffer = Buffer.concat([dataBuffer, Buffer.from('' + item)])
      }
      dataBuffer = Buffer.concat([dataBuffer, Buffer.from('\r\n')])
    })
    dataBuffer = Buffer.concat([dataBuffer, Buffer.from('--' + this._boundary + '--')])
    return dataBuffer
  }
}

module.exports = {
  FormData
}