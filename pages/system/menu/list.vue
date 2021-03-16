<template>
	<view>
		<view class="uni-tabs__header">
			<view class="uni-tabs__nav-wrap">
				<view class="uni-tabs__nav-scroll">
					<view class="uni-tabs__nav">
						<view @click="switchTab('menus')" :class="{'is-active':currentTab==='menus'}" class="uni-tabs__item">
							菜单管理
						</view>
						<view @click="switchTab('pluginMenus')" v-if="pluginMenus.length" :class="{'is-active':currentTab==='pluginMenus'}"
						 class="uni-tabs__item">
							待添加菜单
							<uni-badge class="menu-badge" :text="pluginMenus.length" type="error"></uni-badge>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view v-show="currentTab==='menus'">
			<view class="uni-header" style="border-bottom: 0;margin-bottom: -15px;">
				<view class="uni-group">
					<button @click="navigateTo('./add')" size="mini" plain="true" type="primary">新增一级菜单</button>
				</view>
				<view class="uni-group">

				</view>
			</view>
			<view class="uni-container">
				<uni-table :loading="loading" :emptyText="errMsg || '没有更多数据'" border stripe>
					<uni-tr>
						<uni-th align="center">排序</uni-th>
						<uni-th width="200" align="center">名称</uni-th>
						<uni-th align="center">标识</uni-th>
						<uni-th align="center">URL</uni-th>
						<uni-th width="100" align="center">是否启用</uni-th>
						<uni-th width="160" align="center">操作</uni-th>
					</uni-tr>
					<uni-tr v-for="(item,index) in menus" :key="index">
						<uni-td align="center">{{item.sort}}</uni-td>
						<uni-td>{{item.title}}</uni-td>
						<uni-td>{{item.menu_id}}</uni-td>
						<uni-td>{{item.url}}</uni-td>
						<uni-td align="center" :class="{'menu-disable':!item.enable}">{{item.enable?'已启用':'未启用'}}</uni-td>
						<uni-td align="center">
							<view class="uni-group">
								<button v-if="!item.url" @click="navigateTo('./add?parent_id='+item.menu_id, false)" class="uni-button" size="mini" type="primary">子菜单</button>
								<button @click="navigateTo('./edit?id='+item._id, false)" class="uni-button" size="mini" type="primary">修&nbsp;&nbsp;&nbsp;改</button>
								<button v-if="item.menu_id !== 'system_menu' && item.menu_id !== 'system_management'"
								 @click="confirmDelete(item)" class="uni-button" size="mini" type="warn">删&nbsp;&nbsp;&nbsp;除</button>
							</view>
						</uni-td>
					</uni-tr>
				</uni-table>
			</view>
		</view>
		<view v-show="currentTab==='pluginMenus'">
			<view class="uni-header" style="border-bottom: 0;margin-bottom: -15px;">
				<view class="uni-group">
					<button style="width: 130px;" @click="addPluginMenus" size="mini" type="primary">添加选中的菜单</button>
				</view>
				<view class="uni-group"></view>
			</view>
			<view class="uni-container">
				<uni-table ref="pluginMenusTable" type="selection" border stripe @selection-change="pluginMenuSelectChange">
					<uni-tr>
						<uni-th align="center">名称（标识）</uni-th>
						<uni-th align="center">URL</uni-th>
						<uni-th align="center">插件菜单 json 文件</uni-th>
					</uni-tr>
					<uni-tr v-for="(item,index) in pluginMenus" :key="index">
						<uni-td>{{item.name}}（{{item.menu_id}}）</uni-td>
						<uni-td>{{item.url}}</uni-td>
						<uni-td>{{item.json}}</uni-td>
					</uni-tr>
				</uni-table>
				<view class="uni-sub-title" style="margin-top: 15px;">
					以上待添加菜单来自于三方插件，添加后，将显示在菜单管理中，若不希望显示在上述表格中时，可手动删除项目中对应的`插件id-menu.json`文件。
				</view>
			</view>
		</view>
		<!-- #ifndef H5 -->
		<fix-window />
		<!-- #endif -->
	</view>
</template>

