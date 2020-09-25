<template>
    <scroll-view class="sidebar">
        <!-- TODO -->
		<!-- <menus :data="data"/> -->
		<uni-nav-menu>
			<sidebar-item
				v-for="menu in menuData"
				:item="menu"
			/>
		</uni-nav-menu>
    </scroll-view>
</template>

<script>
	import sidebarItem from '@/components/sidebar-item/sidebar-item.vue'
	export default {
		components:{
			sidebarItem
		},
		data() {
			return {
				menuData: [
					{
						title: '首页',
						path: '/index',
						meta: {
							icon: 'home',
							name: ''
						}
					},{
						title: '设置',
						path: '/config',
						meta: {
							icon: 'gear',
							name: ''
						}
					},
					{
						title: '个人信息',
						path: '/user',
						meta: {
							icon: 'gear',
							name: ''
						},
						children:[{
							title: '邮箱设置',
							path: '/email',
							meta: {
								icon: 'gear',
								name: ''
							}
						},
						{
							title: '个人信息',
							path: '/user',
							meta: {
								icon: 'gear',
								name: ''
							},
							children:[{
								title: '邮箱设置',
								path: '/email',
								meta: {
									icon: 'gear',
									name: ''
								}
							}]
						}]
					},
					{
						title: '设置',
						path: '/config',
						meta: {
							icon: 'gear',
							name: ''
						}
					},
					{
						title: '首页',
						path: '/index',
						meta: {
							icon: 'home',
							name: ''
						}
					},{
						title: '设置',
						path: '/config',
						meta: {
							icon: 'gear',
							name: ''
						}
					},
					{
						title: '个人信息',
						path: '/user',
						meta: {
							icon: 'gear',
							name: ''
						},
						children:[{
							title: '邮箱设置',
							path: '/email',
							meta: {
								icon: 'gear',
								name: ''
							}
						},
						{
							title: '个人信息',
							path: '/user',
							meta: {
								icon: 'gear',
								name: ''
							},
							children:[{
								title: '邮箱设置',
								path: '/email',
								meta: {
									icon: 'gear',
									name: ''
								}
							}]
						}]
					},
					{
						title: '个人信息',
						path: '/user',
						meta: {
							icon: 'gear',
							name: ''
						},
						children:[{
							title: '邮箱设置',
							path: '/email',
							meta: {
								icon: 'gear',
								name: ''
							}
						},
						{
							title: '个人信息',
							path: '/user',
							meta: {
								icon: 'gear',
								name: ''
							},
							children:[{
								title: '邮箱设置',
								path: '/email',
								meta: {
									icon: 'gear',
									name: ''
								}
							}]
						}]
					},
					{
						title: '个人信息',
						path: '/user',
						meta: {
							icon: 'gear',
							name: ''
						},
						children:[{
							title: '邮箱设置',
							path: '/email',
							meta: {
								icon: 'gear',
								name: ''
							}
						},
						{
							title: '个人信息',
							path: '/user',
							meta: {
								icon: 'gear',
								name: ''
							},
							children:[{
								title: '邮箱设置',
								path: '/email',
								meta: {
									icon: 'gear',
									name: ''
								}
							}]
						}]
					},
					
				]
			}
		},
		props:{
			
		}
		
	}
 </script>

<style>
    .sidebar {
		position: fixed;
		top: var(--window-top);
		left: 0;
		width:240px;
        height: 100%;
        box-sizing: border-box;
        border-right: 1px solid #eaecef;
		/* background-color: #28273D; */
    }
	.title {
		margin-left: 5px;
	}
</style>
