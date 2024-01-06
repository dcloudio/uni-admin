async function getImageInfo(tempFile, fileInfo) {
  return new Promise(resolve => {
    uni.getImageInfo({
      src: fileInfo.src,
      success: (res) => {
        fileInfo.width = res.width
        fileInfo.height = res.height
      },
      complete: () => {
        resolve()
      }
    })
  })
}

async function getVideoInfo(tempFile, fileInfo) {
  return new Promise(resolve => {
    // #ifdef H5
    if (!('duration' in tempFile)) {
      const video = document.createElement('video')
      video.src = tempFile.path
      // 获取视频的长度/时间
      video.addEventListener('loadedmetadata', () => {
        fileInfo.duration = video.duration
        fileInfo.width = video.videoWidth
        fileInfo.height = video.videoHeight

        resolve()
      })
      return
    }
    // #endif

    fileInfo.duration = tempFile.duration
    fileInfo.width = tempFile.width
    fileInfo.height = tempFile.height

    resolve()
  })
}

export async function transformPreviewMediaList(tempFiles = []) {
  const files = []
  for (const tempFile of tempFiles) {
    const [mediaType = '', fileType] = (tempFile.type || tempFile.fileType)?.split('/') || []
    const fileInfo = {
      src: tempFile.path,
      size: tempFile.size,
      type: mediaType,
      fileType: fileType,
      name: tempFile.name
    }

    if (mediaType === 'image') {
      await getImageInfo(tempFile, fileInfo)
    } else if (mediaType === 'video') {
      await getVideoInfo(tempFile, fileInfo)
    }

    files.push(fileInfo)
  }

  return files
}

const imageExtname = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
const videoExtname = ['.mp4', '.avi', '.mov', '.rmvb', '.rm', '.flv', '.3gp', '.wmv', '.mkv']
export const extnameMap = {
  all: [...imageExtname, ...videoExtname],
  image: imageExtname,
  video: videoExtname,
}

export function cropImg(file) {
  return new Promise((resolve, reject) => {
    let ext
    let filePathProcessed = file.path // 处理结果
    // #ifdef H5
    ext = file.name.split('.').pop()
    resolve({
      path: filePathProcessed,
      ext,
      fileType: file.fileType
    })
    // #endif
    // #ifndef H5
    uni.getImageInfo({
      src: file.path,
      success(info) {
        ext = info.type.toLowerCase()
        resolve({
          path: filePathProcessed,
          ext,
          fileType: file.fileType
        })
      },
      fail(err) {
        reject(new Error(err.errMsg || '未能获取图片类型'))
      }
    })
    // #endif
  })
}
