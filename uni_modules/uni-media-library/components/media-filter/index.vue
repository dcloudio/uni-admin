<template>
  <view class="media-filter-warp">
    <view class="filter-options">
      <button
          type="primary"
          size="mini"
          @click="$emit('onUploadMedia')"
      >
        <uni-icons type="cloud-upload" size="14" color="#fff"></uni-icons>
        <text>上传</text>
      </button>
      <div class="split"></div>
<!--      <uni-data-select-->
<!--          v-model="mediaGroup"-->
<!--          class="group-select"-->
<!--          @change="search"-->
<!--      ></uni-data-select>-->
      <uni-easyinput
          v-model="keyword"
          class="search-input"
          suffixIcon="search"
          placeholder="搜索所有媒体..."
          @iconClick="search"
          @blur="search"
      ></uni-easyinput>
    </view>
    <view style="flex: 1;"></view>
    <view class="select-options" v-if="isSelected">
      <button type="default" size="mini" @click="$emit('onCancelSelect')">取消选中({{selectedCount}})</button>
      <button type="warn" size="mini" @click="deleteMedia">删除</button>
    </view>
  </view>
</template>

<script>
export default {
  name: "media-filter",
  emits: ['onUploadMedia', 'onSearch', 'onCancelSelect', 'onDeleteSelect'],
  props: {
    selectMediaItems: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    isSelected () {
      return this.selectMediaItems.length > 0
    },
    selectedCount () {
      return this.selectMediaItems.length
    }
  },
  data () {
    return {
      mediaGroup: '',
      keyword: '',
      lastKeyword: ''
    }
  },
  methods: {
    search () {
      if (this.keyword === this.lastKeyword) return

      this.$emit('onSearch', {
        mediaGroup: this.mediaGroup,
        keyword: this.keyword
      })

      this.lastKeyword = this.keyword
    },
    deleteMedia () {
      if (this.selectedCount > 50) {
        uni.showToast({
          title: '每次最多删除50项媒体资源',
          icon: 'none'
        })
        return
      }

      uni.showModal({
        title: `删除${this.selectedCount}项媒体资源？`,
        content: "删除后该图片将无法在页面展示，请谨慎删除！",
        success: async (res) => {
          if (!res.confirm) return false
          const uniMediaLibraryCo = uniCloud.importObject('uni-media-library-co', {
            loadingOptions: {
              title: "正在删除",
              mask: true
            }
          })
          const mediaIds = this.selectMediaItems.map(item => item._id)
          await uniMediaLibraryCo.deleteMedia({
            mediaIds
          })

          this.$emit('onDeleteSelect', mediaIds)
        },
        fail: () => {
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss">
  .media-filter-warp {
    display: flex;
    align-items: center;
    .split {
      width: 1px;
      height: 14px;
      background: #f1f1f1;
      margin: 0 5px;
    }
    .filter-options {
      display: flex;
      align-items: center;
      gap: 5px;
      .search-input, .group-select {
        min-width: 200px;
      }
    }
    .select-options {
      display: flex;
      align-items: center;
      gap: 5px;
    }
  }
  @media screen and (max-width: 768px) {
    .media-filter-warp {
      flex-direction: column;
      align-items: flex-start;
      .select-options {
        margin-top: 15px;
      }
    }
  }
</style>
