<template>
	<view class="uni-breadcrumb-item">
		<view :class="{
			'uni-breadcrumb-item--slot': true,
			'uni-breadcrumb-item--slot-link': to
			}" @click="navTo">
			<slot />
		</view>
		<i v-if="separatorClass" class="uni-breadcrumb-item--separator" :class="separatorClass" />
		<text v-else class="uni-breadcrumb-item--separator">{{ separator }}</text>
	</view>
</template>
<script>
	export default {
		data() {
			return {}
		},
		props: {
			to: {
				type: [String, Object],
				default: ''
			}
		},
		inject: ['uniBreadcrumb'],
		computed: {
			separator() {
				return this.uniBreadcrumb.separator
			},
			separatorClass() {
				return this.uniBreadcrumb.separatorClass
			}
		},
		methods: {
			navTo() {
				const {
					to,
					$router
				} = this
				if (to && $router) {
					this.replace ?
						$router.replace(to) :
						$router.push(to)

				}
			}
		}
	}
</script>
<style lang="scss">
	.uni-breadcrumb-item {
		display: flex;
		align-items: center;

		&--slot {
			font-size: 14px;
			color: #666;
			padding: 0 10px;

			&-link {
				color: #333;
				font-weight: bold;
				/* #ifndef APP-NVUE */
				cursor: pointer;
				/* #endif */

				&:hover {
					color: #2979ff;
				}
			}
		}

		&--separator {
			font-size: 12px;
			color: #999;
		}

		&:last-child &--separator {
			display: none;
		}
	}
</style>
