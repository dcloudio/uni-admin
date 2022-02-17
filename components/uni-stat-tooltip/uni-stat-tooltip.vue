<template>
	<view v-if="text" class="uni-icons-help uni-stat-tooltip">
		<view class="uni-stat-tooltip-popup">
			{{text}}
		</view>
	</view>
</template>

<script>
	export default {
		name: "uni-stat-tooltip",
		data() {
			return {

			};
		},
		props: {
			text: {
				type: String,
				default: ''
			}
		}
	}
</script>

<style>
	.uni-stat-tooltip {
		position: relative;
		margin-left: 5px;
		cursor: pointer;
	}

	.uni-stat-tooltip-popup {
		z-index: 1;
		display: none;
		position: absolute;
		left: -85px;
		top: 20px;
		width: 160px;
		background-color: #333;
		border-radius: 8px;
		color: #fff;
		font-size: 12px;
		text-align: left;
		line-height: 16px;
		padding: 12px;
	}

	.uni-stat-tooltip:hover .uni-stat-tooltip-popup {
		display: block;
	}
</style>
