const uniMediaLibraryCo = uniCloud.importObject('uni-media-library-co', {
  customUI: true
})

export default class UploadURL {
  constructor(props) {
    this.provider = props.provider
    this.images = props.images
    this.$mediaList = props.mediaList
  }

  get preUploadImages () {
    return this.images.map(item => {
      return {
        src: item.thumbUrl,
        raw: item.url,
        // size: tempFile.size,
        type: 'image',
        // fileType: fileType,
        name: item.originalName,
        width: item.width,
        height: item.height,
        attributes: {
          description: item.description,
          alt: item.alt
        }
      }
    })
  }

  async upload () {
    if (!this.images || !this.images.length) return false

    this.$mediaList.chooseFiles(
      this.preUploadImages,
    )

    const promises = this.preUploadImages.map((item, index) => {
      this.$mediaList.mediaUploadProgress({
        index,
        loaded: 0,
        total: 0,
        tempFilePath: item.src
      })

      return uniMediaLibraryCo.uploadImage({
        url: item.raw
      }).then(res => {
        return {
          path: item.src,
          url: res.data.fileId,
          attributes: item.attributes
        }
      })
    })

    await this.$mediaList.mediaUploadSuccess(
      await Promise.all(promises)
    )
  }
}
