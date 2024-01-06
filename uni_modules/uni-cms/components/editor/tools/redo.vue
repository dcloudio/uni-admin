<template>
	<toolbarTool type="button" @change="change" :active="active" :disabled="disabled" :tooltip="{content: '恢复', key: ['Ctrl', 'Y']}">
		<uni-icons custom-prefix="editor-icon" type="icon-redo" size="24px"></uni-icons>
	</toolbarTool>
</template>

<script>
import ToolbarTool from "./base.vue";

export default {
	name: "redo",
	emits: ['change'],
	props: {
		active: Boolean,
    disabled: Boolean
	},
	components: {
		ToolbarTool
	},
	methods: {
		change () {
			this.$emit('change', {
				type: 'redo',
				value: undefined
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
