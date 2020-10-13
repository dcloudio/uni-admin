# 用户管理

> admin 项目模板用户管理插件，支持用户基本信息的修改。

---

-   [数据库结构](#数据库结构)
-   [自带菜单项](#自带菜单项)
-   [自带权限列表](#自带权限列表)
-   [功能截图](#功能截图)

### 数据库结构

1. 用户表（uni-id-users）
   | 字段 | 类型 | 必填| 描述 |
   | ----------------| --------- | ----| ------------------------------------------- |
   | \_id | Object ID | 是 | 存储文档 ID（用户 ID），系统自动生成 |
   | username | String | 是 | 用户名，不允许重复 |
   | password | String | 否 | 密码，加密存储 |
   | nickname | String | 否 | 用户昵称 |
   | gender | Integer | 否 | 用户性别：0 未知 1 男性 2 女性 |
   | status | Integer | 是 | 用户状态：0 正常 1 禁用 2 审核中 3 审核拒绝 |
   | mobile | String | 否 | 手机号码 |
   | mobile_confirmed| Integer | 否 | 手机号验证状态：0 未验证 1 已验证 |
   | email | String | 否 | 邮箱地址 |
   | email_confirmed | Integer | 否 | 邮箱验证状态：0 未验证 1 已验证 |
   | avatar | String | 否 | 头像地址 |
   | wx_unionid | String | 否 | 微信 unionid |
   | wx_openid | Object | 否 | 微信各个平台 openid |
   | ali_openid | String | 否 | 支付宝平台 openid |
   | comment | String | 否 | 备注 |
   | realname_auth | Object | 否 | 实名认证信息 |
   | register_date | Timestamp | 否 | 注册时间 |
   | register_ip | String | 否 | 注册时 IP 地址 |
   | last_login_date | Timestamp | 否 | 最后登录时间 |
   | last_login_ip | String | 否 | 最后登录时 IP 地址 |
   | login_ip_limit | Array | 否 | 登录 IP 限制 |
   | inviter_uid | Array | 否 | 邀请人 uid，按层级从下往上排列的 uid 数组，即第一个是直接上级|
   | my_invite_code | String | 否 | 用户自己的邀请码 |
   | role | Array | 否 | 用户角色列表，由 role_id 组成的数组 |

    **wx_openid 字段定义**

    | 字段      | 类型   | 必填 | 描述                  |
    | --------- | ------ | ---- | --------------------- |
    | app-plus  | String | 否   | app 平台微信 openid   |
    | mp-weixin | String | 否   | 微信小程序平台 openid |

    **realNameAuth 扩展字段定义**
    该字段存储实名认证信息。

    | 字段            | 类型      | 必填 | 描述                                                |
    | --------------- | --------- | ---- | --------------------------------------------------- |
    | type            | Integer   | 是   | 用户类型：0 个人用户 1 企业用户                     |
    | auth_status     | Integer   | 是   | 认证状态：0 未认证 1 等待认证 2 认证通过 3 认证失败 |
    | auth_date       | Timestamp | 否   | 认证通过时间                                        |
    | real_name       | String    | 否   | 真实姓名/企业名称                                   |
    | identity        | String    | 否   | 身份证号码/营业执照号码                             |
    | id_card_front   | String    | 否   | 身份证正面照 URL                                    |
    | id_card_back    | String    | 否   | 身份证反面照 URL                                    |
    | id_card_in_hand | String    | 否   | 手持身份证照片 URL                                  |
    | license         | String    | 否   | 营业执照 URL                                        |
    | contact_person  | String    | 否   | 联系人姓名                                          |
    | contact_mobile  | String    | 否   | 联系人手机号码                                      |
    | contact_email   | String    | 否   | 联系人邮箱                                          |

    **job 扩展字段定义**

    | 字段    | 类型   | 必填 | 描述     |
    | ------- | ------ | ---- | -------- |
    | company | String | 否   | 公司名称 |
    | title   | String | 否   | 职位     |

### 自带菜单项

```bash
├── 系统菜单
│   │── 用户管理
```

### 自带权限列表

1. 修改用户

### 功能截图
