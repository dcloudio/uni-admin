<template>
	<scroll-view class="sidebar" scroll-y="true">
<!-- 		<uni-data-menu v-model="current" collection="opendb-admin-menus" gettree field="url as value, name as text, menu_id, icon" orderby="sort asc" active-text-color="#409eff">
			<uni-menu-sidebar :data="staticMenu"></uni-menu-sidebar>
		</uni-data-menu> -->
		<uni-nav-menu :uniqueOpened="true" :active="active" activeKey="url" activeTextColor="#409eff" @select="select">
			<uni-menu-sidebar :data="navMenu"></uni-menu-sidebar>
			<uni-menu-sidebar :data="staticMenu"></uni-menu-sidebar>
		</uni-nav-menu>
	</scroll-view>
</template>

<script>
	import {
		mapState,
		mapActions
	} from 'vuex'
	import config from '@/admin.config.js'
	export default {
		data() {
			return {
				...config.sideBar,
				defaultValue: '',
				current: ''
			}
		},
		computed: {
			...mapState('app', ['inited', 'navMenu', 'active'])
		},
		// #ifdef H5
		watch: {
			$route: {
				immediate: true,
				handler(newRoute, oldRoute) {
					if (newRoute.path !== (oldRoute && oldRoute.path)) {
						this.changeMenuActive(newRoute.path)
					}
				}
			},
			current: {
				immediate: true,
				handler(newUrl) {
					this.select(newUrl)
				}
			}
		},
		// #endif
		methods: {
			...mapActions({
				changeMenuActive: 'app/changeMenuActive'
			}),
			select(e) {
				let url = e.url

				if (!url) {
					url = this.active
					this.current = url
				}
				this.clickMenuItem(url)
			},
			clickMenuItem(url) {
				// #ifdef H5
				if (url.indexOf('http') === 0) {
					return window.open(url)
				}
				// #endif

				// url 开头可用有 / ，也可没有
				if (url[0] !== '/' && url.indexOf('http') !== 0) {
					url = '/' + url
				}
				// TODO 后续要调整
				uni.redirectTo({
					url: url,
					fail: () => {
						uni.showModal({
							title: '提示',
							content: '页面 ' + url + ' 跳转失败',
							showCancel: false
						})
					}
				})
			},
		}
	}
</script>

<style lang="scss">
	.sidebar {
		position: fixed;
		top: var(--top-window-height);
		width: 240px;
		height: calc(100vh - (var(--top-window-height)));
		box-sizing: border-box;
		border-right: 1px solid darken($left-window-bg-color, 8%);
		background-color: $left-window-bg-color;
		padding-bottom: 10px;
	}

	.title {
		margin-left: 5px;
	}
</style>
