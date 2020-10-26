<template>
	<view class="uni-menu-item" :class="{'is-active':active,'is-disabled':disabled}" :style="{paddingLeft:paddingLeft,'color':disabled?'#999':(active?activeTextColor:textColor),'background-color':active?activeBackgroundColor:''}" @click="onClickItem">
		<slot></slot>
	</view>
</template>

<script>
	import rootParent from '../uni-nav-menu/mixins/rootParent.js'
	export default {
		name: 'uniMenuItem',
		mixins:[rootParent],
		props:{
			// 唯一标识
			index: {
				type:String,
				default:''
			},
			// TODO 是否禁用
			disabled:{
				type:Boolean,
				default:false
			}
		},
		data() {
			return {
				active:false,
				activeTextColor:'#42B983',
				textColor:'#303133',
				activeBackgroundColor:''
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
				this.indexPath = []
				this.getParentAll('SubMenu', this)
				this.$menuParent = this.getParent('uniNavMenu', this)
				this.activeTextColor = this.$menuParent.activeTextColor
				this.textColor = this.$menuParent.textColor
				this.activeBackgroundColor =  this.$menuParent.activeBackgroundColor
				// 将当前插入到menu数组中
				if(this.$menuParent){
					this.$menuParent.itemChildrens.push(this)
					this.isActive()
				}
			},
			// 判断当前选中
			isActive(){
				if(this.index && this.$menuParent.active === this.index){
					this.rootMenu.SubMenu.forEach((item,index)=>{
						if(!item.disabled) {
							this.indexPath.push(item.index)
							if(index === 0){
								item.select()
							}
							item.isOpen = true

						}
					})
					this.onClickItem('init')
				}
			},
			// 点击 menuItem
			onClickItem(e){
				if(this.disabled) return
				this.closeOtherActive()
				this.active = true
				this.indexPath.unshift(this.index)
				this.indexPath.reverse()
				this.$menuParent.select(this.index,this.indexPath)
				if(e === 'init'){
					this.indexPath.pop()
					this.$menuParent.open(this.indexPath[this.indexPath.length-1],this.indexPath)
				}
			},
			// 关闭其他选中
			closeOtherActive(){
				let parents = this.$menuParent
				this.indexPath = []
				this.rootMenu.SubMenu.forEach((item)=>{
					if(!item.disabled) {
						this.indexPath.push(item.index)
					}
				})
				parents&&parents.itemChildrens.map((item)=>{
					if(item.active) {
						item.active= false
					}
					return item
				})
			}
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
		color: #303133;
		transition: all 0.3s;
		cursor: pointer;
		// border-bottom: 1px #f5f5f5 solid;
	}

	.uni-menu-item:hover {
		outline: none;
		background-color: $sub-menu-bg-color;
		transition: all 0.3s;
	}

	.is-active {
		color: #42B983;
		// background-color: #ecf8f3;
	}
	.is-disabled {
		// background-color: #f5f5f5;
		color: #999;
	}
	.uni-menu-item.is-disabled:hover {
		background-color: inherit;
		color: #999;
		cursor: not-allowed;
	}
</style>
