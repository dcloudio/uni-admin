# NavMenu 导航菜单

为网站提供导航功能的菜单 ，由 `uni-menu` 、`uni-sub-menu` 、`uni-menu-item` 、`uni-menu-group`  


## uni-menu
控制导航菜单的整体表现，如是否开启折叠动画，菜单背景色前景色，激活菜单的 index 等

### uni-menu 参数说明

参数 								| 类型 		| 可选值 								| 默认值 	 	| 说明
--- 								| --- 		| --- 									| --- 	 		| ---
mode								| string	| horizontal / vertical	| vertical 	| 模式	
collapse						| boolean	| —											| false 		|	是否水平折叠收起菜单（仅在 mode 为 vertical 时可用）	
background-color		| string	| —											| #ffffff 	|	菜单的背景色
text-color					| string	| —											| #303133 	|	菜单的文字颜色
active-text-color		| string	| —											| #409EFF 	|	当前激活菜单的文字颜色
default-active			| string	| —											| — 				|	当前激活菜单的 index	
default-openeds			| Array		| —											| — 				|	当前打开的 sub-menu 的 index 的数组	
unique-opened				| boolean	|	—											| false 		|	是否只保持一个子菜单的展开	
menu-trigger				| string	|	hover / click					|	hover 		|	子菜单打开的触发方式(只在 mode 为 horizontal 时有效)	
router							| boolean	|	—											| false 		|	启用该模式会在激活导航时以 index 作为 path 进行路由跳转	
collapse-transition | boolean	|	—											|	true 			|	是否开启折叠动画	

### uni-menu 方法说明

方法名称 	| 说明 								| 回调参数
---			|	---									|	---
open	 	| 展开指定的 sub-menu	 	|	index: 需要打开的 sub-menu 的 index
close	 	| 收起指定的 sub-menu		|	index: 需要收起的 sub-menu 的 index


###  uni-menu 事件说明

方法名称 	| 说明 								| 回调参数
---			|	---									|	---
select	| 菜单激活回调					|	index: 选中菜单项的 index, indexPath: 选中菜单项的 index path
open		|	sub-menu 展开的回调		| index: 打开的 sub-menu 的 index， indexPath: 打开的 sub-menu 的 index path
close		|	sub-menu 收起的回调		|	index: 收起的 sub-menu 的 index， indexPath: 收起的 sub-menu 的 index path


## uni-sub-menu
子菜单

参数 					| 类型 				| 可选值 	| 默认值 	| 说明
--- 					| --- 				| --- 		| --- 	 	| ---
index					|	string/null	|	—				|	null 		|	唯一标志
popper-class	|	string			| —				|	— 			|	弹出菜单的自定义类名
show-timeout	|	number			| —				|	300 		|	展开 sub-menu 的延时
hide-timeout	|	number			|	—				|	300 		|	收起 sub-menu 的延时
disabled			|	boolean			|	—				|	false 	|	是否禁用


## uni-menu-item
菜单内容

参数 			| 类型 		| 可选值 	| 默认值 	| 说明
--- 			| --- 		| --- 		| --- 	 	| ---
index			|	string	|	—				|— 				|	唯一标志
path			|	Object	|	—				|—  			|	路径
disabled	|	boolean	|	—				|false 		|	是否禁用

## uni-menu-group
菜单分组

参数 		| 类型 		| 可选值 	| 默认值 	| 说明
--- 		| --- 		| --- 		| --- 	 	| ---
title		|string		|	—				|	—				|	分组标题