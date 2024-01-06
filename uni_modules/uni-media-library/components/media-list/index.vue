<template>
  <scroll-view
      class="media-view"
      scroll-y
      @scrolltolower="loadMore"
  >
    <unicloud-db
      ref="mediaUdb"
      v-slot:default="{data, loading, error, pagination}"
      :collection="collection"
      orderby="createDate desc"
      loadtime="manual"
      :page-size="50"
      @load="onMediaListLoad"
    >
      <view v-if="(loading || processing) && pagination.current === 1" class="loading">
        <uni-icons class="icon" type="spinner-cycle" size="30" color="#000"></uni-icons>
      </view>
      <view class="items" v-else-if="mediaList.length">
        <view
            class="media-item"
            :class="{active: mediaItem.active, selected: mediaItem.selected}"
            v-for="(mediaItem, index) in mediaList"
            @click="onSelect(index)"
            :key="mediaItem._id"
        >
          <view class="image" v-if="mediaItem.type === 'image'">
            <image :src="mediaItem.isUploading ? mediaItem.src: mediaItem.thumb.listCover" mode="aspectFill" class="img"></image>
          </view>
          <view class="image" v-if="mediaItem.type === 'video'">
            <video
                class="v"
                :src="mediaItem.src"
                :controls="false"
                :show-center-play-btn="false"
                v-if="mediaItem.isUploading || /^cloud:\/\//.test(mediaItem._src)"
            ></video>
            <image v-else :src="mediaItem.thumb.listCover" mode="aspectFill" class="img"></image>
          </view>
          <view class="mask" v-if="mediaItem.isUploading">
            <view class="progress">
              <view class="inner" :style="{width: mediaItem.progress + '%'}"></view>
            </view>
            <view class="tip">{{mediaItem.tip}}</view>
          </view>
        </view>
      </view>
      <view class="media-library-isnull" v-else>
        <uni-icons type="images" size="60" color="#ccc"></uni-icons>
        <view class="text">媒体库资源为空，是否上传资源？</view>
        <button
            type="primary"
            size="mini"
            @click="$emit('onUploadMedia');"
        >上传媒体资源</button>
      </view>
    </unicloud-db>

  </scroll-view>
</template>

<script>
const db = uniCloud.database()

