<template>
	<view class="uni-sub-menu">
		<view class="uni-sub-menu__title" :style="{paddingLeft:paddingLeft}" @click="tiggerMenuItem">
			<view class="uni-sub-menu__title-sub">
				<slot name="title"></slot>
			</view>
			<uni-icons class="uni-sub-menu__icon" type="arrowdown" :class="{transition:height!==0}" color="#bbb" size="14"></uni-icons>
		</view>
		<view class="uni-sub-menu__content" :style="{display: isOpen ? 'block' : 'none'}">
			<view id="content--hook">
				<slot></slot>
			</view>
		</view>
	</view>
</template>

<script>
	import rootParent from '@/components/common/mixins/rootParent.js'
	export default {
		name: 'uniSubMenu',
		mixins: [rootParent],
		data() {
			return {
				height: 0,
				oldheight: 0,
				isOpen: this.active
			};
		},
		props: {
			active: {
				type: Boolean
			},
		},
		watch: {
			active(val) {
				this.isOpen = val
			}
		},
		computed: {
			paddingLeft() {
				return 20 + 20 * this.rootMenu.SubMenu.length + 'px'
			}
		},
		created() {
			this.init()
		},
		methods: {
			init() {
				// 所有父元素
				this.rootMenu = {
					NavMenu: [],
					SubMenu: []
				}
				this.childrens = []
				this.getParentAll('SubMenu', this)
				this.getParentAll('Menu', this)
				// 直系父元素
				this.$subMenu = this.rootMenu.SubMenu
				this.$subMenuSelf = this.$subMenu[0]
				if (this.$subMenuSelf) {
					this.$subMenuSelf.childrens && this.$subMenuSelf.childrens.push(this)
				}
			},
			tiggerMenuItem() {
				this.isOpen = !this.isOpen
			}
		}
	}
</script>

<style lang="scss">
	.uni-sub-menu {
		position: relative;
	}

	.uni-sub-menu__title {
		display: flex;
		align-items: center;
		padding: 0 20px;
		padding-right: 10px;
		height: 56px;
		line-height: 56px;
	}

	.uni-sub-menu__title:hover {
		outline: none;
		background-color: $menu-bg-color-hover;
	}

	.uni-sub-menu__title-sub {
		display: flex;
		align-items: center;
		flex: 1;
	}

	.uni-sub-menu__content {
		transition: all 0.3s;
		/* height: 0; */
		overflow: hidden;
		/* border: 1px red solid; */
		/* padding-left: 20px; */
	}

	.uni-sub-menu__icon {
		transition: all 0.2s;
	}

	.transition {
		transform: rotate(-180deg);
	}
</style>
