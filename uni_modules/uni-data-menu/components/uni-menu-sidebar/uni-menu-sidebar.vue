<template>
	<view class="pointer">
		<template v-for="(item,index) in data">
			<template v-if="!item.children || !item.children.length">
				<uni-menu-item :index="item">
					<view :class="item.icon"></view>
					<text :class="{title: item.icon}">{{item.text}}</text>
				</uni-menu-item>
			</template>
			<uni-sub-menu v-else :index="item">
				<template v-slot:title>
					<view :class="item.icon"></view>
					<text :class="{title: item.icon}">{{item.text}}</text>
				</template>
				<uni-menu-sidebar class="item-bg"  :data="item.children" :key="item._id" />
			</uni-sub-menu>
		</template>
	</view>
</template>

<script>
	import uniMenuSidebar from '../uni-menu-sidebar/uni-menu-sidebar.vue'
	export default {
		name: 'uniMenuSidebar',
		components: {
			uniMenuSidebar
		},
		props: {
			data: {
				type: Array,
				default () {
					return []
				}
			}
		},
		data() {
			return {};
		},
		computed: {

		},
		methods: {

		}
	}
</script>

<style lang="scss">
	.title {
		margin-left: 5px;
	}
</style>
