<template>
	<toolbarTool type="dropdown" @change="change" :items="items" :active="active" :disabled="disabled" default-val="0em" :tooltip="{content: '字间距'}" popup-style="width: 170px;">
		<uni-icons custom-prefix="editor-icon" type="icon-letter-space" size="18px" style="padding: 3px"></uni-icons>
	</toolbarTool>
</template>

<script>
import ToolbarTool from "./base.vue";

export default {
	name: "letter-space",
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
					value: '0em',
					active: false
				},{
					text: '0.5',
					value: '0.5em',
					active: false
				},{
					text: '1',
					value: '1em',
					active: false
				},{
					text: '1.5',
					value: '1.5em',
					active: false
				},{
					text: '2',
					value: '2em',
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
				type: 'letterSpacing',
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
