export default {
    loginPagePath: '/pages/login/login', // 登录页面路径
    navBar: { // 顶部导航
        logo: '', // 左侧 Logo
        links: [{ // 右侧链接
            text: '项目文档',
            url: 'https://github.com/dcloudio/uni-template-admin/blob/master/README.md'
        }]
    },
    sideBar: { // 左侧菜单
        secondaryMenus: [{
            name: '错误页面',
            children: [{
                    name: '401',
                    url: 'pages/demo/401'
                },
                {
                    name: '404',
                    url: 'pages/demo/404'
                }
            ]
        }, { // 次级菜单配置(显示在授权菜单下方)
            name: '权限',
            url: 'pages/demo/permission'
        }, {
            name: '图标',
            url: 'pages/demo/icon'
        }]
    }
}
