<template>
	<toolbarTool type="dropdown" @change="change" :items="items" :active="active" :disabled="disabled" defaultVal="1.75" :tooltip="{content: '行间距'}" popup-style="width: 170px;">
		<uni-icons custom-prefix="editor-icon" type="icon-line-height" size="18px" style="padding: 3px"></uni-icons>
	</toolbarTool>
</template>

<script>
import ToolbarTool from "./base.vue";

export default {
	name: "line-height",
	emits: ['change'],
	props: {
		active: [Boolean, String],
    disabled: Boolean
	},
	data () {
		return {
			items: [
				{
					text: '1',
					value: '1',
					active: false
				},{
					text: '1.5',
					value: '1.5',
					active: false
				},{
					text: '1.75',
					value: '1.75',
					active: false
				},{
					text: '2',
					value: '2',
					active: false
				},{
					text: '3',
					value: '3',
					active: false
				}
			]
		}
	},
	watch: {
		active (newValue) {
			const index = this.items.findIndex(item => item.value === newValue)
			this.items.map((item, mIndex) => {
				this.items[mIndex].active = (index === mIndex)
			})
		}
	},
	components: {
		ToolbarTool
	},
	methods: {
		change (e) {
			this.$emit('change', {
				type: 'lineHeight',
				value: e.value
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
