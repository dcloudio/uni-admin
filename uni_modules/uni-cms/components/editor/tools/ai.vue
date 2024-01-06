<template>
	<toolbarTool type="button" @change="change" :tooltip="{content: 'AI助手'}" :active="active">
		<uni-icons custom-prefix="editor-icon" type="icon-ai" size="24px" color="#b454ff"></uni-icons>
	</toolbarTool>
</template>

<script>
import ToolbarTool from "./base.vue";

export default {
	name: "ai",
	emits: ['change'],
	components: {
		ToolbarTool
	},
  props: {
    active: Boolean,
    disabled: Boolean
  },
	methods: {
		change () {
			this.$emit('change', {
				type: 'ai',
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
