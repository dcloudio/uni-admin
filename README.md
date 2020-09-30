# uni-template-admin

基于 uni-app，uniCloud 的 admin 管理项目模板

### 目录结构

```bash
├── cloudfunctions              # 云函数
├── components                  # 自定义组件
├── js_sdk                      # js sdk
├── pages                       # 页面
│   │── index                   # 首页
│   └── login                   # 登录页
├── static
├── store                       # vuex
├── windows
│   └── leftWindow.vue          # 左侧窗口（菜单栏）
│   └── topWindow.vue           # 顶部窗口（导航栏）
├── admin.config.js             # 系统配置（配置导航，菜单等）
├── admin.plugin.js             # 系统插件（挂载原型方法，路由拦截等）
├── App.vue
├── main.js
├── mainfest.json
├── pages.json
├── postcss.config.js           # postcss 配置（浏览器兼容性）
└── uni.scss
```

### 顶部窗口（导航栏）

> 源码 [windows/topWindow.vue](https://github.com/dcloudio/uni-template-admin/blob/master/windows/topWindow.vue)

1. 通过 [admin.config.js](https://github.com/dcloudio/uni-template-admin/blob/master/admin.config.js) 配置导航栏内容

```js
export default {
    // 导航栏
    navBar: {
        // 左侧 Logo
        logo: "/static/logo.png",
        // 右侧链接
        links: [
            {
                text: "项目文档",
                url:
                    "https://github.com/dcloudio/uni-template-admin/blob/master/README.md",
            },
        ],
    },
};
```

2. 通过 [uni.scss](https://github.com/dcloudio/uni-template-admin/blob/master/uni.scss) 配置导航栏样式

```css
$top-window-bg-color: #fff; /* 背景色 */
$top-window-text-color: #999; /* 文字颜色 */
```

### 左侧窗口（菜单栏）

> 源码 [windows/leftWindow.vue](https://github.com/dcloudio/uni-template-admin/blob/master/windows/leftWindow.vue)

1. 通过 [admin.config.js](https://github.com/dcloudio/uni-template-admin/blob/master/admin.config.js) 配置侧边栏内容

```js
export default {
    // 侧边栏
    sideBar: {
        // 配置静态菜单列表（放置在用户被授权的菜单列表下边）
        secondaryMenus: [
            {
                name: "404页面",
                url: "/pages/error/404",
            },
        ],
    },
};
```

2. 通过 [uni.scss](https://github.com/dcloudio/uni-template-admin/blob/master/uni.scss) 配置侧边栏样式

```css
$left-window-bg-color: #fff; /* 侧边栏背景色 */
$menu-bg-color: #fff; /* 一级菜单背景色 */
$sub-menu-bg-color: darken($menu-bg-color, 10%); /* 二级以下菜单背景色 */
$menu-bg-color-hover: darken($menu-bg-color, 13%); /* 菜单 hover 背景颜色 */
$menu-text-color: #333; /* 菜单前景色 */
$menu-text-color-actived: #007aff; /* 菜单激活前景色 */
```

### 用户系统

> 基于 [uni-id](https://uniapp.dcloud.io/uniCloud/uni-id) 用户登录

1.  用户登录

-   源码 [pages/login/login.vue](https://github.com/dcloudio/uni-template-admin/blob/master/pages/login/login.vue)
-   通过 [admin.config.js](https://github.com/dcloudio/uni-template-admin/blob/master/admin.config.js) 自定义登录页面路径

```js
export default {
    login: {
        url: "/pages/login/login", // 登录页面路径
    },
};
```

2. 用户管理
    > TODO

### 权限系统

> 基于 [uni-id](https://uniapp.dcloud.io/uniCloud/uni-id?id=rbac-api) 角色权限

1. 角色管理
    > TODO
2. 权限管理
    > TODO
3. 菜单管理
    > TODO

### 数据库结构

1. [用户表（uni-id-users）](https://uniapp.dcloud.io/uniCloud/uni-id?id=%e7%94%a8%e6%88%b7%e8%a1%a8)
2. [验证码表（uni-verify）](https://uniapp.dcloud.io/uniCloud/uni-id?id=%e9%aa%8c%e8%af%81%e7%a0%81%e8%a1%a8)
3. [角色表（uni-id-roles）](https://uniapp.dcloud.io/uniCloud/uni-id?id=%e8%a7%92%e8%89%b2%e8%a1%a8)
4. [权限表（uni-id-permissions）](https://uniapp.dcloud.io/uniCloud/uni-id?id=%e6%9d%83%e9%99%90%e8%a1%a8)
5. 菜单表（opendb-admin-menu）
   | 字段 | 类型 | 必填 | 描述 |
   | ---------- | --------- | ---- | --------------------------------------|
   | \_id | Object ID | 是 | 系统自动生成的 Id |
   | name | String | 是 | |
   | icon | String | 否 | |
   | url | String | 否 | |
   | sort | Integer | 否 | |
   | parent_id | String | 否 | |
   | permission | Array | 否 | |
   | status | Integer | 是 | 菜单状态：0 禁用 1 启用 |
   | created_date | Timestamp | 是 | 创建时间 |

### 云函数

#### uni-admin
