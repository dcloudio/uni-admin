<template>
	<toolbarTool type="button" @change="change" :active="active" :disabled="disabled" :tooltip="{content: '首行缩进'}">
		<uni-icons custom-prefix="editor-icon" type="icon-line-indent" size="18px" style="padding: 3px"></uni-icons>
	</toolbarTool>
</template>

<script>
import ToolbarTool from "./base.vue";

export default {
	name: "line-indent",
	emits: ['change'],
	props: {
		active: [Boolean, String],
    disabled: Boolean
	},
	components: {
		ToolbarTool
	},
	methods: {
		change () {
			this.$emit('change', {
				type: 'textIndent',
				value: '1em'
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
