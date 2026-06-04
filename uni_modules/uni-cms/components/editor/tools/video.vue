<template>
	<view>
    <toolbarTool type="button" @change="change" :tooltip="{content: '插入视频'}" :disabled="disabled" :active="active">
      <uni-icons custom-prefix="editor-icon" type="icon-video" size="24px"></uni-icons>
    </toolbarTool>
    <uni-drawer
        class="insert-image-drawer"
        v-if="drawerWidth"
        ref="insertVideoDrawer"
        mode="right"
        :width="drawerWidth"
    >
      <uni-media-library
          mode="picker"
          :selected-count="1"
          :media-tabs="['video']"
          @onInsert="onInsert"
      ></uni-media-library>
    </uni-drawer>
  </view>
</template>

<script>
import ToolbarTool from "./base.vue";

export default {
	name: "mediaVideo",
	emits: ['change'],
	components: {
		ToolbarTool
	},
  props: {
    active: Boolean,
    disabled: Boolean
  },
  data () {
    return {
      drawerWidth: null
    }
  },
  mounted () {
    const sysinfo = uni.getSystemInfoSync()
    this.drawerWidth = sysinfo.windowWidth * .8
  },
	methods: {
    change() {
      this.$refs.insertVideoDrawer.open()
    },
    onInsert (selectedMediaList) {
      this.$refs.insertVideoDrawer.close()

      this.$emit('change', {
        type: 'mediaVideo',
        value: {
          poster: selectedMediaList[0].cover,
          src: selectedMediaList[0].src,
          duration: selectedMediaList[0].duration
        }
      })
    }
	}
}
</script>

<style scoped>
// #ifdef H5
@import '@/uni_modules/uni-cms/common/style/editor-icon.css';
// #endif
</style>
