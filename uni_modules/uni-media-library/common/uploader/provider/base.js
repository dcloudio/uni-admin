class UploadProvider {
  constructor() {
    this.callbacks = {}
  }

  on (event, callback) {
    this.callbacks[event] = callback
  }

  emit (event, data) {
    if (this.callbacks[event]) {
      return this.callbacks[event](data)
    }
  }

  async setVideoCover(file) {
    if (file.mediaType !== 'video' || !file.url || typeof this.cropVideoCover !== 'function') return

    try {
      const cover = await this.cropVideoCover(file.url)
      if (!cover) return

      file.setAttributes({
        ...(file.attributes || {}),
        cover
      })
    } catch (e) {
      console.error('Failed to crop video cover', e)
    }
  }

  async fetchCoverBlob(url) {
    const image = await fetch(url)
    if (!image.ok) {
      throw new Error(`截取视频封面失败，状态码: ${image.status}`)
    }

    const blob = await image.blob()
    if (!this.isValidCoverBlob(blob)) {
      throw new Error('截取视频封面失败，返回内容不是有效图片')
    }

    return blob
  }

  isValidCoverBlob(blob) {
    if (!blob || !blob.size) return false
    if (!blob.type) return true
    return blob.type.startsWith('image/')
  }
}

export default UploadProvider