export default {
  name: "media-list",
  emits: ['onSelect', 'onUploadMedia'],
  expose: ['cancelAllSelected', 'deleteSelectedMedia', 'chooseFiles', 'mediaUploadProgress', 'mediaUploadSuccess'],
  props: {
    mediaType: {
      type: String,
      default: () => "all"
    },
    mediaGroup: String,
    keyword: String,
    selectedCount: Number
  },
  data () {
    return {
      lastId: null,
      lastSelectedIndex: 0,
      remoteMediaList: [],
      localMediaList: [],
      shiftKey: false,
      isUploading: false,
      processing: true
    }
  },
  watch: {
    mediaGroup () {
      this.loadMediaList(true)
    },
    keyword () {
      this.loadMediaList(true)
    }
  },
  computed: {
    collection () {
      return [
        db.collection('uni-media-library').where(this.mediaListWhere || {}).getTemp(),
        db.collection('uni-id-users').field('_id, nickname').getTemp()
      ]
    },
    mediaList () {
      return this.localMediaList.concat(this.remoteMediaList)
    },
    mediaListWhere () {
      const cond = []

      if (this.mediaType !== 'all') {
        cond.push(`type=="${this.mediaType}"`)
      }
      if (this.mediaGroup) {
        cond.push(`group=="${this.mediaGroup}"`)
      }

      if (this.keyword) {
        cond.push(`${new RegExp(this.keyword, 'i')}.test(description)`)
      }

      return cond.join('&')
    }
  },
  mounted () {
    this.loadMediaList()
    // #ifdef H5
    document.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('keyup', this.onKeyUp)
    // #endif
  },
  destroyed () {
    // #ifdef H5
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keyup', this.onKeyUp)
    // #endif
  },
  methods: {
    onKeyDown (e) {
      if (e.keyCode === 16) {
        this.shiftKey = true
      }
    },
    onKeyUp (e) {
      if (e.keyCode === 16) {
        this.shiftKey = false
      }
    },
    async onMediaListLoad (data) {
      const tcbCloudFiles = []

      // 保存原始图片
      data.forEach(item => {
        item._src = item.src
        item._cover = item.cover
      })

      for (let i = 0; i < data.length; i++) {
        const media = data[i]
        if (media.src?.startsWith('cloud://')) {
          tcbCloudFiles.push({
            index: i,
            src: media.src,
            cover: media.cover,
          })
        }
      }

      if (tcbCloudFiles.length) {
        const res = await uniCloud.getTempFileURL({
          fileList: [].concat.call([], ...tcbCloudFiles.map(item => [item.src, item.cover])).filter(item => item)
        })

        res.fileList.forEach(item => {
          const cloudFile = tcbCloudFiles.find(file => file.src === item.fileID || file.cover === item.fileID)

          if (cloudFile) {
            if (cloudFile.src) {
              // 保存原始图片
              data[cloudFile.index].src = item.tempFileURL
              for (const cropRule in data[cloudFile.index].thumb) {
                data[cloudFile.index].thumb[cropRule] = data[cloudFile.index].thumb[cropRule].replace(cloudFile.src, item.tempFileURL)
              }
            }
            if (cloudFile.cover) {
              // 保存原始封面
              data[cloudFile.index].cover = item.tempFileURL
              for (const cropRule in data[cloudFile.index].thumb) {
                data[cloudFile.index].thumb[cropRule] = data[cloudFile.index].thumb[cropRule].replace(cloudFile.cover, item.tempFileURL)
              }
            }
          }
        })
      }

      this.remoteMediaList = this.remoteMediaList.concat(data)
      this.processing = false
    },
    loadMediaList (reset = false) {
      // 重新加载媒体库列表清空上传列表
      if (reset) {
        this.localMediaList = []
        this.cancelAllSelected()
      }

      this.processing = true
      this.remoteMediaList = []
      this.$nextTick(() => this.$refs.mediaUdb.loadData({
        clear: reset
      }))
    },
    loadMore () {
      this.$refs.mediaUdb.loadMore()
    },
    onSelect (index) {
      if (this.isUploading) return

      let minIndex = index
      let maxIndex = index
      // shift 多选
      if (this.shiftKey) {
        minIndex = Math.min(this.lastSelectedIndex, index)
        maxIndex = Math.max(this.lastSelectedIndex, index)
      }

      const mediaItem = this.mediaList[index]

      // 如果设置了最大选择数量，判断是否超过最大数量
      if (this.selectedCount > 0 && !mediaItem.selected && !mediaItem.active) {
        const selectedMediaCount = this.mediaList.reduce((count, item) => item.selected || item.active ? count + 1 : count, 0)
        if (selectedMediaCount + (maxIndex - minIndex + 1) > this.selectedCount) {
          uni.showToast({
            title: `最多只能选择${this.selectedCount}个媒体文件`,
            icon: 'none'
          })
          return
        }
      }

      // 选择
      if (!mediaItem.selected) {
        // 选中当前
        for (let i = minIndex; i <= maxIndex; i++) {
          this.$set(this.mediaList[i], 'active', !mediaItem.active)
        }

        // 取消其他当前选中并设置为已选择
        for (const otherMediaItem of this.mediaList) {
          if (otherMediaItem.active && otherMediaItem._id !== mediaItem._id) {
            this.$set(otherMediaItem, 'active', false)
            this.$set(otherMediaItem, 'selected', true)
          }
        }
      } else {
        // 取消选择
        this.$set(this.mediaList[index], 'selected', false)
      }

      this.lastSelectedIndex = index

      this.$nextTick(() => {
        this.$emit('onSelect', this.mediaList.filter(item => item.selected || item.active))
      })
    },
    cancelAllSelected () {
      if (this.isUploading) return

      for (const mediaItem of this.mediaList) {
        if (mediaItem.active || mediaItem.selected) {
          this.$set(mediaItem, 'active', false)
          this.$set(mediaItem, 'selected', false)
        }
      }
      this.$nextTick(() => {
        this.$emit('onSelect', [])
      })
    },
    deleteSelectedMedia (mediaIds) {
      if (this.isUploading) return

      for (const id of mediaIds) {
        const index = this.remoteMediaList.findIndex(item => item._id === id)
        this.remoteMediaList.splice(index, 1)
      }

      this.$nextTick(() => {
        this.$emit('onSelect', [])
      })
    },
    chooseFiles (files = []) {
      if (this.isUploading) return

      this.isUploading = true
      this.localMediaList = files.map(file => {
        return {
          ...file,
          isUploading: true,
          progress: 0,
          status: 'waiting',
          tip: '等待上传'
        }
      })
    },
    mediaUploadProgress (progress) {
      const sum = (progress.loaded / progress.total) * 100
      const mediaItemIndex = this.localMediaList.findIndex(item => item.src === progress.tempFilePath)

      if (mediaItemIndex < 0) return

      this.localMediaList[mediaItemIndex].progress = sum < 100 ? sum : 100
      this.localMediaList[mediaItemIndex].status = 'uploading'
      this.localMediaList[mediaItemIndex].tip = '正在上传'
    },
    async mediaUploadSuccess (files) {
      for (const file of files) {
        const mediaItemIndex = this.localMediaList.findIndex(item => item.src === file.path)
        const mediaItem = this.localMediaList[mediaItemIndex]

        if (mediaItemIndex < 0) continue

        const attrs = {
          cover: file.url, // 媒体资源封面
        }

        if (mediaItem.type === 'video') {
          // 截取视频封面
          await this.cropVideoCover(mediaItemIndex, file.url, attrs)
        }

        // 上报媒体库
        await this.reportFunction(mediaItemIndex, file.url, attrs)

        this.localMediaList[mediaItemIndex].src = file.url
        this.localMediaList[mediaItemIndex].status = 'success'
        this.localMediaList[mediaItemIndex].tip = '上传成功'
      }

      this.isUploading = false

      // 上传完成重新加载媒体库
      this.loadMediaList(true)
    },
    async reportFunction (mediaIndex, url, attrs = {}) {
      const mediaItem = this.localMediaList[mediaIndex]
      if (!mediaItem) return

      this.localMediaList[mediaIndex].tip = '正在添加至媒体库'

      const uniMediaLibraryCo = uniCloud.importObject('uni-media-library-co', {
        customUI: true
      })

      await uniMediaLibraryCo.report({
        src: url,
        type: mediaItem.type,
        originalName: mediaItem.name,
        fileType: mediaItem.fileType,
        size: mediaItem.size,
        resolution: {
          width: mediaItem.width || 0,
          height: mediaItem.height || 0
        },
        duration: mediaItem.duration || 0,
        uploadUser: uniCloud.getCurrentUserInfo().uid,
        ...attrs
      })
    },
    async cropVideoCover (mediaIndex, url, attrs) {
      const mediaItem = this.localMediaList[mediaIndex]
      const isTcbCloud = url.startsWith('cloud://')

      if (!mediaItem || isTcbCloud) return undefined

      this.localMediaList[mediaIndex].tip = '正在截取视频封面'

      const ossProcessRule = 'video/snapshot,t_0,f_jpg,w_0,h_0,m_fast'
      const cropUrl = `${url}?x-oss-process=${ossProcessRule}`
      const image = await fetch(cropUrl)
      const imageBlob = await image.blob()
      const imageFile = new File([imageBlob], 'image.jpg', {type: 'image/jpeg'})
      const imageBlobUrl = await this.file2blob(imageFile)

      const uploadRes = await uniCloud.uploadFile({
        filePath: imageBlobUrl,
        cloudPath: `uni-media-library/video-cover-${Date.now() + Math.round(Math.random() * 10000)}.jpg`,
        fileType: 'image'
      })

      attrs.cover = uploadRes.fileID
    },
    file2blob(file) {
      let url
      if (window.createObjectURL !== undefined) {
        url = window.createObjectURL(file);
      } else if (window.URL !== undefined) {
        url = window.URL.createObjectURL(file);
      } else if (window.webkitURL !== undefined) {
        url = window.webkitURL.createObjectURL(file);
      }
      return url
    }
  }
}
</script>

