class UploaderFile {
  constructor(props = {}) {
    if (!props.name || !props.mediaType || !props.originUrl) {
      throw new Error('缺少必要字段')
    }

    this.id = props.id // id
    this.uploadId = props.uploadId // internal upload id
    this.name = props.name // originalName
    this.size = props.size // fileSize
    this.mediaType = props.mediaType // type
    this.fileType = props.fileType // fileType
    this.originUrl = props.originUrl // url
    this.thumbUrl = props.thumbUrl // thumbUrl
    this.attributes = props.attributes || {} // description, alt

    this.url = '' // fileId
    this.status = 'waiting' // waiting, uploading, uploaded, failed
    this.percent = 0 // 0-100
    this.error = null
  }

  setError (error) {
    this.error = error
  }

  setUrl (url) {
    this.url = url
  }

  setPercent (percent) {
    this.percent = percent
  }

  setStatus (status) {
    this.status = status
  }

  setAttributes (attributes = {}) {
    if (attributes.fileType) {
      this.fileType = attributes.fileType
    }

    if (attributes.size) {
      this.size = attributes.size
    }

    this.attributes = attributes
  }
  getFileType () {
    return new Promise((resolve, reject) => {
      if (this.fileType) {
        return resolve(this.fileType)
      }

      // #ifdef H5
      this.fileType = this.name.split('.').pop()
      resolve(this.fileType)
      // #endif
      // #ifndef H5
      uni.getImageInfo({
        src: this.originUrl,
        success(info) {
          this.fileType = info.type.toLowerCase()
          resolve(this.fileType)
        },
        fail(err) {
          reject(new Error(err.errMsg || '未能获取图片类型'))
        }
      })
      // #endif
    })
  }
}

export default UploaderFile
