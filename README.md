# uni-template-admin

> 基于 uni-app，uniCloud 的 admin 管理项目模板

### 使用

#### 创建

[HBuilderX](https://www.dcloud.io/hbuilderx.html) 新建 uni-app 项目，选择 admin 项目模板。

#### 运行

1. 进入 admin 项目
2. 右键 cloudfuntions 运行云服务空间初始化向导
3. 点击工具栏的运行 -> 运行到浏览器
4. 登录页面底部进入创建管理员页面（仅允许注册一次管理员账号）

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
$left-window-bg-color: #fff; /* 左侧窗口背景色 */
$menu-bg-color: #fff; /* 一级菜单背景色 */
$sub-menu-bg-color: darken($menu-bg-color, 8%); /* 二级以下菜单背景色 */
$menu-bg-color-hover: darken($menu-bg-color, 15%); /* 菜单 hover 背景颜色 */
$menu-text-color: #333; /* 菜单前景色 */
$menu-text-color-actived: #409eff; /* 菜单激活前景色 */
```

### 用户系统

> 基于 [uni-id](https://uniapp.dcloud.io/uniCloud/uni-id) 用户登录

1.  用户登录

-   源码 [pages/login/login.vue](https://github.com/dcloudio/uni-template-admin/blob/master/pages/login/login.vue)

注意：首次使用，可以通过登录页面底部链接创建一个超级管理员（仅允许创建一次），注册完毕后，建议从登录页面移除该链接

### 权限系统

> 基于 [uni-id](https://uniapp.dcloud.io/uniCloud/uni-id?id=rbac-api) 角色权限

1. 角色表
    > [详情](https://uniapp.dcloud.io/uniCloud/uni-id?id=%e8%a7%92%e8%89%b2%e8%a1%a8)
2. 权限表
    > [详情](https://uniapp.dcloud.io/uniCloud/uni-id?id=%e6%9d%83%e9%99%90%e8%a1%a8)
3. 菜单表
   | 字段 | 类型 | 必填 | 描述 |
   | ---------- | --------- | ---- | -------------------------------------- |
   | \_id | Object ID | 是 | 系统自动生成的 Id |
   | name | String | 是 | 菜单文字 |
   | icon | String | 否 | 菜单图标 |
   | url | String | 否 | 菜单对应的页面链接（只有没有子菜单的菜单项可以配置） |
   | sort | Integer | 否 | 在同级菜单中的排序，数组越大越靠后 |
   | parent_id | String | 否 | 父级菜单 Id |
   | permission | Array | 否 | 菜单权限（只有没有子菜单的菜单项可以配置） |
   | status | Integer | 是 | 菜单状态：0 禁用 1 启用 |
   | created_date | Timestamp | 是 | 创建时间 |
4. 权限验证
    ```html
    <template>
        <view>
            <!-- 包含 user/add 权限的用户可以看到新增按钮 -->
            <button v-if="$hasPermission('user/add')">新增</button>
            <!-- 包含 admin 角色的用户可以看到删除按钮 -->
            <button v-if="$hasRole('admin')">删除</button>
        </view>
    </template>
    ```

### 新增页面

1. 新增前端 vue 页面

2. 新增后端 api 接口

### 云函数

#### uni-clientDB

> [详情](https://uniapp.dcloud.io/uniCloud/uni-clientDB)

### 使用三方组件库
