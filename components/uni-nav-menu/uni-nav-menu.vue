<template>
	<view class="uni-nav-menu">
		<slot></slot>
	</view>
</template>

<script>
	export default {
		name:'uniNavMenu',
		props: {
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
				default: '#ffffff'
			},
			// 菜单的文字颜色
			textColor: {
				type: String,
				default: '#303133'
			},
			// 当前激活菜单的文字颜色
			activeTextColor: {
				type: String,
				default: ''
			},
			// 当前激活菜单的 index
			defaultActive: {
				type: String,
				default: ''
			},
			// 是否只保持一个子菜单的展开
			defaultOpened: {
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
			// 子菜单打开的触发方式(只在 mode 为 horizontal 时有效) ，可选值 	 hover / click
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
		}
	}
</script>

<style lang="scss">
.uni-nav-menu {
	width: 240px;
	min-height: 400px;
	// background-color: #FFFFFF;
	// border: 1px red solid;
	font-size: 14px;
}
</style>
