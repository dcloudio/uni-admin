<template>
	<toolbarTool type="dropdown" @change="change" :items="items" :active="active" :disabled="disabled" popup-style="width: 170px;"  :tooltip="{content: '列表'}">
		<uni-icons custom-prefix="editor-icon" :type="activeIcon" size="24px"></uni-icons>
	</toolbarTool>
</template>

<script>
import ToolbarTool from "./base.vue";

export default {
	name: "tool-list",
	emits: ['change'],
	props: {
		active: [Boolean, String],
    disabled: Boolean
	},
	data () {
		return {
			items: [
				{
					icon: 'icon-ul',
					text: '有序列表',
					value: 'ordered',
					active: false
				},{
          icon: 'icon-ol',
          text: '无序列表',
          value: 'bullet',
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
				type: 'list',
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
