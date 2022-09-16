## 1.0.13（2022-09-16）
- 新增 管理员注册页面
- 新增 配置项`isAdmin`区分是否为管理端
- 新增 登录成功后自动跳转；跳转优先级：路由携带(`uniIdRedirectUrl`参数) > 返回上一路由 > 跳转首页
- uni-id-co 优化 注册管理员时管理员存在提示文案
## 1.0.12（2022-09-07）
- 修复 getSupportedLoginType判断是否支持微信公众号、PC网页微信扫码登录方式报错的Bug
- 优化 适配pc端样式
- 新增 邮箱验证码注册
- 新增 邮箱验证码找回密码
- 新增 退出登录(全局)回调事件：`uni-id-pages-logout`，支持通过[uni.$on](https://uniapp.dcloud.net.cn/api/window/communication.html#on)监听;
- 调整 抽离退出登录方法至`/uni_modules/uni-id-pages/common/common.js`中，方便在项目其他页面中调用
- 调整 用户中心（路径：`/uni_modules/uni-id-pages/pages/userinfo/userinfo`）默认不再显示退出登录按钮。支持页面传参数`showLoginManage=true`恢复显示
## 1.0.11（2022-09-01）
- 修复 iOS端，一键登录功能卡在showLoading的问题
- 更新 合并密码强度与长度配置 [详情](https://uniapp.dcloud.net.cn/uniCloud/uni-id-pages.html#config)
- uni-id-co 修复 调用 removeAuthorizedApp 接口报错的Bug
- uni-id-co 新增 管理端接口 updateUser [详情](https://uniapp.dcloud.net.cn/uniCloud/uni-id-pages.html#update-user)
- uni-id-co 调整 为兼容旧版本，未配置密码强度时提供最简单的密码规则校验（长度大于6即可）
- uni-id-co 调整 注册、登录时如果携带了token则尝试对此token进行登出操作
- uni-id-co 调整 管理端接口 addUser 增加 mobile、email等参数 [详情](https://uniapp.dcloud.net.cn/uniCloud/uni-id-pages.html#add-user)
## 1.0.10（2022-08-25）
- 修复 导入uni-id-pages插件时未自动导入uni-open-bridge-common的Bug
## 1.0.9（2022-08-23）
- 修复 uni-id-co 缺失uni-open-bridge-common依赖的Bug
## 1.0.8（2022-08-23）
- 新增 H5端支持微信登录（含微信公众号内的网页授权登录 和 普通浏览器内网页生成二维码，实现手机微信扫码登录）[详情](https://uniapp.dcloud.net.cn/uniCloud/uni-id-pages.html#weixinlogin)
- 新增 登录成功(全局)回调事件：`uni-id-pages-login-success`，支持通过[uni.$on](https://uniapp.dcloud.net.cn/api/window/communication.html#on)监听;
- 新增 密码强度（是否必须包含大小写字母、数字和特殊符号以及长度）配置 [详情](https://uniapp.dcloud.net.cn/uniCloud/uni-id-pages.html#config)
- 调整 uni-id-co 密码规则调整，废除之前的简单校验，允许配置密码强度 [详情](https://uniapp.dcloud.net.cn/uniCloud/uni-id-summary.html#password-strength)
- 调整 uni-id-co 存储用户 openid 时同时以客户端 AppId 为 Key 的副本，参考：[微信登录](https://uniapp.dcloud.net.cn/uniCloud/uni-id-pages.html#login-by-weixin)、[QQ登录](https://uniapp.dcloud.net.cn/uniCloud/uni-id-pages.html#login-by-qq)
- 调整 uni-id-co 依赖 uni-open-bridge-common 存储用户 session_key、access_token 等信息 [详情](https://uniapp.dcloud.net.cn/uniCloud/uni-id-summary.html#save-user-token)
- 新增 uni-id-co 增加 beforeRegister 钩子用户在注册前向用户记录内添加一些数据 [详情](https://uniapp.dcloud.net.cn/uniCloud/uni-id-summary.html#before-register)
## 1.0.7（2022-07-19）
- 修复 uni-id-co接口 logout时没有删除token的Bug
## 1.0.6（2022-07-13）
- 新增 允许覆盖内置校验规则 [详情](https://uniapp.dcloud.net.cn/uniCloud/uni-id-pages.html#custom-validator)
- 修复 app端clientInfo.appVersionCode为数字导致校验无法通过的Bug
## 1.0.5（2022-07-11）
修复 微信小程序调用uni-id-co接口报错的Bug [详情](https://ask.dcloud.net.cn/question/148877)
## 1.0.4（2022-07-06）
- uni-id-co增加clientInfo字段类型校验
- 监听token更新时机，同步客户端push_clientid至uni-id-device表，改为：同步客户端push_clientid至uni-id-device表和opendb-device表
## 1.0.3（2022-07-05）
新增监听token更新时机，同步客户端push_clientid至uni-id-device表
## 1.0.2（2022-07-04）
修复微信小程序登录时无unionid报错的Bug [详情](https://ask.dcloud.net.cn/question/148016)
## 1.0.1（2022-06-28）
添加相关uni-id表
## 1.0.0（2022-06-23）
正式版
