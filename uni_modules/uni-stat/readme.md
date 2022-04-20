# uni统计公共模块说明
该公共模块依赖于 uniCloud配置中心（uni-config-center）

## 结构说明
- `shared` 公共模块
- `stat/index.js` 实际业务入口文件
- `stat/mod` 数据模型
- `stat/lib` 类库
- `index.js` 代理入口

数据上报、数据统计及日志清理均由 `/src/stat/index.js` 中的 `UniStat` 类 统一调度实现

### UniStat类方法说明
- `report` 该方法负责上报数据的处理及入库
- `stat` 该方法负责进行各项日志统计汇算
- `cleanLog` 该方法负责各项过期日志数据的清理
- `statCron` 该方法负责定时任务的分发处理


### 相关云函数
- 数据上报函数（uni-stat-report）
``` javascript
'use strict';
const uniStat = require('uni-stat')
exports.main = async (event, context) => {
	//数据上报处理函数
	return await uniStat.init().report(event)
};
```

- 数据定时统计函数 (uni-stat-cron)
``` javascript
'use strict';
const uniStat = require('uni-stat')
exports.main = async (event, context) => {
	//数据跑批处理函数
	return await uniStat.init().statCron(context)
};

```


## uni统计配置项说明

### 基础参数

|配置项				|默认值		|说明																																																|
| :--------:		|:---------:|:-------------------:																																												|
|  debug			|  false	|开启调试模式 true: 开启，false:关闭，开启后会产生大量日志，生产环境请关闭。																														|
|  redis			|  false	|开启redis缓存，开启后可以降低数据库查询压力，提升uni统计性能，可按需决定是否开启。																													|
|  cachetime		|  604800	|redis缓存有效期，单位秒。																																											|
|  realtimeStat		|  true		|开启实时统计，true: 开启，false:关闭，开启后会每小时统计一次，数据库读写次数会增多，可按需决定是否开启，开启方法见下方[开启redis缓存](#开启redis缓存)。											|
|  cronMin			|  false	|开启分钟级定时任务，true: 开启，false:关闭。开启后定时任务将细分到分钟级执行，分摊数据计算压力，适合应用日活较大或有特殊需求的用户群体。开启方法见下方 [开启分钟级定时任务](#开启分钟级定时任务)。	|
|  cron				|  -		|用于配置定时任务触发时间，详情见下方[定时任务配置说明](#定时任务配置说明)。																														|
|  batchInsertNum	|  5000		|当有批量写入操作时，限制单次写入数据库的最大条数。为防止写入超时，最大值为5000条。																													|
|  errorCheck		|  -		|错误检测，此项用于在规定时间内限制相同的错误日志写入数据库，防止有高频错误产生时造成大量的数据库写入操作。[详情](#错误检测配置说明)																|
|  cleanLog			|  -		|日志清理，此项用于配置定时清理过期的日志，减少数据库数据的存储量，提升uni统计性能。[详情](#日志清理配置说明)																						|

### 开启redis缓存

开启步骤：
1. 修改uni统计配置项将`redis`参数的值改为`true`。
2. 分别在数据`上报云函数（uni-stat-report）`和`统计云函数（uni-stat-cron）`下的`package.json`文件中添加redis拓展库。
3. 重新上传部署数据`上报云函数（uni-stat-report）`、`统计云函数（uni-stat-cron）`和`配置中心（uni-config-center）`。

``` javascript
//配置redis拓展库
{
	"name": "uni-stat-report",
	"version": "1.0.0",
	"description": "",
	"main": "index.js",
	"extensions": {
		"uni-cloud-redis": {} // 配置为此云函数开启redis扩展库，值为空对象留作后续追加参数，暂无内容。如拷贝此配置项到package.json文件，切记去除注释。
	},
	"author": ""
}
```



### 定时任务配置说明

`cron` 参数用于配置定时任务触发时间，一般无需修改此项。

|参数		|说明																																							|
| :--------:|:-------------------:																																			|
|  type		|类型： `stat`：基础数据统计；`retention`：留存数据统计； `active-user`：活跃用户数据归档；`page`：页面数据统计；`event`：事件数据统计；`error`：错误数据统计；	|
|  time		|触发时间表达式：`* * * *` 共四位，由左到右分别代表：星期（1-7代表周一到周日）/日/时/分。例：每天晚上0点0分触发，应写作 `* * 0 0`									|



### 开启分钟级定时任务

- 阿里云服务空间开启步骤：

1. 因阿里云服务空间默认不支持分钟级定时器，必须先向DCloud申请分钟级定时器后再开启（申请方式：向`service@dcloud.io`发送邮件申请）。
2. 修改uni统计配置项将`cronMin`参数的值改为`true`。
3. 修改`统计云函数（uni-stat-cron）`下的`package.json`文件中的触发器配置。
4. 重新上传部署`统计云函数（uni-stat-cron）`和`配置中心（uni-config-center）`。

``` javascript
//config选项为阿里云定时器的cron表达式 将原小时级表达式 "config": "0 0 * * * * *" 更改为分钟级表达式 "config": "0 * * * * * *" 后重新上传部署云函数即可.
"cloudfunction-config": {
		"concurrency": 1,
		"memorySize": 256,
		"timeout": 600,
		"triggers": [
			{
				"name": "uni-stat-cron",
				"type": "timer",
				"config": "0 * * * * * *"
			}
		]
}
```

- 腾讯云服务空间开启步骤：

1. 修改uni统计配置项将`cronMin`参数的值改为`true`。
2. 修改`统计云函数（uni-stat-cron）`下的`package.json`文件中的触发器配置。
3. 重新上传部署`统计云函数（uni-stat-cron）`和`配置中心（uni-config-center）`。

``` javascript
//config选项为阿里云定时器的cron表达式 将原小时级表达式 "config": "0 0 * * * * *" 更改为分钟级表达式 "config": "0 * * * * * *" 后重新上传部署云函数即可.
"cloudfunction-config": {
		"concurrency": 1,
		"memorySize": 256,
		"timeout": 600,
		"triggers": [
			{
				"name": "uni-stat-cron",
				"type": "timer",
				"config": "0 * * * * * *"
			}
		]
}
```


### 错误检测配置说明

`errorCheck`参数用于在规定时间内限制相同的错误日志写入数据库，防止有高频错误产生时造成大量的数据库写入操作，可按需开启或关闭。

|参数		|说明								|
| :--------:|:-------------------:				|
|  needCheck|是否需要检测：true：是；false:否	|
|  checkTime|错误检测间隔时间，单位`分钟`。		|


### 日志清理配置说明

`cleanLog`参数用于配置定时清理过期的日志，减少数据库数据的存储量，提升uni统计性能。

|参数			|说明																																																				|
| :--------:	|:-------------------:																																																|
|  open			|是否开启日志清理：true：是；false:否																																												|
|  reserveDays	|各项日志的保留天数配置，参数格式：`日志类型:保留天数`，例如： `sessionLog:7`代表保留7天的会话日志，保留天数设置为0时表示永久保留(此举会累积大量无用数据，不推荐)。 目前可配置的日志类型有：`会话日志：sessionLog`、`页面日志：pageLog`、`事件日志：eventLog`、`分享日志：shareLog`、`错误日志：errorLog`	|