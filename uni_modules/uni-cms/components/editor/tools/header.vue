<template>
	<toolbarTool type="dropdown" @change="change" :items="items" :active="active" :disabled="disabled" :tooltip="{content: '标题'}" popup-style="width: 100px;">
		<view style="width: 24px;height: 24px;">{{ activeText }}</view>
	</toolbarTool>
</template>

<script>
import ToolbarTool from "./base.vue";

export default {
	name: "tool-header",
	emits: ['change'],
	props: {
		active: [Boolean, Number],
    disabled: Boolean
	},
	data () {
		return {
			items: [
				{
					text: 'H1',
					value: 1,
					active: false,
					style: {
						fontSize: '24px',
						fontWeight: 'bold'
					}
				},{
					text: 'H2',
					value: 2,
					active: false,
					style: {
						fontSize: '22px',
						fontWeight: 'bold'
					}
				},{
					text: 'H3',
					value: 3,
					active: false,
					style: {
						fontSize: '20px',
						fontWeight: 'bold'
					}
				},{
					text: 'H4',
					value: 4,
					active: false,
					style: {
						fontSize: '18px',
						fontWeight: 'bold'
					}
				},{
					text: 'H5',
					value: 5,
					active: false,
					style: {
						fontSize: '16px',
						fontWeight: 'bold'
					}
				},{
					text: 'H6',
					value: 6,
					active: false,
					style: {
						fontSize: '14px',
						fontWeight: 'bold'
					}
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
	computed: {
		activeText () {
			const item = this.items.find(item => item.active)

			if (item) return item.text

			return this.items[0].text
		}
	},
	components: {
		ToolbarTool
	},
	methods: {
		change (e) {
			this.$emit('change', {
				type: 'header',
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
