<template>
  <view class="media-library-warp">
    <view class="tabs">
      <view class="tabs-nav">
        <view
            class="tab-label"
            v-for="tab in tabs" :key="tab.key"
            :class="{active: tab.key === currentTab}"
            @click="switchTab(tab.key)"
        >{{ tab.label }}</view>
      </view>
      <view class="external-options" v-if="mode === 'picker'">
        <button type="primary" size="mini" @click="insertMedia">插入</button>
      </view>
    </view>
    <template v-if="currentTab === 'all'">
      <media-panel
          key="all"
          ref="all"
          media-type="all"
          :selected-count="selectedCount"
      ></media-panel>
    </template>
    <template v-if="currentTab === 'image'">
      <media-panel
          key="image"
          ref="image"
          media-type="image"
          :selected-count="selectedCount"
      ></media-panel>
    </template>
    <template v-if="currentTab === 'video'">
      <media-panel
          key="video"
          ref="video"
          media-type="video"
          :selected-count="selectedCount"
      ></media-panel>
    </template>
  </view>
</template>

<script>
import MediaPanel from "../media-panel"

const tabs = [{
  key: "all",
  label: "全部"
},{
  key: "image",
  label: "图片"
},{
  key: "video",
  label: "视频"
}]

export default {
  name: "uni-media-library",
  emits: ['onInsert'],
  props: {
    // manager: 管理模式，picker: 选择模式
    mode: {
      type: String,
      default: () => "manager"
    },
    // 选择的媒体类型
    mediaTabs: {
      type: Array,
      default: () => []
    },
    // 选择的媒体数量
    selectedCount: {
      type: Number,
      default: () => 0
    }
  },
  components: {
    MediaPanel
  },
  data () {
    return {
      currentTab: ""
    }
  },
  computed: {
    tabs () {
      return this.mediaTabs.length > 0 ? tabs.filter(tab => this.mediaTabs.includes(tab.key)) : tabs
    }
  },
  created () {
    this.currentTab = this.tabs[0].key
  },
  methods: {
    switchTab (tabKey) {
      this.currentTab = tabKey
    },
    insertMedia () {
      const mediaPanel = this.$refs[this.currentTab]
      if (!mediaPanel) return

      const selectedMediaItems = mediaPanel.getSelectedMediaItems()
      if (selectedMediaItems.length <= 0) return

      const mediaList = selectedMediaItems.reduce((list, item) => {
        list.push({
          src: item._src,
          cover: item._cover,
          type: item.type,
          alt: item.alt,
          size: item.size,
          duration: item.duration
        })
        return list
      }, [])

      this.$emit('onInsert', mediaList)
    }
  }
}
</script>

<style lang="scss">
  .media-library-warp {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .tabs {
    padding: 5px 10px 0;
    border-bottom: #f1f1f1 solid 1px;
    display: flex;
    align-items: center;
    .tabs-nav {
      display: flex;
      align-items: center;
      height: 50px;
      background-color: #fff;
      flex: 1;
      .tab-label {
        font-size: 14px;
        color: #333;
        padding: 0 20px;
        cursor: pointer;
        user-select: none;
        &.active {
          color: #007aff;
        }
      }
    }
    .external-options {

    }
  }
</style>
