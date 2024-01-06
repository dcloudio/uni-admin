<template>
	<view>
		<slot :change="change">
			<toolbarTool type="button" @change="change" :active="active" :disabled="disabled" :tooltip="{content: '插入图片'}">
				<uni-icons custom-prefix="editor-icon" type="icon-image" size="22px" style="padding: 1px;"></uni-icons>
			</toolbarTool>
		</slot>
    <uni-drawer
        class="insert-image-drawer"
        v-if="drawerWidth"
        ref="insertImageDrawer"
        mode="right"
        :width="drawerWidth"
    >
      <uni-media-library
          mode="picker"
          :selected-count="1"
          :media-tabs="['image']"
          @onInsert="onInsert"
      ></uni-media-library>
    </uni-drawer>
	</view>
</template>

<script>
import ToolbarTool from "./base.vue";

export default {
	name: "tool-image",
	emits: ['change'],
	props: {
		active: Boolean,
    disabled: Boolean
	},
	components: {
		ToolbarTool
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
      this.$refs.insertImageDrawer.open()
		},
    async onInsert (selectedMediaList) {
      const tcbCloudFiles = selectedMediaList.filter(item => item.type === 'image' && item.src.startsWith('cloud://'))
	    let fileList = []
	    if (tcbCloudFiles.length) {
		    const res = await uniCloud.getTempFileURL({
			    fileList: [].concat.call([], ...tcbCloudFiles.map(item => [item.src, item.cover])).filter(item => item)
		    })
		    fileList = res.fileList
	    }


	    selectedMediaList.forEach(media => {
		    const cloudFile = fileList.find(item => item.fileID === media.src)

		    media._src = media.src

		    if (cloudFile) {
			    media.src = cloudFile?.tempFileURL ?? media._src
		    }
	    })

			this.$refs.insertImageDrawer.close()

	    // 目前仅支持单张插入
	    const selectedMedia = selectedMediaList[0]
      this.$emit('change', {
        type: 'image',
        value: {
          src: selectedMedia.src,
          alt: selectedMedia.alt,
          data: {
            source: selectedMedia._src ?? selectedMedia.src
          }
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
