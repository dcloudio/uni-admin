import Uploader from "./base";
import UploaderFile from "./struct/upload-file";

export class FromFileUploader extends Uploader {
  constructor(props) {
    super(props)
  }

  chooseImage (options) {
    return new Promise((resolve, reject) => {
      uni.chooseImage({
        sizeType: ['original'],
        extension: options.extension,
        success: (res) => {
          resolve(res.tempFiles)
        },
        fail: (e) => {
          reject(e)
        }
      })
    })
  }

  chooseVideo (options) {
    return new Promise((resolve, reject) => {
      uni.chooseVideo({
        compressed: false,
        extension: options.extension,
        success: (res) => {
          resolve([
            {
              name: (res.tempFile && res.tempFile.name) || 'unknown',
              type: (res.tempFile && res.tempFile.type) || '',
              path: res.tempFilePath,
              duration: res.duration,
              size: res.size,
              height: res.height,
              width: res.width,
            }
          ])
        },
        fail: (e) => {
          reject(e)
        }
      })
    })
  }

  chooseAll (options) {
    return new Promise((resolve, reject) => {
      uni.chooseFile({
        type: 'all',
        extension: options.extension,
        success: (res) => {
          resolve(res.tempFiles)
        },
        fail: (e) => {
          reject(e)
        }
      })
    })
  }

  async chooseFileAndUpload (options) {
    const {type, onChooseFile, success, fail} = options
    let choosePromise

    if (type === 'image') {
      choosePromise = this.chooseImage(options)
    } else if (type === 'video') {
      choosePromise = this.chooseVideo(options)
    } else {
      choosePromise = this.chooseAll(options)
    }

    return choosePromise.then(files => {
      return this.add(files)
    }).then(() => {
      typeof onChooseFile === 'function' && onChooseFile(
        this.waitUploadFiles
      )
      return this.upload()
    }).then(success).catch(fail)
  }

  getImageInfo(tempFile, fileInfo) {
    return new Promise(resolve => {
      uni.getImageInfo({
        src: fileInfo.originUrl,
        success: (res) => {
          fileInfo.attributes.width = res.width
          fileInfo.attributes.height = res.height
        },
        complete: () => {
          resolve()
        }
      })
    })
  }

  getVideoInfo(tempFile, fileInfo) {
    return new Promise(resolve => {
      // #ifdef H5
      if (!('duration' in tempFile)) {
        const video = document.createElement('video')
        video.src = fileInfo.originUrl
        // 获取视频的长度/时间
        video.addEventListener('loadedmetadata', () => {
          fileInfo.attributes.duration = video.duration
          fileInfo.attributes.width = video.videoWidth
          fileInfo.attributes.height = video.videoHeight

          resolve()
        })
        return
      }
      // #endif

      fileInfo.attributes.duration = tempFile.duration
      fileInfo.attributes.width = tempFile.width
      fileInfo.attributes.height = tempFile.height

      resolve()
    })
  }

  async normalizeFiles (files) {
    let newFiles = []
    for (const file of files) {
      const [mediaType = '', fileType] = (file.type || file.fileType)?.split('/') || []
      const fileInfo = {
        uploadId: file.uploadId,
        name: file.name,
        originUrl: file.path,
        thumbUrl: file.path,
        size: file.size,
        mediaType: mediaType,
        fileType: fileType,
        attributes: {}
      }

      if (mediaType === 'image') {
        await this.getImageInfo(file, fileInfo)
      } else if (mediaType === 'video') {
        await this.getVideoInfo(file, fileInfo)
      }

      newFiles.push(
        new UploaderFile(fileInfo)
      )
    }

    return newFiles
  }
}