<script>
	import {
		mapActions
	} from 'vuex'
	// 查找插件注册的菜单列表（目前仅在开发模式启用，仅限 admin 角色）
	const pluginMenuJsons = []
	if (process.env.NODE_ENV === 'development') {
		const rootModules = require.context(
			'../../../',
			false,
			/-menu.json$/
		)
		rootModules.keys().forEach(function(key) {
			const json = key.substr(2)
			rootModules(key).forEach(item => {
				item.json = json
				pluginMenuJsons.push(item)
			})
		})
		const pluginModules = require.context(
			'../../../uni_modules/',
			true,
			/menu.json$/
		)
		pluginModules.keys().forEach(function(key) {
			const json = 'uni_modules' + key.substr(1)
			pluginModules(key).forEach(item => {
				item.json = json
				pluginMenuJsons.push(item)
			})
		})
	}

	// 菜单扁平化
	function flatMenu(menu, result, depth = 0) {
		menu.title = (depth ? '　'.repeat(depth) + '|-' : '') + menu.name
		result.push(menu)
		if (menu.children) {
			flatMenus(menu.children, result, depth + 1)
		}
	}

	function flatMenus(menus, result = [], depth = 0) {
		menus.forEach(menu => flatMenu(menu, result, depth))
		return result
	}

	export default {
		data() {
			return {
				loading: true,
				menus: [],
				errMsg: '',
				currentTab: 'menus',
				selectedPluginMenuIndexs: []
			}
		},
		computed: {
			pluginMenus() {
				const menus = []
				if (!this.$hasRole('admin')) {
					return menus
				}
				const dbMenus = this.menus
				if (!dbMenus.length) {
					return menus
				}
				pluginMenuJsons.forEach(menu => {
					// 查找尚未被注册到数据库中的菜单
					if (!dbMenus.find(item => item.menu_id === menu.menu_id)) {
						menus.push(menu)
					}
				})
				return menus
			},
		},
		watch: {
			pluginMenus(val) {
				if (!val.length) {
					this.currentTab = 'menus'
				}
			}
		},
		onLoad() {
			this.loadData()
		},
		methods: {
			...mapActions({
				init: 'app/init'
			}),
			switchTab(tab) {
				this.currentTab = tab
			},
			loadData() {
				this.loading = true
				this.$request('system/menu/list', {}, {
					showModal: false
				}).then(res => {
					this.menus = flatMenus(res)
				}).catch(err => {
					this.errMsg = err.message
				}).finally(() => {
					this.loading = false
				})
			},
			navigateTo(url, clear) { // clear 表示刷新列表时是否清除当前页码，true 表示刷新并回到列表第 1 页，默认为 true
				uni.navigateTo({
					url,
					events: {
						refreshData: () => {
							this.loadData(clear)
						}
					}
				})
			},
			confirmDelete(menu) {
				let content = '是否删除该菜单？'
				// 有子菜单
				if (this.menus.find(item => item.parent_id === menu.menu_id)) {
					content = '是否删除该菜单及其所有子菜单？'
				}
				uni.showModal({
					title: '提示',
					content,
					success: (res) => {
						if (!res.confirm) {
							return
						}
						uni.showLoading({
							mask: true
						})
						this.$request('system/menu/delete', {
							id: menu._id
						}).then(() => {
							this.init()
							this.loadData()
						}).finally(() => {
							uni.hideLoading()
						})
					}
				})
			},
			pluginMenuSelectChange(e) {
				this.selectedPluginMenuIndexs = e.detail.index
			},
			addPluginMenus(confirmContent) {
				if (!this.selectedPluginMenuIndexs.length) {
					return uni.showModal({
						title: '提示',
						content: '请选择要添加的菜单！',
						showCancel: false
					})
				}
				const pluginMenus = this.pluginMenus
				const menus = []
				this.selectedPluginMenuIndexs.forEach(i => {
					const menu = pluginMenus[i]
					if (menu) {
						// 拷贝一份，移除 json 字段
						const dbMenu = JSON.parse(JSON.stringify(menu))
						delete dbMenu.json
						menus.push(dbMenu)
					}
				})
				uni.showModal({
					title: '提示',
					content: '您确认要添加已选中的菜单吗？',
					success: (res) => {
						if (!res.confirm) {
							return
						}
						uni.showLoading({
							mask: true
						})
						const checkAll = menus.length === pluginMenus.length
						uniCloud.database().collection('opendb-admin-menus').add(menus).then(res => {
							this.init()
							uni.showModal({
								title: '提示',
								content: '添加菜单成功！',
								showCancel: false,
								success: () => {
									this.$refs.pluginMenusTable.clearSelection()
									if (checkAll) {
										this.currentTab = 'menus'
									}
									this.loadData()
								}
							})
						}).catch(err => {
							uni.showModal({
								title: '提示',
								content: err.message,
								showCancel: false
							})
						}).finally(() => {
							uni.hideLoading()
						})
					}
				})
			}
		}
	}
</script>
<style>
	/* #ifndef H5 */
	page {
		padding-top: 85px;
	}
	/* #endif */
	.menu-disable {
		color: red;
	}

	.menu-badge {
		position: absolute;
		top: 0;
		right: 5px;
	}
</style>
