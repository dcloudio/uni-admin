import BaseProvider from './base';

const uniMediaLibraryCo = uniCloud.importObject('uni-media-library-co', {
  customUI: true
})

class InternalUploadProvider extends BaseProvider {
  async upload (files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = await file.getFileType()

      try {
        const result = await uniCloud.uploadFile({
          filePath: file.originUrl,
          fileType: file.mediaType,
          cloudPathAsRealPath: true,
          cloudPath: `uni-media-library/${Date.now()}.${ext}`,
          onUploadProgress: (progressEvent) => {
            file.setStatus('uploading')
            file.setPercent(Math.floor((progressEvent.loaded / progressEvent.total) * 100))
            this.emit('progress', file)
          }
        })
        file.setStatus('uploaded')
        file.setUrl(result.fileID)
        file.setPercent(100)
        await this.setVideoCover(file)
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
          provider: imageLibraryProvider
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
    const isTcbCloud = url.startsWith('cloud://')
    const isAlipayCloud = url.startsWith('cloud://env-')

    if (isTcbCloud && !isAlipayCloud) return ''

    const ossProcessRule = 'video/snapshot,t_0,f_jpg,w_0,h_0,m_fast'
    let cropUrl = `${url}?x-oss-process=${ossProcessRule}`

    if (isAlipayCloud) {
      const res = await uniCloud.getTempFileURL({
        fileList: [url]
      })
      if (res.fileList && res.fileList.length) {
        url = res.fileList[0].tempFileURL
        const separator = url.includes('?') ? '&' : '?'
        cropUrl = `${url}${separator}x-oss-process=${ossProcessRule}`
      }
    }

    const imageBlob = await this.fetchCoverBlob(cropUrl)
    const imageBlobUrl = URL.createObjectURL(imageBlob)

    try {
      const uploadRes = await uniCloud.uploadFile({
        filePath: imageBlobUrl,
        cloudPath: `uni-media-library/video-cover-${Date.now() + Math.round(Math.random() * 10000)}.jpg`,
        fileType: 'image'
      })

      return uploadRes.fileID
    } finally {
      URL.revokeObjectURL(imageBlobUrl)
    }
    // #endif
    return ''
  }
}

export default InternalUploadProvider
