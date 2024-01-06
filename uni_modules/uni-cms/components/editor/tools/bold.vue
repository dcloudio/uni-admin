<template>
	<toolbarTool type="button" @change="change" :active="active" :disabled="disabled" :tooltip="{content: '加粗', key: ['Ctrl', 'B']}">
		<uni-icons custom-prefix="editor-icon" type="icon-bold" size="24px"></uni-icons>
	</toolbarTool>
</template>

<script>
import ToolbarTool from "./base.vue";

export default {
	name: "bold",
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
			this.$emit('change', {
				type: 'bold',
				value: undefined,
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
