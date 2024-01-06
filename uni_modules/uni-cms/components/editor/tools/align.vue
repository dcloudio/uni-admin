<template>
	<toolbarTool type="dropdown" @change="change" :items="items" :active="active" :disabled="disabled" :tooltip="{content: '对齐方式'}" popup-style="width: 170px;">
		<uni-icons custom-prefix="editor-icon" :type="activeIcon" size="24px"></uni-icons>
	</toolbarTool>
</template>

<script>
import ToolbarTool from "./base.vue";

export default {
	name: "align",
	emits: ['change'],
	props: {
		active: [Boolean, String],
    disabled: Boolean
	},
	data () {
		return {
			items: [
				{
					icon: 'icon-align-left',
					text: '左对齐',
					value: 'left',
					active: false
				},{
					icon: 'icon-align-center',
					text: '居中对齐',
					value: 'center',
					active: false
				},{
					icon: 'icon-align-right',
					text: '右对齐',
					value: 'right',
					active: false
				},{
					icon: 'icon-align-justify',
					text: '两端对齐',
					value: 'justify',
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
	computed: {
		activeIcon () {
			const item = this.items.find(item => item.active)

			if (item) return item.icon

			return this.items[0].icon
		}
	},
	components: {
		ToolbarTool
	},
	methods: {
		change (e) {
			this.$emit('change', {
				type: 'align',
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
