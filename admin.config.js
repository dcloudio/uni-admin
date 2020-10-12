export default {
    login: {
        url: '/pages/login/login' // 登录页面路径
    },
    error: {
        url: '/pages/error/404' // 404 Not Found 错误页面路径
    },
    navBar: { // 顶部导航
        logo: '/static/logo.png', // 左侧 Logo
        links: [{ // 右侧链接
            text: '项目文档',
            url: 'https://github.com/dcloudio/uni-template-admin/blob/master/README.md'
        }, {
            text: '插件市场',
            url: 'https://ext.dcloud.net.cn/'
        }],
        debug: {
            enable: process.env.NODE_ENV !== 'production', //是否显示错误信息
            engine: [{ // 搜索引擎配置（每条错误信息后，会自动生成搜索链接，点击后跳转至搜索引擎）
                name: '百度',
                url: 'https://www.baidu.com/baidu?wd=ERR_MSG'
            }, {
                name: '谷歌',
                url: 'https://www.google.com/search?q=ERR_MSG'
            }]
        }
    },
    sideBar: { // 左侧菜单
        // 配置静态菜单列表（放置在用户被授权的菜单列表下边）
        secondaryMenus: [{
            _id: 'demo',
            name: '功能演示',
            icon: 'el-icon-menu',
            children: [{
                _id: 'icon',
                name: '图标',
                url: '/pages/demo/icons/icons'
            }, {
                _id: 'icon',
                name: '表格',
                url: '/pages/demo/table/table'
            }, {
                _id: 'errorLog',
                name: '错误日志模拟',
                url: '/pages/demo/error/error'
            }]
        }]
    }
}
