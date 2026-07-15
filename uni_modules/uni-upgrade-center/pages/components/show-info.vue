<template>
	<view class="show-info" @mouseenter="show" @mouseleave="hide">
		<uni-icons class="show-info__icon" type="info" />
		<view v-if="visible" class="show-stable" :style="positionStyle">
			<text>{{ content }}</text>
		</view>
	</view>
</template>

<script>
	const TOOLTIP_GAP = 8
	const VIEWPORT_GAP = 8

	export default {
		props: {
			content: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				visible: false,
				positionStyle: {
					top: '0px',
					left: '0px',
					visibility: 'hidden'
				}
			}
		},
		methods: {
			show() {
				this.visible = true
				this.$nextTick(this.updatePosition)
			},
			hide() {
				this.visible = false
			},
			updatePosition() {
				uni.createSelectorQuery()
					.in(this)
					.select('.show-info')
					.boundingClientRect()
					.select('.show-stable')
					.boundingClientRect()
					.exec(([triggerRect, tooltipRect]) => {
						if (!this.visible || !triggerRect || !tooltipRect) return

						const { windowWidth } = uni.getSystemInfoSync()
						const centeredLeft = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2
						const maxLeft = Math.max(VIEWPORT_GAP, windowWidth - tooltipRect.width - VIEWPORT_GAP)
						const viewportLeft = Math.min(Math.max(centeredLeft, VIEWPORT_GAP), maxLeft)
						const hasRoomAbove = triggerRect.top >= tooltipRect.height + TOOLTIP_GAP

						this.positionStyle = {
							top: `${hasRoomAbove ? -tooltipRect.height - TOOLTIP_GAP : triggerRect.height + TOOLTIP_GAP}px`,
							left: `${viewportLeft - triggerRect.left}px`,
							visibility: 'visible'
						}
					})
			}
		}
	}
</script>

<style lang="scss" scoped>
	$main_color: #fff;
	$main_back_color: #303133;

	.show-info {
		display: inline-flex;
		align-items: center;
		position: relative;
	}

	.show-info__icon {
		padding: 0 10px;
		color: #a8a8a8;
		cursor: pointer;
	}

	.show-stable {
		box-sizing: border-box;
		width: 200px;
		position: absolute;
		padding: 5px 10px;
		background-color: $main_back_color;
		color: $main_color;
		border-radius: 4px;
		border: 1px solid #e9e9eb;
		line-height: 1.5;
		z-index: 99999;
	}
</style>
