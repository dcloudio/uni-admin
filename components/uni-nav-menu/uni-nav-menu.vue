<template>
	<view class="uni-nav-menu" :style="{'background-color':backgroundColor}">
		<slot>
			<uni-menu-sidebar :data="data"></uni-menu-sidebar>
		</slot>
	</view>
</template>

<script>
	export default {
		name:'uniNavMenu',
		props: {
			data:{
				type:Array,
				default(){
					return []
				}
			},
			// 模式	可选值 horizontal / vertical
			mode: {
				type: String,
				default: 'vertical'
			},
			// 是否水平折叠收起菜单（仅在 mode 为 vertical 时可用）
			collapse: {
				type: Boolean,
				default: false
			},
			// 菜单的背景色
			backgroundColor: {
				type: String,
				default: '#fff'
			},
			// 菜单的文字颜色
			textColor: {
				type: String,
				default: '#303133'
			},
			// 当前激活菜单的文字颜色
			activeTextColor: {
				type: String,
				default: '#42B983'
			},
			// 当前激活菜单的背景色
			activeBackgroundColor: {
				type: String,
				default: 'inherit'
			},

			// 当前激活菜单的 index
			active: {
				type: String,
				default: ''
			},
			// 当前打开的 sub-menu 的 index 的数组
			defaultOpeneds: {
				type: Array,
				default () {
					return []
				}
			},
			// 是否只保持一个子菜单的展开
			uniqueOpened: {
				type: Boolean,
				default: false
			},
			// TODO 子菜单打开的触发方式(只在 mode 为 horizontal 时有效) ，可选值 	 hover / click
			menuTrigger: {
				type: String,
				default: 'hover'
			},
			router: {
				type: Boolean,
				default: false
			},
			// 是否开启折叠动画
			collapseTransition: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {

			};
		},
		watch:{
			active(newVal){
				console.log('active',newVal);
				// 动态修改选中 index
				if(this.itemChildrens.length > 0){
					this.itemChildrens.forEach(item=>{
						if(item.index === newVal){
							item.init()
						}else{
							item.active = false
						}
					})
				}
			}
		},
		created() {
			this.itemChildrens = []
			this.subChildrens = []
		},
		methods:{
			// menu 菜单激活回调
			select(key,keyPath){
				this.$emit('select',key,keyPath)
			},
			// sub-menu 展开的回调
			open(key,keyPath){
				this.$emit('open',key,keyPath)
			},
			// sub-menu 收起的回调
			close(key,keyPath){
				this.$emit('close',key,keyPath)
			}
		}
	}
</script>

<style lang="scss">
.uni-nav-menu {
	width: 240px;
	min-height: 500px;
	background-color: #FFFFFF;
	font-size: 14px;
}
</style>
