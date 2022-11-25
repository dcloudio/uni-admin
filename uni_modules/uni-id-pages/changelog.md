## 1.0.31（2022-11-16）
- uni-id-co 修复 验证码可能无法收到的bug
## 1.0.30（2022-11-11）
- uni-id-co 修复 用户只有openid时绑定微信/QQ报错
## 1.0.29（2022-11-10）
- uni-id-co 支持URL化方式请求 [详情](https://uniapp.dcloud.net.cn/uniCloud/uni-id-pages.html#adapter-http)
## 1.0.28（2022-11-09）
- uni-id-co 升级密码加密算法，支持hmac-sha256加密 [详情](https://uniapp.dcloud.net.cn/uniCloud/uni-id-summary.html#password-safe)
- uni-id-co 新增 开发者可以自定义密码加密规则 [详情](https://uniapp.dcloud.net.cn/uniCloud/uni-id-summary.html#custom-password-encrypt)
- uni-id-co 新增 支持将其他系统用户迁移至uni-id [详情](https://uniapp.dcloud.net.cn/uniCloud/uni-id-summary.html#move-users-to-uni-id)
## 1.0.27（2022-10-26）
- uni-id-co 新增 secureNetworkHandshakeByWeixin 接口，用于建立和微信小程序的安全网络连接
## 1.0.26（2022-10-18）
- 修复 uni-id-pages 导入时异常的Bug
## 1.0.25（2022-10-14）
- uni-id-co 增加 微信授权手机号登录方式 [文档](https://uniapp.dcloud.net.cn/uniCloud/uni-id-pages.html#login-by-weixin-mobile)
- uni-id-co 增加 解绑第三方平台账号 [文档](https://uniapp.dcloud.net.cn/uniCloud/uni-id-pages.html#unbind-third-account)
- uni-id-co 微信绑定手机号支持通过`getPhoneNumber`事件回调的`code`绑定 [文档](https://uniapp.dcloud.net.cn/uniCloud/uni-id-pages.html#bind-mobile-by-mp-weixin)
- 修复 sendSmsCode 接口未在参数内传递 templateId 时 未能从配置文件读取 templateId 的Bug
## 1.0.24（2022-10-08）
- 修复 报uni-id-users表schema内错误的bug
## 1.0.23（2022-10-08）
- 修复 vue3下vite编译发行打包失败
- 修复 某些情况下注册账号，报TypeErroe：Cannot read properties of undefined （reading ’showToast‘）的错误
## 1.0.22（2022-09-23）
- 修复 某些情况下，修改密码报“两次输入密码不一致”的bug
## 1.0.21（2022-09-21）
- 修复 store.hasLogin的值在某些情况下会出错的bug
## 1.0.20（2022-09-21）
- 新增 store 账号信息状态管理，详情：用户中心页面 路径：`/uni_modules/uni-id-pages/pages/userinfo/userinfo`
## 1.0.19（2022-09-20）
- 修复 小程序端，使用将自定义节点设置成[虚拟节点](https://uniapp.dcloud.net.cn/tutorial/vue-api.html#%E5%85%B6%E4%BB%96%E9%85%8D%E7%BD%AE)的uni-ui组件，样式错乱的问题
## 1.0.18（2022-09-20）
- 修复 微信小程序端 WXSS 编译报错的bug
## 1.0.17（2022.09-19）
- 修复 无法退出登录的bug
## 1.0.16（2022-09-19）
- 修复 在 Edge 浏览器下 input[type="password"] 会出现浏览器自带的密码查看按钮
- 优化 退出登录重定向页面为 uniIdRouter.loginPage
- 新增 注册账号页面支持返回登录页面
## 1.0.15（2022-09-19）
- 更新表结构，解决在uni-admin中部分clientDB操作没有权限的问题
## 1.0.14（2022-09-16）
- 修改 配置项`isAdmin`默认值为`false`
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
