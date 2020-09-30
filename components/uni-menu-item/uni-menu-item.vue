<template>
	<view class="uni-menu-item" :style="{paddingLeft:paddingLeft}" @click="menuItemClick">
		<slot></slot>
	</view>
</template>

<script>
	import rootParent from '@/components/common/mixins/rootParent.js'
	export default {
		name: 'uniMenuItem',
		mixins:[rootParent],
		data() {
			return {

			};
		},
		computed: {
			paddingLeft() {
				return 20+20 * this.rootMenu.SubMenu.length + 'px'
			}
		},
		created() {
			this.init()
		},
		methods: {
			init() {
				this.rootMenu = {
					NavMenu: [],
					SubMenu: []
				}
				this.getParentAll('SubMenu', this)
				this.getParentAll('Menu', this)
			},
			menuItemClick() {
				this.$emit('click');
			},
		}
	}
</script>

<style lang="scss">
	.uni-menu-item {
		display: flex;
		align-items: center;
		padding: 0 20px;
		height: 56px;
		line-height: 56px;
		// color: $menu-text-color;
		// border-bottom: 1px #f5f5f5 solid;
	}

	.uni-menu-item:hover {
		outline: none;
		background-color: $menu-bg-color-hover;
	}
</style>
