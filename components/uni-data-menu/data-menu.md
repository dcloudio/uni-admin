## DataMenu 数据驱动的树形组件

组件名：uni-data-menu

## API

### DataMenu Props

|属性名				| 类型			|可选值		| 默认值| 说明																									|
|:-:				| :-:				|:-:			| :-:		| :-:	|																										|
|v-model			|String			|			|		|当前激活菜单的 url																						|
|active-text-color	|String			|			|		|选中、激活文字的颜色																						|
|unique-opened		|Boolean		| true/false|false	|是否只保持一个子菜单的展开																				|
|localdata			|Array				|				|			|数据，[详情](https://gitee.com/dcloud/datacom)|																										|
|collection			|String			|			|		|表名。支持输入多个表名，用 `,` 分割																	|
|field				|String			|			|		|查询字段，多个字段用 `,` 分割																			|
|where				|String			|			|		|查询条件，内容较多，另见jql文档：[详情](https://uniapp.dcloud.net.cn/uniCloud/uni-clientDB?id=jsquery)	|
|orderby			|String			|			|		|排序字段及正序倒叙设置																					|

### DataMenu Events

|事件称名	| 类型		| 说明						|
|:-:		| :-:		|:-:						|
|@select	|EventHandle|选择完成时触发返回菜单对象 {item}	|


### 基本用法

#### 云端数据

::: warning 注意事项
- 云端数据需要关联服务空间  
- 下面示例中使用的表 `opendb-admin-menus`(菜单表), 在[uniCloud控制台](https://unicloud.dcloud.net.cn/)使用opendb创建，[详情](https://gitee.com/dcloud/opendb)
:::

```html
<template>
  <view>
    <uni-data-menu v-model="activeUrl" active-text-color="#409eff" collection="opendb-admin-menus" field="menu_id as value, name as text" orderby="value asc" @select="onSelect"></uni-data-menu>
  </view>
</template>

<script>
  export default {
    data() {
      return {
      }
    },
    methods: {
      onSelect(e) {
        const value = e.url
      }
    }
  }
</script>

```


#### 本地数据

```html
<template>
  <view>
    <uni-data-menu :localdata="menus" :unique-opened="true" :active="activeUrl" active-text-color="#409eff" @select="onSelect"></uni-data-menu>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        menus: [{ // 不符合数据规范
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
      }
    },
    methods: {
      onSelect(e) {
        const value = e.url
      }
    }
  }
</script>

```


### slot

静态菜单