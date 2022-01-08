<template>
	<view class="uni-stat--sum-x mb-m">
		<view v-for="(item, index) in items" :key="index" class="uni-stat--sum-item">
			<view class="uni-stat--sum-item-title">
				{{item.title}}
				<view v-if="item.title && item.tooltip" class="uni-icons-help uni-stat-tooltip">
					<view class="uni-stat-tooltip-popup">
						{{item.tooltip}}
					</view>
				</view>
			</view>
			<view class="uni-stat--sum-item-value">{{item.value ? item.value : 0}}</view>
			<view v-if="contrast" class="uni-stat--sum-item-contrast">{{item.contrast ? item.contrast : 0}}</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "uni-stat-panel",
		data() {
			return {

			};
		},
		props: {
			items: {
				type: Array,
				default: () => {
					return []
				}
			},
			contrast: {
				type: Boolean,
				default: false
			}
		}

	}
</script>

<style lang="scss">
	.uni-stat--sum {
		&-x {
			display: flex;
			align-items: left;
			justify-content: space-around;
			flex-wrap: wrap;
			border-radius: 4px;
			padding: 15px;
			box-shadow: -1px -1px 5px 0 rgba(0, 0, 0, 0.1);
		}

		&-item {
			text-align: center;
			margin: 10px 30px;
		}

		&-item-title {
			min-height: 17px;
			font-size: 12px;
			color: #666;
		}

		&-item-value {
			font-size: 24px;
			line-height: 48px;
			font-weight: 700;
			color: #333;
		}

		&-item-contrast {
			font-size: 14px;
			color: #666;
		}
	}

	.uni-stat-tooltip {
		position: relative;
		margin-left: 5px;
		cursor: pointer;
	}

	.uni-stat-tooltip-popup {
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
