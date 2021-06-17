## 1.5.2（2021-06-17）
- 修复 初始化超级管理员时检测 token 的 bug
## 1.5.1（2021-06-16）
- 修复 云函数 register api 存在的安全漏洞
## 1.5.0（2021-06-11）
**重要更新：uni-admin云函数取消**

- 原 uni-admin 云函数取消，其中的用户相关功能转移到uni-id-cf云函数，其他功能转移到clientDB在前端实现（uni-id-cf云函数为通用的用户中心云函数，[uni-starter](https://ext.dcloud.net.cn/plugin?id=5057) 等其他插件的用户功能也使用该云函数）
- 修复 未连接服务空间时登录页空白的 bug
## 1.4.5（2021-05-18）
- 新增 选择表格分页条数功能
- 修复 切换分页条数当前分页不是1时获取数据出错的 bug
## 1.4.4（2021-05-17）
- 优化 导出 Excel 功能的代码
- 优化 系统管理 list 页面样式
- 优化 文案调整
## 1.4.3（2021-05-14）
- PC 端支持表格导出数据为 Excel
## 1.4.2（2021-04-21）
- 更新 uni-id 3.1.0
  - 增加对用户名、邮箱、密码字段的两端去空格
  - 默认忽略用户名、邮箱的大小写 [详情](https://uniapp.dcloud.net.cn/uniCloud/uni-id?id=case-sensitive)
  - 修复 customToken导出async方法报错的Bug
## 1.4.1（2021-04-16）
- 更新 uni-tabel 1.0.3
- 新增 根目录下 changelog.md
