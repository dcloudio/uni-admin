<template>
	<view class="uni-breadcrumb">
		<slot />
	</view>
</template>
<script>
	export default {
		props: {
			separator: {
				type: String,
				default: '/'
			},
			separatorClass: {
				type: String,
				default: ''
			}
		},

		provide() {
			return {
				uniBreadcrumb: this
			}
		}

	}
</script>
<style lang="scss">
	.uni-breadcrumb {
		display: flex;
	}
</style>
