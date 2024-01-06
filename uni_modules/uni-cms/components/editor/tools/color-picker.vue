<template>
<view class="color-panel">
	<view class="colors">
		<view :style="{background: clearColor}" class="color" @click="change(null)">
			<text class="reset"></text>
		</view>
		<view v-for="color in colors" :style="{background: color}" class="color" @click="change(color)" :key="color"></view>
	</view>
	<view class="custom">
		<view class="color-preview" :style="{background: customColor}"></view>
		<input placeholder="color" class="input" v-model="customColor" />
		<button size="mini" class="btn" @click="change()">确定</button>
	</view>
</view>
</template>

<script>
export default {
	name: "color",
	emits: ['change'],
	props: {
		clearColor: String
	},
	data() {
		return {
			colors: [
				"#505050", "#666666", "#999999", "#CACACA", "#D8D8D8", "#E8E8E8", "#F2F2F2", "#F8F8F8", "#FFFFFF", "#F04142", "#EB28BD", "#8F2BFF", "#1A74FF", "#00ABAB", "#00AA54", "#70B500", "#FFBA12", "#FF7528", "#996D39", "#FFD1D1", "#FFBAEF", "#E0C4FF", "#C1E1F7", "#C7F2F2", "#C2EDD8", "#DEF7B5", "#FFEBBA", "#FFD8C2", "#F5D8B6", "#FF8585", "#FF87E3", "#C087FF", "#599AFF", "#5ED1D1", "#69CF9C", "#ACDE5B", "#FFD05E", "#FFA775", "#C79254", "#FF5E5E", "#F54CCD", "#AE66FF", "#3D89FF", "#39C4C4", "#3BBF7D", "#8ECC29", "#FFC740", "#FF8E4F", "#C0833B", "#B83232", "#B31E90", "#641EB3", "#1356BD", "#008585", "#008542", "#508200", "#CC950E", "#B3521C", "#815A2C", "#7A2122", "#75145E", "#4B1785", "#0E408C", "#005C5C", "#005E2F", "#314F00", "#856109", "#662F10", "#634119",
			],
			customColor: '#000000'
		}
	},
	methods: {
		change (color) {
			this.$emit('change', {
				color: color === undefined ? this.customColor: color
			})
		}
	}
}
</script>

<style scoped lang="scss">
// #ifdef H5
@import '@/uni_modules/uni-cms/common/style/editor-icon.css';
// #endif
.color-panel {
	padding: 5px;
	.colors {
		.color {
			display: inline-flex;
			width: 18px;
			height: 18px;
			margin: 0 3px;
			border-radius: 3px;
			box-sizing: border-box;
			cursor: pointer;
			padding: 1px;
			border: transparent solid 1px;
			position: relative;
			&:hover, &.active {
				border: #bfbfbf solid 1px;
			}
			.reset {
				display: block;
				position: absolute;
				top: 7px;
				left: -2px;
				z-index: 1;
				width: 20px;
				height: 0;
				border-radius: 2px;
				border-bottom: 2px solid #f04142;
				transform: rotate(45deg);
			}
		}
	}
	.custom {
		margin-top: 10px;
		padding-top: 10px;
		border-top: #ccc solid 2px;
		display: flex;
		align-items: center;
		.color-preview {
			width: 24px;
			height: 24px;
			border-radius: 3px;
		}
		.input {
			flex: 1;
			margin: 0 5px;
			border: #ccc solid 1px;
			border-radius: 3px;
			padding: 2px 3px;
			box-sizing: border-box;
			font-size: 13px;
			height: 24px;
		}
		.btn {
			height: 24px;
			line-height: 24px;
			width: 60px;
		}
	}
}
</style>
