const {
    Service
} = require('uni-cloud-router')

module.exports = class UserService extends Service {
    async getMenu() {
        const permission = this.ctx.auth.permission
        let {
            data: menuList
        } = await this.db.collection('opendb-admin-menu').where({
            status: 1
        }).limit(1000).get()

        // 删除无权限访问的菜单
        menuList = menuList.filter(item => {
            if (!item.permission || !item.permission.length) {
                return true
            }
            return item.permission.some(item => permission.indexOf(item) > -1)
        })

        // 简单实现删除无subMenu且无url的菜单项
        // let lastMenuList = []
        // while (lastMenuList.length !== menuList.length) {
        //     lastMenuList = menuList
        //     menuList = menuList.filter(item => {
        //         const subMenu = menuList.filter(subMenuItem => subMenuItem.parent_id === item._id)
        //         return item.url || subMenu.length
        //     })
        // }

        // 保证父子级顺序
        menuList = menuList.sort(function(a, b) {
            if (a.parent_id === b._id) {
                return 1
            }
            return -1
        })

        // 删除无subMenu且无url的菜单项
        for (let i = menuList.length - 1; i > -1; i--) {
            const currentMenu = menuList[i]
            const subMenu = menuList.filter(subMenuItem => subMenuItem.parent_id === currentMenu._id)
            if (!currentMenu.url && !subMenu.length) {
                menuList.splice(i, 1)
            }
        }

        const menu = menuList.filter(item => !item.parent_id).sort((a, b) => {
            return a.sort - b.sort
        })

        function buildMenu(menu) {
            let nextLayer = []
            for (let i = menu.length - 1; i > -1; i--) {
                const currentMenu = menu[i]
                if (currentMenu.url) {
                    continue
                }
                const subMenu = menuList.filter(item => item.parent_id === currentMenu._id).sort((a, b) => {
                    return a.sort - b.sort
                })
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
}
