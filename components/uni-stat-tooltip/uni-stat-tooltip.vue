<template>
	<view v-if="text" class="uni-icons-help uni-stat-tooltip">
		<slot />
		<view class="uni-stat-tooltip-popup" :style="style">
			<!-- <pre>{{text}}</pre> -->
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
			},
			width: {
				type: Number,
				default: 160
			},
			placement: {
				type: String,
				default: 'bottom'
			},
		},
		computed: {
			style() {
				let str = `width: ${this.width}px`
				if (this.placement === 'left') {
					str = str + ';left: 0;'
				}
				return str
			}
		},
		mounted() {
			// uni.createIntersectionObserver(this).relativeTo('.scroll',{bottom: 100}).observe('.test', (res) => {
			//   console.log(res);
			// })
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
		left: 0;
		top: 20px;
		width: 160px;
		white-space: normal;
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
