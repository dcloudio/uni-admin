<template>
  <view class="media-library-page">
    <uni-media-library></uni-media-library>
  </view>
</template>

<script>
export default {
  name: "uni-media-library-page"
}
</script>

<style lang="scss">
  .media-library-page {
    height: calc(100vh - var(--top-window-height) - 30px);
  }
</style>
