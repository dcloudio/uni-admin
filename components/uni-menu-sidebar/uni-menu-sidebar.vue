<template>
	<view class="pointer">
		<template v-for="(item,index) in data">
			<template v-if="!item.children || !item.children.length">
				<uni-menu-item :index="item">
					<view :class="item.icon"></view>
					<text :class="{title: item.icon}">{{item.text}}</text>
				</uni-menu-item>
			</template>
			<template v-else-if="item.children && item.children.length && !item.children.some(item => item.isShow)">
				<uni-menu-item :index="item">
					<view :class="item.icon"></view>
					<text :class="{title: item.icon}">{{item.text}}</text>
				</uni-menu-item>
				<template v-for="(hideItem,index) in item.children">
					<uni-menu-item :index="hideItem" v-show="false">
						<view :class="hideItem.icon"></view>
						<text :class="{title: hideItem.icon}">{{hideItem.text}}</text>
					</uni-menu-item>
				</template>
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
	export default {
		name: 'uniMenuSidebar',
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
		methods: {
			isLeaf(item) {
				if (item.children && item.children.length) {
					if (item.children.some(item => item.isShow)) {
						return false
					} else {
						return true
					}
				} else {
					return true;
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
