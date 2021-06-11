<template>
	<view>
		<uni-nav-menu :active="value" activeKey="value" :activeTextColor="activeTextColor" :uniqueOpened="uniqueOpened"
			@select="onSelect">
			<uni-menu-sidebar :data="userMenu"></uni-menu-sidebar>
			<slot></slot>
		</uni-nav-menu>
	</view>
</template>

<script>
	import { buildMenus } from './util.js'
	export default {
		data() {
			return {
				menus: []
			};
		},
		mixins: [uniCloud.mixinDatacom],
		props: {
			// 当前激活菜单的 url
			value: {
				type: String,
				default: ''
			},
			// 当前激活菜单的文字颜色
			activeTextColor: {
				type: String,
				default: '#42B983'
			},
			// 是否只保持一个子菜单的展开
			uniqueOpened: {
				type: Boolean,
				default: false
			}
		},
		watch: {
			localdata: {
				handler(newval) {
					if (this.hasLocalData(newval)) {
						this.userMenu = newval
					}
				},
				immediate: true
			}
		},
		created() {
			if (this.hasLocalData(this.localdata)) return
			this.load()
		},
		computed:{
			userMenu() {
				return this.getUserMenu(this.menus)
			}
		},
		methods: {
			getUserMenu(menuList) {
				const {
					permission,
					role
				} = uniCloud.getCurrentUserInfo()
				// console.log(1111, uniCloud.getCurrentUserInfo())
				// 标记叶子节点
				menuList.map(item => {
					if (!menuList.some(subMenuItem => subMenuItem.parent_id === item.menu_id)) {
						item.isLeafNode = true
					}
				})

				// 删除无权限访问的菜单
				if (!role.includes('admin')) {
					menuList = menuList.filter(item => {
						if (item.isLeafNode) {
							if (item.permission && item.permission.length) {
								return item.permission.some(item => permission.indexOf(item) > -1)
							}
							return false
						}
						return true
					})
				}
				return buildMenus(menuList)
			},
			onSelect(menu) {
				this.$emit('select', menu)
				this.$emit('input', menu.value)
			},
			hasLocalData(value) {
				return Array.isArray(value) && value.length > 0
			},
			load() {
				if (this.mixinDatacomLoading == true) {
					return
				}
				this.mixinDatacomLoading = true

				this.mixinDatacomGet().then((res) => {
					this.mixinDatacomLoading = false
					const {
						data,
						count
					} = res.result
					this.menus = data
				}).catch((err) => {
					this.mixinDatacomLoading = false
					this.mixinDatacomErrorMessage = err
				})
			}
		},
	}
</script>

<style>

</style>
