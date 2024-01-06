<template>
	<toolbarTool type="dropdown" @change="change" :items="items" :active="active" :disabled="disabled" popup-style="width: 170px;" :tooltip="{content: '两端缩进'}">
		<uni-icons custom-prefix="editor-icon" type="icon-space-both" size="18px" style="padding: 3px"></uni-icons>
	</toolbarTool>
</template>

<script>
import ToolbarTool from "./base.vue";

export default {
	name: "space-both",
	emits: ['change'],
	props: {
		active: [Boolean, String],
    disabled: Boolean
	},
	data () {
		return {
			items: [
				{
					text: '0',
					value: '0px',
					active: false
				},{
					text: '8',
					value: '8px',
					active: false
				},{
					text: '16',
					value: '16px',
					active: false
				},{
					text: '32',
					value: '32px',
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
				type: 'space-both',
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
