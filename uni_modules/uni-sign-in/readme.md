#### 简介：培养用户习惯，提升用户粘性，支持广告流量变现的签到得积分功能。
#### 功能支持：
1. 每日签到奖励 (支持：普通签到、看广告签到)
2. 周期性连续7日签到，奖励翻倍

### 使用看广告签到功能必读
1.`普通签到`是通过clientDb实现，如果你要使用`看广告签到`的方式，
	为了防止刷量需要修改`opendb-sign-in.schema`中`permission` -> `create` 的值设置为`false`

> 文件路径 :`uni_modules/uni-sign-in/uniCloud/database/opendb-sign-in.schema.json`

示例：

```javascript
{
	"bsonType": "object",
	"required": [],
	"permission": {
		"read": "auth.uid == doc.user_id",
		"create": false,
		"update": false,
		"delete": false
	}
}
```

2. 你需要看激励视频广告相关文档
详情：[https://uniapp.dcloud.net.cn/api/a-d/rewarded-video](https://uniapp.dcloud.net.cn/api/a-d/rewarded-video)

##### 使用方式

```js
<template>
	<view>
		<uni-sign-in ref="signIn"></uni-sign-in>
		<button type="default" @click="signIn">普通签到</button>
		<button type="default" @click="signInByAd">看广告签到</button>
	</view>
</template>
<script>
	export default {
		methods: {
			signIn() { //普通签到
				this.$refs.signIn.open()
			},
			signInByAd(){ //看激励视频广告签到
				this.$refs.signIn.showRewardedVideoAd()
			},
		}
	}
</script>
```

> 详情参考[uni-starter](https://ext.dcloud.net.cn/plugin?id=5057)


##### 插件组成
1. 前端组件

<img style="margin-left:30px;width:60vw;max-width:300px;" src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-f184e7c3-1912-41b2-b81f-435d1b37c7b4/ff94178d-6d67-4408-8dde-b06eee8212c9.jpg" />

2. `DB Schema`表结构,
	- 描述签到表字段及含义以及读写权限。 
	- 路径：`/uniCloud/database/opendb-sign-in.schema.json` 
> 更多表结构说明详情：[https://uniapp.dcloud.io/uniCloud/schema](https://uniapp.dcloud.io/uniCloud/schema)

3. `uni-clientDB-actions` 一个可编程的 `clientDB` 前置后置操作
	- 前置操作，添加操作时检查今日是否未签到，否则拦截
	- 后置操作，判断是否已经连续签到7天，决定本次签到用户可得积分
	- 后置操作，输出本轮已签到几天，当前积分，已签到的日期数组，本轮签到可得多少分
4. 两个api接口
	普通签到`this.$refs.signIn.open()`
	看激励视频广告签到`this.$refs.signIn.showRewardedVideoAd()`

#### 常见问题
1. 是否支持配置积分数

	答：暂不支持，今后的版本有计划支持

2. 有没有更多玩法

	答：计划今后推出
	
	（2.1）需要看广告才能签到 --- 已支持
	
	（2.2）补签的玩法