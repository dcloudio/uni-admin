<template>
	<view class="uni-breadcrumb-x">
		<uni-breadcrumb separator="/">
			<uni-breadcrumb-item v-for="(route, index) in routes" :key="index" :to="route.to && route.to.path||''">{{route.name}}</uni-breadcrumb-item>
		</uni-breadcrumb>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex'

	export default {
		name: "uni-stat-breadcrumb",
		data() {
			return {

			};
		},
		computed: {
			...mapState('app', ['routes'])
		}
	}
</script>

<style lang="scss" scoped>
	.uni-breadcrumb-x {
		flex: 1;
		display: flex;
		padding: 0 5px;
		align-items: center;
		::v-deep {
			.uni-breadcrumb-item--slot-link{
				color: #6a6a6a;
				font-weight: normal;
				&:hover{
					color: $uni-color-primary;
				}
			}
			.uni-breadcrumb-item:last-child{
				.uni-breadcrumb-item--slot{
					color: #3a3a3a;
					font-weight: bold;
				}
			}
		}
	}
</style>
