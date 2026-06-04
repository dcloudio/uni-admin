<template>
  <view class="storage-selector">
    <view class="storage-selector-btn" @click="showMenu = !showMenu">
      <text class="storage-label">{{ currentName }}</text>
      <text class="ri-arrow-down-s-line storage-arrow"></text>
    </view>
    <view class="storage-menu" v-if="showMenu && storageOptions.length > 1">
      <view
        class="storage-menu__item"
        v-for="opt in storageOptions"
        :key="opt.provider"
        :class="{ active: opt.provider === currentProvider, disabled: !opt.isOpen && opt.provider !== 'internal' }"
        @click="onChange(opt)"
      >
        <view class="storage-menu__label">
          <text>{{ opt.name }}</text>
          <text class="storage-menu__badge" v-if="!opt.isOpen && opt.provider !== 'internal'">未开通</text>
        </view>
        <view class="storage-menu__msg" v-if="!opt.isOpen && opt.message">
          <text>{{ opt.message }}</text>
        </view>
      </view>
    </view>
    <view class="mask" v-if="showMenu" @click="showMenu = false"></view>
  </view>
</template>

<script>
export default {
  name: "storage-bucket-selector",
  emits: ['onChange'],
  props: {
    currentProvider: {
      type: String,
      default: () => 'internal'
    }
  },
  data () {
    return {
      storageOptions: [
        { provider: 'internal', name: '内置存储', isOpen: true }
      ],
      showMenu: false
    }
  },
  computed: {
    currentName () {
      const opt = this.storageOptions.find(s => s.provider === this.currentProvider)
      return opt ? opt.name : '内置存储'
    }
  },
  mounted () {
    this.loadStorageConfig()
  },
  methods: {
    onChange (opt) {
      if (!opt.isOpen) return
      this.showMenu = false
      this.$emit('onChange', opt.provider)
    },
    async loadStorageConfig () {
      try {
        const uniMediaLibraryCo = uniCloud.importObject('uni-media-library-co', { customUI: true })
        const result = await uniMediaLibraryCo.getStorageConfig()
        this.storageOptions = result.data.map(opt => ({
          ...opt,
          isOpen: opt.isOpen !== false
        }))
      } catch (e) {
        this.storageOptions = [{ provider: 'internal', name: '内置存储', isOpen: true }]
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../font/remixicon.css";

.storage-selector {
  position: relative;
}
.storage-selector-btn {
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0 16px;
  border-radius: 6px;
  border: 1px solid #d9d9d9;
  background-color: #fff;
  cursor: pointer;
  font-size: 14px;
  gap: 8px;
  user-select: none;
  transition: all 0.2s;
  &:hover {
    border-color: #1677ff;
    color: #1677ff;
    .storage-label { color: #1677ff; }
  }
  .storage-label {
    color: #1f1f1f;
    font-weight: 500;
    transition: color 0.2s;
  }
  .storage-arrow {
    color: #bfbfbf;
    font-size: 16px;
    line-height: 1;
    margin-left: 4px;
  }
}
.storage-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 6px;
  min-width: 200px;
  margin-top: 6px;

  &__item {
    padding: 10px 12px;
    font-size: 14px;
    cursor: pointer;
    border-radius: 6px;
    color: #434343;
    transition: background-color 0.2s;
    &:hover:not(.disabled) {
      background: #f5f5f5;
    }
    &.active {
      color: #1677ff;
      background: #eef2ff;
      font-weight: 500;
    }
    &.disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }
  &__label {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  &__badge {
    font-size: 12px;
    color: #8c8c8c;
    background: #f5f5f5;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: normal;
  }
  &__msg {
    margin-top: 6px;
    font-size: 12px;
    color: #8c8c8c;
    line-height: 1.4;
  }
}
.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}
</style>
