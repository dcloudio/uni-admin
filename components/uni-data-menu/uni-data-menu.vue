<template>
	<view>
		<uni-nav-menu :active="active" activeKey="url" activeTextColor="#409eff" @select="select">
			<uni-menu-sidebar :data="staticMenu"></uni-menu-sidebar>
		</uni-nav-menu>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				staticMenu: [{
					menu_id: "demo",
					name: '静态功能演示',
					icon: 'uni-icons-list',
					url: "",
					children: [{
						menu_id: "icons",
						name: '图标',
						icon: '',
						url: '/pages/demo/icons/icons',
					}, {
						menu_id: "table",
						name: '表格',
						icon: '',
						url: '/pages/demo/table/table',
					}]
				}]

			};
		}
	}
</script>

<style>

</style>
