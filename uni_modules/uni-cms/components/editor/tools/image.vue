<template>
	<view>
		<slot :change="change">
			<toolbarTool type="button" @change="change" :active="active" :disabled="disabled" :tooltip="{content: '插入图片'}">
				<uni-icons custom-prefix="editor-icon" type="icon-image" size="22px" style="padding: 1px;"></uni-icons>
			</toolbarTool>
		</slot>
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
	methods: {
		change() {
			uni.chooseImage({
				count: 1,
				success: async (res) => {
					let filePath = res.tempFilePaths[0]

					this.$emit('change', {
						type: 'image',
						value: {
							src: filePath,
							'data-local': filePath
						}
					})
				}
			})
		}
	}
}
</script>

<style scoped>
@import '@/uni_modules/uni-cms/common/style/editor-icon.css';
</style>
