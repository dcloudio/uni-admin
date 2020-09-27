<template>
	<view>
		<view class="" v-if="!item.children" >
			<uni-menu-item>
				<uni-icons :type="item.icon" size="18" color="#888" />
				<text class="title">{{item.title}}</text>
			</uni-menu-item>
		</view>
		<uni-sub-menu v-else>
			<template v-slot:title>
				<uni-icons :type="item.icon" size="18" color="#888" />
				<text class="title">{{item.title}}</text>
			</template>
			<sidebar-item
				v-for="child in item.children"
				:item="child"
			/>
		</uni-sub-menu>
	</view>
</template>

<script>
	import sidebarItem from '@/components/sidebar-item/sidebar-item.vue'
	export default {
		name: 'sidebarItem',
		components:{
			sidebarItem
		},
		data() {
			return {
				
			};
		},
		props:{
			item: ''
		}
	}
</script>

<style>
.title {
		margin-left: 5px;
}
.item-bg {
	background-color: #ecf8f3;
}
</style>
