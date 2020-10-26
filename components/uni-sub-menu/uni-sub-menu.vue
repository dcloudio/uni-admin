<template>
	<view class="uni-sub-menu">
		<view class="uni-sub-menu__title"  :class="{'is-disabled':disabled}" :style="{paddingLeft:paddingLeft}" @click="select">
			<view class="uni-sub-menu__title-sub" :style="{color:disabled?'#999':textColor}">
				<slot name="title"></slot>
			</view>
			<!-- :class="{transition:height!==0}" -->
			<uni-icons class="uni-sub-menu__icon" :class="{transition:isOpen}" type="arrowdown" color="#bbb" size="14"></uni-icons>
		</view>
		<!--  :style="{height:height+'px'}"-->
		<view class="uni-sub-menu__content" :class="{'uni-sub-menu--close':!isOpen}" :style="{'background-color':backgroundColor}">
			<view id="content--hook">
				<slot></slot>
			</view>
		</view>
	</view>
</template>

<script>
	import rootParent from '../uni-nav-menu/mixins/rootParent.js'
	export default {
		name: 'uniSubMenu',
		mixins: [rootParent],
		props: {
			// 唯一标识
			index: {
				type: String,
				default: ''
			},
			// TODO 自定义类名
			popperClass: {
				type: String,
				default: ''
			},
			// TODO 是否禁用
			disabled: {
				type: Boolean,
				default: false
			},
			// 展开菜单的背景色
			backgroundColor: {
				type: String,
				default: '#f5f5f5'
			},
		},
		data() {
			return {
				height: 0,
				oldheight: 0,
				isOpen: false,
				textColor:'#303133'
			};
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
				this.indexPath = []
				this.getParentAll('SubMenu', this)
				this.$menuParent = this.getParent('uniNavMenu', this)
				this.textColor = this.$menuParent.textColor
				// this.getParentAll('NavMenu', this)
				// 直系父元素 SubMenu
				this.$subMenu = this.rootMenu.SubMenu

				this.$subMenuSelf = this.$subMenu[0]
				if (this.$subMenuSelf) {
					// console.log(this.$subMenuSelf.index);
				}
				// TODO 是否开启折叠面板功能，逻辑需要在处理
				// this.transition = !this.rootMenu.NavMenu[0].collapseTransition
				// 将当前的示例插入到最外层 subMenu 数组中
				if (this.$subMenuSelf) {
					this.$subMenuSelf.childrens && this.$subMenuSelf.childrens.push(this)
				}
				
				// 将当前插入到menu数组中
				if(this.$menuParent){
					this.$menuParent.subChildrens.push(this)
				}
				
				// setTimeout(() => {
				// 	this.getQuery()
				// }, 20)
			},
			select() {
				if(this.disabled) return
				const subMenu = this.$menuParent
				subMenu&&subMenu.subChildrens.forEach((item,index)=>{
					if(item === this){
						this.isOpen = !this.isOpen
						this.indexPath.push(this.index)
					}else{
						if(item.isOpen && subMenu.uniqueOpened) item.isOpen = false
					}
				})
				
				this.$subMenu.forEach((sub,idx)=>{
						sub.isOpen = true
						this.indexPath.unshift(sub.index)
				})
				if(this.isOpen){
					subMenu.open(this.indexPath[this.indexPath.length-1],this.indexPath)
				}else{
					subMenu.close(this.indexPath[this.indexPath.length-1],this.indexPath)
				}
				this.indexPath = []
				// TODO 
				// if (this.height === 0) {
				// 	this.height = this.oldheight
				// 	this.open()
				// } else {
				// 	// 处理父元素的高度
				// 	this.$subMenu.forEach(item => {
				// 		item.height -= this.height
				// 	})
				// 	this.height = 0
				// 	this.close()
				// }
			},
			open() {
				this.isOpen = true
				// this.$subMenu.forEach(item => {
				// 	item.height += this.oldheight
				// })
			},
			close() {
				this.isOpen = false
				// // 处理子元素的高度
				// this.childrens.forEach((item) => {
				// 	item.height = 0
				// 	item.close()
				// })
			},
			getQuery() {
				const query = uni.createSelectorQuery().in(this);
				query.select('#content--hook').boundingClientRect(data => {
					this.oldheight = data.height
				}).exec();
			}

		}
	}
</script>

<style lang="scss">
	.uni-sub-menu {
		position: relative;
		/* background-color: #FFFFFF; */
	}

	.uni-sub-menu__title {
		display: flex;
		align-items: center;
		padding: 0 20px;
		padding-right: 10px;
		height: 56px;
		line-height: 56px;
		color: #303133;
		cursor: pointer;
		/* border-bottom: 1px #f5f5f5 solid; */
	}

	.uni-sub-menu__title:hover {
		color: #42B983;
		outline: none;
		background-color: $sub-menu-bg-color;
	}

	.uni-sub-menu__title-sub {
		display: flex;
		align-items: center;
		flex: 1;
	}

	.uni-sub-menu--close {
		height: 0;
		/* transition: all 0.3s; */
	}

	.uni-sub-menu__content {
		overflow: hidden;
	}

	.uni-sub-menu__icon {
		max-height: auto;
		transition: all 0.2s;
	}

	.transition {
		transform: rotate(-180deg);
	}
	
	.is-disabled {
		/* background-color: #f5f5f5; */
		color: red;
	}
	.uni-sub-menu__title.is-disabled:hover {
		background-color: inherit;
		color: #999;
		cursor: not-allowed;
	}
	
</style>
