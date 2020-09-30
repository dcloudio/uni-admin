export default {
    loginPageUrl: '/pages/login/login', // 登录页面路径
    notFoundPageUrl: '/pages/error/404', // 404 Not Found 错误页面路径
    navBar: { // 顶部导航
        logo: '', // 左侧 Logo
        links: [{ // 右侧链接
            text: '项目文档',
            url: 'https://github.com/dcloudio/uni-template-admin/blob/master/README.md'
        }]
    },
    sideBar: { // 左侧菜单
        secondaryMenus: [{
            name: '404页面',
            url: '/pages/error/404'
        }]
    }
}
