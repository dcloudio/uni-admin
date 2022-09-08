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
