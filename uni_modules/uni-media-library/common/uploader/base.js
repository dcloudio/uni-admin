import createUploaderProviderInstance from './provider'

class Uploader {
  constructor(props) {
    props = Object.assign({
      provider: 'internal'
    }, props)

    this.uploaderInstance = createUploaderProviderInstance(props.provider)
    this.imageLibraryProvider = props.imageLibraryProvider

    this.callbacks = {}
    this.waitUploadFiles = []

    this.uploaderInstance.on('progress', (data) => {
      return this.emit('progress', data)
    })
    this.uploaderInstance.on('success', (data) => {
      return this.emit('success', data)
    })
    this.uploaderInstance.on('error', (data) => {
      return this.emit('error', data)
    })
  }

  on (event, callback) {
    this.callbacks[event] = callback
  }

  emit (event, data) {
    if (this.callbacks[event]) {
      return this.callbacks[event](data)
    }
  }

  async add (file) {
    if (file instanceof Array) {
      const files = await this.normalizeFiles(file)
      this.waitUploadFiles = this.waitUploadFiles.concat(files)
    } else {
      this.waitUploadFiles.push(
        await this.normalizeFiles([file])
      )
    }
  }

  async upload () {
    return this.uploaderInstance.upload(this.waitUploadFiles)
  }

  async cloudUpload () {
    return this.uploaderInstance.cloudUpload(this.waitUploadFiles, {
      imageLibraryProvider: this.imageLibraryProvider
    })
  }

  normalizeFiles (files) {
    return Promise.resolve(files)
  }
}

export default Uploader
