'use strict';
exports.main = async (event, context) => {
	const db = uniCloud.database();
	const users = db.collection('uni-id-users');
	const roles = db.collection('uni-id-roles');
	const permissions = db.collection('uni-id-permissions');
	const menus = db.collection('opendb-admin-menus');
	const dbCmd = db.command

	/**
	 * 删除 uni-id-users 中 username 不是 admin 的数据
	 */
	await users.where({
	    username: dbCmd.neq('admin')
	}).remove()

	/**
	 * 删除 uni-id-roles 中 role_id 不是 admin 的数据
	 */
	await roles.where({
		role_id: dbCmd.neq('admin')
	}).remove()

	/**
	 * 删除 uni-id-permissions 中的所有数据
	 */
	await permissions.where({
		_id: dbCmd.exists(true)
	}).remove()

	/**
	 * 重置 opendb-admin-menus 中的数据
	 */
	await menus.where({
		_id: dbCmd.exists(true)
	}).remove()

	await menus.add([{
		"menu_id": "system_management",
		"name": "系统管理",
		"icon": "uni-icons-gear",
		"url": "",
		"sort": 1000,
		"parent_id": "",
		"permission": [],
		"enable": true,
	}, {
		"menu_id": "system_user",
		"name": "用户管理",
		"icon": "",
		"url": "/pages/system/user/list",
		"sort": 1010,
		"parent_id": "system_management",
		"permission": [],
		"enable": true,
	}, {
		"menu_id": "system_role",
		"name": "角色管理",
		"icon": "",
		"url": "/pages/system/role/list",
		"sort": 1020,
		"parent_id": "system_management",
		"permission": [],
		"enable": true,
	}, {
		"menu_id": "system_permission",
		"name": "权限管理",
		"icon": "",
		"url": "/pages/system/permission/list",
		"sort": 1030,
		"parent_id": "system_management",
		"permission": [],
		"enable": true,
	}, {
		"menu_id": "system_menu",
		"name": "菜单管理",
		"icon": "",
		"url": "/pages/system/menu/list",
		"sort": 1040,
		"parent_id": "system_management",
		"permission": [],
		"enable": true,
	}])
};
