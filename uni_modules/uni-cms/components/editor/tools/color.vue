<template>
	<toolbarTool type="dropdown" split :active="active" :disabled="disabled" popup-style="width: 250px;" :tooltip="{content: '文字颜色'}" @change="change">
		<view class="icon-group">
			<uni-icons custom-prefix="editor-icon" type="icon-color" size="20px"></uni-icons>
			<span class="active-color" :style="{background: lastColor ? lastColor: '#000000'}"></span>
		</view>
		<template v-slot:popup="{change}">
			<color-picker @change="change" clear-color="#000000"></color-picker>
		</template>
	</toolbarTool>
</template>

<script>
import ToolbarTool from "./base.vue";
import ColorPicker from "./color-picker.vue";

export default {
	name: "color",
	emits: ['change'],
	props: {
		active: [Boolean, String, Array],
    disabled: Boolean
	},
	data () {
		return {
			lastColor: undefined
		}
	},
	components: {
		ColorPicker,
		ToolbarTool
	},
	methods: {
		change (e) {
			if (e && e.hasOwnProperty('color')) {
				this.lastColor = e.color
			}
			this.$emit('change', {
				type: 'color',
				value: e && e.color ? e.color: this.lastColor
			})
		}
	}
}
</script>

<style scoped lang="scss">
// #ifdef H5
@import '@/uni_modules/uni-cms/common/style/editor-icon.css';
// #endif
.icon-group {
	position: relative;
	padding: 2px;
	.active-color {
		content: '';
		width: 14px;
		height: 2px;
		position: absolute;
		bottom: 4px;
		left: 5px;
	}
}
</style>
