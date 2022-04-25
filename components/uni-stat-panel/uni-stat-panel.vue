<template>
	<view class="uni-stat--sum-x mb-m">
		<view v-for="(item, index) in items" :key="index" class="uni-stat--sum-item" :class="[item.value === '今天' ? 'uni-stat--sum-item-width' : '']">
			<view class="uni-stat--sum-item-title">
				{{item.title}}
				<uni-tooltip :text="item.tooltip" />
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
			justify-content: space-evenly;
			flex-wrap: wrap;
			border-radius: 4px;
			padding: 15px;
			box-shadow: -1px -1px 5px 0 rgba(0, 0, 0, 0.1);
		}

		&-item {
			white-space: nowrap;
			text-align: center;
			margin: 10px 30px;

			&-width {
				width: 100px
			}
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

	/* #ifndef APP-NVUE */
	@media screen and (max-width: 500px) {
		.uni-stat--sum-x {
			padding: 15px 0;
			justify-content: space-between;
			flex-wrap: unset;
			overflow-x: auto !important;
		}
		::-webkit-scrollbar {
		    display: none;
		}
	}
	/* #endif */
</style>
