'use strict';
exports.main = async (event, context) => {
	const db = uniCloud.database();
	const users = db.collection('uni-id-users');
	const roles = db.collection('uni-id-roles');
	const permissions = db.collection('uni-id-permissions');
	const menus = db.collection('opendb-admin-menus');
	const dbCmd = db.command

	/**
	 * 删除 uni-id-users 中所有的数据
	 */
	await users.where({
		_id: dbCmd.exists(true)
	}).remove()

	/**
	 * 插入 admin 的数据
	 */
	await users.add({
		"username": "admin",
		"password": "03caebb36670995fc261a275d212cad65e4bbebd",
		"role": [
			"admin"
		],
		"register_date": 1613804974295,
		"register_ip": "123.120.11.117",
		"token": [
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDMwYjVhZTE3MWU3NDAwMDFkNGZiZDEiLCJyb2xlIjpbImFkbWluIl0sInBlcm1pc3Npb24iOltdLCJjbGllbnRJZCI6ImEyODczYWY2OWJlNTkwOWM2NWJkNDBmODY4OGMzODFlIiwiaWF0IjoxNjE0MTM5Njg4LCJleHAiOjE2MTY3MzE2ODh9.AWK9sOC0bkhE6ixdmMR_G4yULhAH7fCLnfw0cElQ9fA",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDMwYjVhZTE3MWU3NDAwMDFkNGZiZDEiLCJyb2xlIjpbImFkbWluIl0sInBlcm1pc3Npb24iOltdLCJjbGllbnRJZCI6ImEyODczYWY2OWJlNTkwOWM2NWJkNDBmODY4OGMzODFlIiwiaWF0IjoxNjE0MTQ5MDQ4LCJleHAiOjE2MTY3NDEwNDh9.EY2vwFIlyyjBZWblDHb_m4vEK6VUt9VhxyeW6WZeeZY",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDMwYjVhZTE3MWU3NDAwMDFkNGZiZDEiLCJyb2xlIjpbImFkbWluIl0sInBlcm1pc3Npb24iOltdLCJjbGllbnRJZCI6ImEyODczYWY2OWJlNTkwOWM2NWJkNDBmODY4OGMzODFlIiwiaWF0IjoxNjE0MTUwMDA3LCJleHAiOjE2MTY3NDIwMDd9.qcBOC3u6WW9F7mfWSj2_f66kUROoDoA0kj4F67-qmAs",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDMwYjVhZTE3MWU3NDAwMDFkNGZiZDEiLCJyb2xlIjpbImFkbWluIl0sInBlcm1pc3Npb24iOltdLCJjbGllbnRJZCI6ImEyODczYWY2OWJlNTkwOWM2NWJkNDBmODY4OGMzODFlIiwiaWF0IjoxNjE0MTUwNTYwLCJleHAiOjE2MTY3NDI1NjB9.MdmBFYt5moQC5n1CkMsj-XRoNlymSo85UxECQsB5g-I",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDMwYjVhZTE3MWU3NDAwMDFkNGZiZDEiLCJyb2xlIjpbImFkbWluIl0sInBlcm1pc3Npb24iOltdLCJjbGllbnRJZCI6ImEyODczYWY2OWJlNTkwOWM2NWJkNDBmODY4OGMzODFlIiwiaWF0IjoxNjE0ODQ2ODcxLCJleHAiOjE2MTc0Mzg4NzF9.WsioM-Yue7V-hKU5AjbxBrGW4vAF_-pAeHnq0u0n8Zk",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDQ3MmI0MTM3ZGU2NDAwMDE1ZTAyNjQiLCJyb2xlIjpbImFkbWluIiwidGVzdDIiXSwicGVybWlzc2lvbiI6W10sImNsaWVudElkIjoiNDU5M2Y0YjY2OTlmMWE5NDc5ZDNiYTZlOGZkNDdkYWQiLCJpYXQiOjE2MTU1NTE0NTEsImV4cCI6MTYxNTU1ODY1MX0.VI8hmGmULbdvYTJ6SMSiamvUpDhqCvq1CQIGUKQ0srA",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDQ3MmI0MTM3ZGU2NDAwMDE1ZTAyNjQiLCJyb2xlIjpbImFkbWluIiwidGVzdDIiXSwicGVybWlzc2lvbiI6W10sImNsaWVudElkIjoiNDU5M2Y0YjY2OTlmMWE5NDc5ZDNiYTZlOGZkNDdkYWQiLCJpYXQiOjE2MTU1NTE1NTAsImV4cCI6MTYxNTU1ODc1MH0.dh0YB3X33TIk2jpIkdSFtSqfcxSD87HGrdOwb6MPqls",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDQ3MmI0MTM3ZGU2NDAwMDE1ZTAyNjQiLCJyb2xlIjpbImFkbWluIiwidGVzdDIiXSwicGVybWlzc2lvbiI6W10sImNsaWVudElkIjoiZGI3MWU2M2Q4NDFkNjRiZTg2MTQ5ZjMxNWU0NjVkNWYiLCJpYXQiOjE2MTU1NTE1NTIsImV4cCI6MTYxNTU1ODc1Mn0.VSzIpnpGkXbKvog3wCpdud490dt_fT8kwwtV80FyjBA",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDQ3MmI0MTM3ZGU2NDAwMDE1ZTAyNjQiLCJyb2xlIjpbImFkbWluIiwidGVzdDIiXSwicGVybWlzc2lvbiI6W10sImNsaWVudElkIjoiNDU5M2Y0YjY2OTlmMWE5NDc5ZDNiYTZlOGZkNDdkYWQiLCJpYXQiOjE2MTU1NTIxMzEsImV4cCI6MTYxNTU1OTMzMX0.WK9pvEqJ3By2aQ7xatuzU8h5fklwaV3EVpfW7OyQZEg",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDQ3MmI0MTM3ZGU2NDAwMDE1ZTAyNjQiLCJyb2xlIjpbImFkbWluIiwidGVzdDIiXSwicGVybWlzc2lvbiI6W10sImNsaWVudElkIjoiNmUwNjUzMWRlNjQ1ZjliYTlhNDI4ZmM5YWY3OWY0ZjUiLCJpYXQiOjE2MTU1NTM3OTUsImV4cCI6MTYxNTU2MDk5NX0.U3VHGyLRV-gZhZZFCFVQZIzatsDxufGnS-zRIkcFKeQ",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDQ3MmI0MTM3ZGU2NDAwMDE1ZTAyNjQiLCJyb2xlIjpbImFkbWluIiwidGVzdDIiXSwicGVybWlzc2lvbiI6W10sImNsaWVudElkIjoiMGRmYjNlZjljMWI0OGY3ZGI3N2MyZTMwNjQ4NjRjOTEiLCJpYXQiOjE2MTU1NTQ2ODksImV4cCI6MTYxNTU2MTg4OX0.jqc2Qe08UBaPqkFYTOdHJrOA7ctZIfpHOlBqZpcFnX4",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDQ3MmI0MTM3ZGU2NDAwMDE1ZTAyNjQiLCJyb2xlIjpbImFkbWluIiwidGVzdDIiXSwicGVybWlzc2lvbiI6W10sImNsaWVudElkIjoiOGY0MTUyNTJhMGEzYjUxNzk5MDExMjE4M2U2ZWI2NTEiLCJpYXQiOjE2MTU1NTQ5NzQsImV4cCI6MTYxNTU2MjE3NH0.PKrQNmhXbpLjvWsqK8YR986kH68rbx37gScGyaSO4Yc",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDQ3MmI0MTM3ZGU2NDAwMDE1ZTAyNjQiLCJyb2xlIjpbImFkbWluIiwidGVzdDIiXSwicGVybWlzc2lvbiI6W10sImNsaWVudElkIjoiMzI3NjA1NDY5OGRmMDEyOTcwMDUwNzlmZTZkMGY1ZjYiLCJpYXQiOjE2MTU1NTUwMzgsImV4cCI6MTYxNTU2MjIzOH0.kNE0sB0D3mHmOQO3LOHpgV4pLUpNL1giWZfc1PZ8FU4",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDQ3MmI0MTM3ZGU2NDAwMDE1ZTAyNjQiLCJyb2xlIjpbImFkbWluIiwidGVzdDIiXSwicGVybWlzc2lvbiI6W10sImNsaWVudElkIjoiMzI3NjA1NDY5OGRmMDEyOTcwMDUwNzlmZTZkMGY1ZjYiLCJpYXQiOjE2MTU1NTUwNzIsImV4cCI6MTYxNTU2MjI3Mn0.rgyjtlnmRzmfUuUHcJPxAmCc-hf5vQB8SKl5QaQmGjE",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDQ3MmI0MTM3ZGU2NDAwMDE1ZTAyNjQiLCJyb2xlIjpbImFkbWluIiwidGVzdDIiXSwicGVybWlzc2lvbiI6W10sImNsaWVudElkIjoiOGZhODliZGZhZmJlZTQzOGQ4YWRmYmFhZGNkOWMzY2MiLCJpYXQiOjE2MTU1NTU1MjIsImV4cCI6MTYxNTU2MjcyMn0.qV8SdpozqX2-q6M48mRa5_uioxoSmCee9ufUsLSOdLA",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDQ3MmI0MTM3ZGU2NDAwMDE1ZTAyNjQiLCJyb2xlIjpbImFkbWluIiwidGVzdDIiXSwicGVybWlzc2lvbiI6W10sImNsaWVudElkIjoiNWFhNDg3NmRiZGZlZWRhNGQ1MzIxMDQyNWFmYmQ3NDUiLCJpYXQiOjE2MTU1NTU3MDMsImV4cCI6MTYxNTU2MjkwM30.tsuD5W3IuEVZdrQ1FE4XW3eHhvq5Lcs6ig2s_33udws",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDQ3MmI0MTM3ZGU2NDAwMDE1ZTAyNjQiLCJyb2xlIjpbImFkbWluIiwidGVzdDIiXSwicGVybWlzc2lvbiI6W10sImNsaWVudElkIjoiZjU1NGEzOGVhOTAwMjJmNjBkOGEwYTMxNjJiODE5MzciLCJpYXQiOjE2MTU1NTU3NTQsImV4cCI6MTYxNTU2Mjk1NH0.Xdv5LPlhQ0zE2xhdyUJRIcXQQK_VvAgrcXlxSiGVi8o",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDQ3MmI0MTM3ZGU2NDAwMDE1ZTAyNjQiLCJyb2xlIjpbImFkbWluIiwidGVzdDIiXSwicGVybWlzc2lvbiI6W10sImNsaWVudElkIjoiZGI3MWU2M2Q4NDFkNjRiZTg2MTQ5ZjMxNWU0NjVkNWYiLCJpYXQiOjE2MTU1NTU3NTUsImV4cCI6MTYxNTU2Mjk1NX0.u6HRDCA5JpyC7whsSfP9KZ6-fRCyyVldzky29MOsx5Y",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDQ3MmI0MTM3ZGU2NDAwMDE1ZTAyNjQiLCJyb2xlIjpbImFkbWluIiwidGVzdDIiXSwicGVybWlzc2lvbiI6W10sImNsaWVudElkIjoiZWI4NzZlZjgzZDBhMjA4MWY1NzExNDE5MmYwNjliZDciLCJpYXQiOjE2MTU1NTU4MzUsImV4cCI6MTYxNTU2MzAzNX0.F85tK0l2IL8x2NHjCtO8lTiNcEfC7t2H64kO5tJI3oo",
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI2MDQ3MmI0MTM3ZGU2NDAwMDE1ZTAyNjQiLCJyb2xlIjpbImFkbWluIiwidGVzdDIiXSwicGVybWlzc2lvbiI6W10sImNsaWVudElkIjoiOGZhODliZGZhZmJlZTQzOGQ4YWRmYmFhZGNkOWMzY2MiLCJpYXQiOjE2MTU1NTYzMDcsImV4cCI6MTYxNTU2MzUwN30.E-xq_bUqfZcbKWAqvWdrzppRpyJCFt5NvxJuRTMIQzc"
		],
		"last_login_date": 1615556307145,
		"last_login_ip": "123.120.4.255",
		"login_ip_limit": [],
		"status": 0
	})


	/**
	 * 删除 uni-id-roles 中所有数据
	 */
	await roles.where({
		_id: dbCmd.exists(true)
	}).remove()


	/**
	 * 删除 uni-id-roles 中所有数据
	 */
	await roles.add({
		"role_id": "admin",
		"role_name": "超级管理员",
		"permission": [],
		"comment": "超级管理员拥有所有权限",
		"create_date": 0
	})

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
		"create_date": 1602662469396
	}, {
		"menu_id": "system_user",
		"name": "用户管理",
		"icon": "uni-icons-person",
		"url": "/pages/system/user/list",
		"sort": 1010,
		"parent_id": "system_management",
		"permission": [],
		"enable": true,
		"create_date": 1602662469398
	}, {
		"menu_id": "system_role",
		"name": "角色管理",
		"icon": "uni-icons-personadd",
		"url": "/pages/system/role/list",
		"sort": 1020,
		"parent_id": "system_management",
		"permission": [],
		"enable": true,
		"create_date": 1602662469397
	}, {
		"menu_id": "system_permission",
		"name": "权限管理",
		"icon": "uni-icons-locked",
		"url": "/pages/system/permission/list",
		"sort": 1030,
		"parent_id": "system_management",
		"permission": [],
		"enable": true,
		"create_date": 1602662469396
	}, {
		"menu_id": "system_menu",
		"name": "菜单管理",
		"icon": "uni-icons-settings",
		"url": "/pages/system/menu/list",
		"sort": 1040,
		"parent_id": "system_management",
		"permission": [],
		"enable": true,
		"create_date": 1602662469396
	}])
};
