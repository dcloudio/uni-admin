<template>
	<view class="uni-table-tr">
		<slot></slot>
	</view>
</template>

<script>
	export default {
		options: {
			virtualHost: true
		},
		data() {
			return {

			};
		}
	}
</script>

<style lang="scss">
	.uni-table-tr {
		display: table-row;
		transition:  all .3s;
	}
</style>
