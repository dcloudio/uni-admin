<template>
  <view class="media-info-wrap">
    <template v-if="showMediaInfoPanel">
      <view class="preview" v-if="currentMedia.src">
        <view class="image" v-if="currentMedia.type === 'image'">
          <image
              class="img"
              :src="currentMedia.thumb.detailCover || currentMedia.cover"
              mode="aspectFill"
          ></image>
        </view>
        <view class="video" v-else-if="currentMedia.type === 'video'">
          <video
              style="width: 100%; height: 100%;"
              :src="currentMedia.src"
              :poster="currentMedia.thumb.detailCover"
          ></video>
        </view>
        <view class="ops" v-if="currentMedia.type === 'image'">
          <!--          <view class="op">-->
          <!--            <uni-icons type="compose" size="16" color="#333"></uni-icons>-->
          <!--          </view>-->
          <view class="op" @click="previewImage">
            <uni-icons type="eye" size="16" color="#333"></uni-icons>
          </view>
        </view>
      </view>
      <view class="info-item">
        <view class="label">URL</view>
        <view class="content" v-if="/^cloud:\/\//.test(currentMedia._src)">{{ currentMedia._src }}</view>
        <view class="content" v-else>{{ currentMedia.src }}</view>
      </view>
      <view class="info-item">
        <view class="label">描述</view>
        <view class="content">
          <uni-easyinput
              placeholder="描述; 用于媒体资源搜索"
              v-model="currentMedia.description"
              @blur="onFiledChange('description')"
              @clear="onFiledChange('description')"
          ></uni-easyinput>
        </view>
      </view>
      <view class="info-item">
        <view class="label">替代文字</view>
        <view class="content">
          <uni-easyinput
              placeholder="替代文字，资源加载失败时展示"
              v-model="currentMedia.alt"
              @blur="onFiledChange('alt')"
              @clear="onFiledChange('alt')"
          ></uni-easyinput>
        </view>
      </view>
      <view class="title">基本信息</view>
      <view class="media-base-info">
        <view class="info-item">
          <view class="label">原始文件名</view>
          <view class="content">{{ currentMedia.originalName || '-' }}</view>
        </view>
        <view class="info-item">
          <view class="label">文件类型</view>
          <view class="content">{{ fileType }}</view>
        </view>
        <view class="info-item">
          <view class="label">文件大小</view>
          <view class="content">{{ fileSize || '-' }}</view>
        </view>
        <view class="info-item">
          <view class="label">分辨率</view>
          <view class="content">{{ resolution.width }}*{{ resolution.height }}</view>
        </view>
        <view class="info-item" v-if="currentMedia.type === 'video'">
          <view class="label">时长</view>
          <view class="content">{{ mediaDuration }}</view>
        </view>
        <view class="info-item">
          <view class="label">上传者</view>
          <view class="content">{{ currentMedia.uploadUser && currentMedia.uploadUser[0].nickname || '-'}}</view>
        </view>
        <view class="info-item" style="width: 100%;">
          <view class="label">上传时间</view>
          <view class="content">{{ createDate }}</view>
        </view>
      </view>
    </template>
  </view>
</template>

<script>
export default {
  name: "media-info",
  props: {
    currentMedia: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      mediaInfo: {
        height: 200
      }
    }
  },
  computed: {
    showMediaInfoPanel() {
      return this.currentMedia && this.currentMedia._id
    },
    fileSize() {
      const size = this.currentMedia.size;

      if (!size) return '0.00 MB';
      if (size < 1024) return size + ' B';
      if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
      if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + ' MB';
      return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB';
    },
    fileType() {
      if (this.currentMedia.fileType) {
        return this.currentMedia.fileType.toUpperCase()
      } else {
        return '-'
      }
    },
    resolution() {
      const res = {
        width: 0,
        height: 0
      }

      if (this.currentMedia.resolution) {
        res.width = this.currentMedia.resolution.width || 0
        res.height = this.currentMedia.resolution.height || 0
      }

      return res
    },
    mediaDuration () {
      if (this.currentMedia.duration) {
        const duration = this.currentMedia.duration
        const hours = Math.floor(duration / 3600)
        const minutes = Math.floor((duration - hours * 3600) / 60)
        const seconds = Math.floor(duration - hours * 3600 - minutes * 60)

        return `${hours}:${minutes}:${seconds}`
      } else {
        return '-'
      }
    },
    createDate () {
      if (!this.currentMedia.createDate) return '-'

      const date = new Date(this.currentMedia.createDate)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const day = date.getDate()
      const hour = date.getHours()
      const minute = date.getMinutes()
      const second = date.getSeconds()

      return `${year}年${month}月${day}日 ${hour}:${minute}:${second}`
    }
  },
  methods: {
    previewImage() {
      uni.previewImage({
        current: this.currentMedia.cover,
        urls: [this.currentMedia.cover]
      })
    },
    onFiledChange(field) {
      const db = uniCloud.database()

      db.collection('uni-media-library').doc(this.currentMedia._id).update({
        [field]: this.currentMedia[field] || ''
      }).catch(err => {
        console.log(err)
        uni.showToast({
          title: '更新失败',
          icon: 'none'
        })
      })
    }
  }
}
</script>

<style lang="scss">
  .title {
    margin-top: 30px;
    font-size: 14px;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
  }
  .media-info-wrap {
    width: 320px;
    background-color: #fafafa;
    padding: 10px;
    box-sizing: border-box;
    border-left: #f1f1f1 solid 1px;
    overflow-y: auto;
    height: 100%;
  }
  .preview {
    width: 100%;
    overflow: hidden;
    position: relative;
    margin-bottom: 10px;
    &:hover {
      .ops {
        opacity: 1;
        visibility: visible;
      }
    }
    .ops {
      position: absolute;
      bottom: 10px;
      left: 0;
      right: 10px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      opacity: 0;
      visibility: hidden;
      transition: opacity .3s;
      .op {
        cursor: pointer;
        width: 30px;
        height: 30px;
        background-color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        box-shadow: 0 0 6px rgba(0, 0, 0, 0.06);
        transition: background-color .3s;
        &:hover {
          background: #eee;
        }
      }
    }
    .img {
      width: 100%;
      height: 180px;
      border-radius: 4px;
    }
    .video {
      height: 180px;
      uni-video {
        width: 100%;
        height: 100%;
      }
    }
  }
  .info-item {
    margin-bottom: 20px;
    .label {
      font-size: 13px;
      font-weight: bold;
      color: #999;
    }
    .content {
      margin-top: 10px;
      color: #333;
      font-size: 14px;
      word-break: break-all;
    }
  }
  .media-base-info {
    display: flex;
    flex-wrap: wrap;
    .info-item {
      width: 50%;
      margin-bottom: 15px;
      .content {
        margin-top: 5px;
      }
    }
  }

  @media screen and (max-width: 1360px) {
    .media-info-wrap {
      width: 280px;
    }
  }
</style>
