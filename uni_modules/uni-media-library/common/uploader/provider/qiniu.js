import BaseProvider from './base';

const uniMediaLibraryCo = uniCloud.importObject('uni-media-library-co', {
  customUI: true
})

class QiniuUploadProvider extends BaseProvider {
  async upload (files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = await file.getFileType()

      try {
        file.setStatus('uploading')
        this.emit('progress', file)

        const optionsRes = await uniMediaLibraryCo.getUploadFileOptions({
          cloudPath: `uni-media-library/${Date.now()}.${ext}`
        })

        await new Promise((resolve, reject) => {
          const uploadTask = uni.uploadFile({
            url: optionsRes.data.uploadFileOptions.url,
            name: optionsRes.data.uploadFileOptions.name,
            formData: optionsRes.data.uploadFileOptions.formData,
            filePath: file.originUrl,
            success: (uploadFileRes) => {
              if (uploadFileRes.statusCode !== 200) {
                reject(new Error(`上传失败，状态码: ${uploadFileRes.statusCode}`))
                return
              }
              resolve()
            },
            fail: (err) => {
              reject(err)
            }
          })

          uploadTask.onProgressUpdate((progressEvent) => {
            file.setPercent(Math.floor((progressEvent.progress || 0)))
            this.emit('progress', file)
          })
        })

        file.setStatus('uploaded')
        file.setUrl(optionsRes.data.fileID)
        file.setPercent(90)
        this.emit('progress', file)
        await this.setVideoCover(file)
        file.setPercent(100)
      } catch (e) {
        file.setStatus('failed')
        file.setError(e)
        console.error(e)
      }

      if ((i + 1) === files.length) {
        await this.emit('success', files)
      }
    }
  }

  async cloudUpload (files, options) {
    const { imageLibraryProvider } = options
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      try {
        file.setStatus('uploading')
        file.setPercent(0)
        this.emit('progress', file)

        const result = await uniMediaLibraryCo.uploadImage({
          url: file.originUrl,
          id: file.id,
          provider: imageLibraryProvider,
          storageProvider: 'ext-qiniu'
        })

        if (!result.data.fileID) {
          file.setStatus('failed')
          file.setError(new Error('上传失败'))
          this.emit('error', file)
          return
        }

        file.setStatus('uploaded')
        file.setUrl(result.data.fileID)
        file.setPercent(90)
        file.setAttributes(result.data.detail)
        await this.setVideoCover(file)
        this.emit('progress', file)
      } catch (e) {
        file.setStatus('failed')
        file.setError(e)
        console.error(e)
        this.emit('error', file)
      }

      if ((i + 1) === files.length) {
        await this.emit('success', files)
      }
    }
  }

  async cropVideoCover(url) {
    // #ifdef H5
    const sourceUrl = await this.getVideoCoverSourceUrl(url)
    if (!sourceUrl) return ''

    const coverUrl = this.getVideoCoverUrl(sourceUrl)
    const imageBlob = await this.fetchCoverBlob(coverUrl)
    const imageBlobUrl = URL.createObjectURL(imageBlob)

    try {
      const optionsRes = await uniMediaLibraryCo.getUploadFileOptions({
        cloudPath: `uni-media-library/video-cover-${Date.now() + Math.round(Math.random() * 10000)}.jpg`
      })

      await new Promise((resolve, reject) => {
        uni.uploadFile({
          url: optionsRes.data.uploadFileOptions.url,
          name: optionsRes.data.uploadFileOptions.name,
          formData: optionsRes.data.uploadFileOptions.formData,
          filePath: imageBlobUrl,
          success: (uploadFileRes) => {
            if (uploadFileRes.statusCode !== 200) {
              reject(new Error(`上传视频封面失败，状态码: ${uploadFileRes.statusCode}`))
              return
            }
            resolve()
          },
          fail: (err) => {
            reject(err)
          }
        })
      })

      return optionsRes.data.fileID
    } finally {
      URL.revokeObjectURL(imageBlobUrl)
    }
    // #endif
    return ''
  }

  async getVideoCoverSourceUrl(url) {
    if (/^https?:\/\//.test(url)) return url

    const res = await uniMediaLibraryCo.getTempFileURL({
      fileList: [url]
    })
    if (res.errCode) {
      throw new Error(res.errMsg || '获取视频临时地址失败')
    }

    const fileList = res.data && res.data.fileList
    if (!fileList || !fileList.length) return ''

    return fileList[0].tempFileURL || ''
  }

  getVideoCoverUrl(url) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}vframe/jpg/offset/2/`
  }
}

export default QiniuUploadProvider
