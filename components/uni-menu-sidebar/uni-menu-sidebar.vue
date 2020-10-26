<template>
	<view class="pointer">
		<template v-for="(item,index) in data">
			<template v-if="!item.children || !item.children.length">
				<uni-menu-item :index="item.url || 'url' + index" @click="clickMenuItem(item)">
					<view :class="item.icon"></view>
					<text :class="{title: item.icon}">{{item.name}}</text>
				</uni-menu-item>
			</template>
			<uni-sub-menu v-else :index="item.menu_id || 'url' + index">
				<template v-slot:title>
					<view :class="item.icon"></view>
					<text :class="{title: item.icon}">{{item.name}}</text>
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
			return {
				route: ''
			};
		},
		computed: {
			// hasChildActive() {
			// 	return this.activeUrl(this.active, this.item)
			// }
		},
		methods: {
			clickMenuItem(menu) {
				// #ifdef H5
				if (menu.url.indexOf('http') === 0) {
					return window.open(menu.url)
				}
				// #endif
				// TODO 后续要调整
				uni.redirectTo({
					url: menu.url,
					fail() {
						uni.showModal({
							title: '提示',
							content: '页面 ' + menu.url + ' 跳转失败',
							showCancel: false
						})
					}
				})
			},
			activeUrl(active, item) {
				if (item.url === active) {
					return true
				}
				const children = item.children
				if (children && children.length) {
					const childItem = children.find(item => this.activeUrl(active, item))
					if (childItem) {
						return true
					}
				}
			}
		}
	}
</script>

<style lang="scss">
	.title {
		margin-left: 5px;
	}
</style>