<style lang="scss">
.media-view {
  flex: 1;
  margin-top: 10px;
  overflow-y: auto;
  .items {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
}

.loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  .icon {
    animation: rotate 1s linear infinite;
  }
}
.media-item {
  --row-media-item: 7;
  width: calc(100% / var(--row-media-item) - (((var(--row-media-item) - 1) * 10px) / (var(--row-media-item)) + 0.01px));
  border: #f5f5f5 solid 5px;
  border-radius: 6px;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color .25s;
  &.selected {
    border-color: rgba(41, 121, 255, .5);
  }
  &.active {
    border-color: #2979ff;
  }
  .image {
    height: 0;
    padding-bottom: 100%;
    position: relative;
    .img,.v {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 4px;
    }
  }
  .mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    background: rgba(0, 0, 0, .5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .tip {
      font-size: 12px;
      color: #fff;
      margin-top: 5px;
    }
  }

  .progress {
    width: 80%;
    height: 4px;
    border-radius: 2px;
    background: #fff;
    position: relative;
    overflow: hidden;
    .inner {
      width: 0;
      height: 100%;
      border-radius: 2px;
      transition: width .3s;
      background: #2979ff;
    }
  }
}

.media-library-isnull {
  padding-top: 50px;
  text-align: center;
  .text {
    font-size: 18px;
    color: #ccc;
    margin-top: 5px;
    margin-bottom: 30px;
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg)
  }
}

@media screen and (max-width: 768px) {
  .media-item {
    --row-media-item: 3;
  }
}
@media screen and (min-width: 768px) {
  .media-item {
    --row-media-item: 5;
  }
}
@media screen and (min-width: 1360px) {
  .media-item {
    --row-media-item: 7;
  }
}
@media screen and (min-width: 1920px) {
  .media-item {
    --row-media-item: 10;
  }
}
@media screen and (min-width: 2560px) {
  .media-item {
    --row-media-item: 15;
  }
}
</style>
