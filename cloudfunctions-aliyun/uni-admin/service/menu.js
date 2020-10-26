const {
    Service
} = require('uni-cloud-router')

function buildMenus(menuList) {
    // 保证父子级顺序
    menuList = menuList.sort(function(a, b) {
        if (a.parent_id === b.menu_id) {
            return 1
        }
        return -1
    })
    // 删除无subMenu且无url的菜单项
    for (let i = menuList.length - 1; i > -1; i--) {
        const currentMenu = menuList[i]
        const subMenu = menuList.filter(subMenuItem => subMenuItem.parent_id === currentMenu.menu_id)
        if (!currentMenu.url && !subMenu.length) {
            menuList.splice(i, 1)
        }
    }
    const menu = menuList.filter(item => !item.parent_id)

    function buildMenu(menu) {
        let nextLayer = []
        for (let i = menu.length - 1; i > -1; i--) {
            const currentMenu = menu[i]
            if (currentMenu.url) {
                continue
            }
            const subMenu = menuList.filter(item => item.parent_id === currentMenu.menu_id)
            nextLayer = nextLayer.concat(subMenu)
            currentMenu.children = subMenu
        }
        if (nextLayer.length) {
            buildMenu(nextLayer)
        }
    }
    buildMenu(menu)
    return menu
}

module.exports = class MenuService extends Service {
    async getMenu() {
        const permission = this.ctx.auth.permission
        let {
            data: menuList
        } = await this.db.collection('opendb-admin-menus').where({
            enable: true
        }).orderBy('sort', 'asc').limit(1000).get()

        // 删除无权限访问的菜单
        if (!this.ctx.auth.role.includes('admin')) {
            menuList = menuList.filter(item => {
                if (!item.permission || !item.permission.length) {
                    return true
                }
                return item.permission.some(item => permission.indexOf(item) > -1)
            })
        }
        return buildMenus(menuList)
    }

    async getAll() {
        const {
            data: menuList
        } = await this.db.collection('opendb-admin-menus').orderBy('sort', 'asc').get()
        return buildMenus(menuList)
    }
}
