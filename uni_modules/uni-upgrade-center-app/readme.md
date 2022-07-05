# uni-upgrade-center - App

### 概述

> 统一管理App及App在`Android`、`iOS`平台上`App安装包`和`wgt资源包`的发布升级

> uni升级中心分为业务插件和后台管理插件。本插件为业务插件，包括uni升级中心客户端检查更新的前后端逻辑。后台管理系统另见 [uni-upgrade-center - Admin](https://ext.dcloud.net.cn/plugin?id=4470)

> 现 uni-admin 以内置 `uni-upgrade-center - Admin`

### uni升级中心 - 客户端检查更新插件
  - 一键式检查更新，同时支持整包升级与wgt资源包更新
  - 好看、实用、可自定义的客户端提示框

## 安装指引

1. 使用`HBuilderX 3.1.0+`，因为要使用到`uni_modules`

2. 在插件市场打开本插件页面，在右侧点击`使用 HBuilderX 导入插件`，选择要导入的项目点击确定

3. 绑定一个服务空间（服务空间请于 [uni-upgrade-center - Admin](https://ext.dcloud.net.cn/plugin?id=4470) 一致）

4. 在`pages.json`中添加页面路径。**注：请不要设置为pages.json中第一项**
```json
"pages": [
		// ……其他页面配置
		{
			"path": "uni_modules/uni-upgrade-center-app/pages/upgrade-popup",
			"style": {
				"disableScroll": true,
				"app-plus": {
					"backgroundColorTop": "transparent",
					"background": "transparent",
					"titleNView": false,
					"scrollIndicator": false,
					"popGesture": "none",
					"animationType": "fade-in",
					"animationDuration": 200

				}
			}
		}
]
```

5. 将`@/uni_modules/uni-upgrade-center-app/utils/check-update`import到需要用到的地方，调用一下即可
	1. 默认使用当前绑定的服务空间，如果要请求其他服务空间，可以使用其他服务空间的 `callFunction`。[详情](https://uniapp.dcloud.io/uniCloud/cf-functions.html#call-by-function-cross-space)

6. 升级弹框可自行编写，也可以使用`uni.showModal`，或使用现有的升级弹框样式，如果不满足UI需求请自行替换资源文件。在`utils/check-update.js`中都有实例。

7. wgt更新时，打包前请务必将manifest.json中的版本修改为更高版本。

### 更新下载安装`check-update.js`

*该函数在utils目录下*

1. 如果是静默更新，则不会打开更新弹框，会在后台下载后安装，下次启动应用生效

2. 如果是 iOS，则会直接打开AppStore的链接

3. 其他情况，会将`check-version`返回的结果保存在localStorage中，并跳转进入`upgrade-popup.vue`打开更新弹框

### 检查更新函数`check-version`

*该函数在uni-admin 项目/uniCloud/cloudfunctions/uni-upgrade-center/checkVersion目录下*

1. 使用检查更新需要传递三个参数 `appid`、`appVersion`、`wgtVersion`

2. `appid` 使用 plus.runtime.appid 获取，*注：真机运行时为固定值HBuilder，在调试的时候请使用本地调试云函数*

3. `appVersion` 使用 plus.runtime.version 获取

4. `wgtVersion` 使用 plus.runtime.getProperty(plus.runtime.appid,(wgtInfo) => { wgtInfo.version }) 获取

5. `check-version`云函数内部会自动获取 App 平台

**Tips**

1. `check-version`云函数内部有版本对比函数（compare）。
	- 使用多段式版本格式（如："3.0.0.0.0.1.0.1", "3.0.0.0.0.1"）。如果不满足对比规则，请自行修改。
	- 如果修改，请将*pages/upgrade-popup.vue*中*compare*函数一并修改

## 项目代码说明

### 更新弹框
- `upgrade-popup.vue` - 更新应用：
	- 如果云函数`check-version`返回的参数表明需要更新，则将参数保存在localStorage中，带着键值跳转该页面
	- 进入时会先从localStorage中尝试取出之前存的安装包路径（此包不会是强制安装类型的包）
	- 如果有已经保存的包，则和传进来的 `version` 进行比较，如果相等则安装。大于和小于都不进行安装，因为admin端可能会调整包的版本。不符合更新会将此包删除
	- 如果本地没有包或者包不符合安装条件，则进行下载安装包
	- 点击下载会有进度条、已下载大小和下载包的大小
	- 下载完成会提示安装：
		- 如果是 wgt 包，安装时则会提示 正在安装…… 和 安装完成。安装完成会提示是否重启
		- 如果是 原生安装包，则直接跳出去覆盖安装
	- 下载过程中，如果退出会提示是否取消下载。如果是强制更新，则只会提示正在下载请稍后，此时不可退出
	- 如果是下载完成了没有安装就退出，则会将下载完成的包保存在本地。将包的本地路径和包version保存在localStorage中
	- Android 应用如果在 admin 端添加了 `Android应用市场`，则会按照优先级依次尝试跳转应用市场，如果都跳转失败。则会跳转浏览器使用 `下载链接` 下载 `apk安装包`

### 工具类 utils
- `call-check-version`
	- 请求云函数`check-version`拿取版本检测结果
- `check-update`
	- 调用`call-check-version`并根据结果判断是否显示更新弹框

### 云函数
- `check-version` - 检查应用更新：
	- 根据传参，先检测传参是否完整，appid appVersion wgtVersion 必传
	- 先从数据库取出所有该平台（会从上下文读取平台信息）的所有线上发行更新
	- 再从所有线上发行更新中取出版本最大的一版。如果可以，尽量先检测wgt的线上发行版更新
	- 使用上一步取出的版本包的版本号 和传参 appVersion、wgtVersion 来检测是否有更新。必须同时大于这两项，因为上一次可能是wgt热更新，否则返回暂无更新
	- 如果库中 wgt包 版本大于传参 appVersion，但是不满足 min_uni_version < appVersion，则不会使用wgt更新，会接着判断库中 app包version 是否大于 appVersion
	- 返回结果：

		|code|message|
		|:-:|:-:|
		|0|当前版本已经是最新的，不需要更新|
		|101|wgt更新|
		|102|整包更新|
		|-101|暂无更新或检查appid是否填写正确|
		|-102|请检查传参是否填写正确|