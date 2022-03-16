'use strict';
const success = {
	success: true
}
const fail = {
	success: false
}
const createPublishHtml = require('./createPublishHtml')

exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)

	const db = uniCloud.database()
	const appListDBName = 'opendb-app-list'
	const appPublishDBName = 'opendb-app-publish'
	const appVersionDBName = 'opendb-app-versions'
	let res = {};
	let params = event.data || event.params;

	switch (event.action) {
		case 'deleteFile':
			res = await uniCloud.deleteFile({
				fileList: params.fileList
			})
			break;
		case 'setPublishData':
			params.value.create_date = Date.now()
			res = await db.collection(appPublishDBName).doc(params.id).set(params.value)
			break;
		case 'getAppInfo':
			let dbAppList
			try {
				dbAppList = db.collection(appListDBName)
			} catch (e) {}

			if (!dbAppList) return fail;

			const dbAppListRecord = await dbAppList.where({
				appid: params.appid
			}).get()

			if (dbAppListRecord && dbAppListRecord.data.length)
				return Object.assign({}, success, dbAppListRecord.data[0])

			//返回数据给客户端
			return fail
			break;
		case 'getAppVersionInfo':
			let dbVersionList
			try {
				dbVersionList = db.collection(appVersionDBName)
			} catch (e) {}

			if (!dbVersionList) return fail;

			const dbVersionListrecord = await dbVersionList.where({
					appid: params.appid,
					platform: params.platform,
					type: "native_app",
					stable_publish: true
				})
				.orderBy('create_date', 'desc')
				.get();

			if (dbVersionListrecord && dbVersionListrecord.data && dbVersionListrecord.data.length > 0)
				return Object.assign({}, dbVersionListrecord.data[0], success)

			return fail
			break;
		case 'createPublishHtml':
			res = createPublishHtml(params.id)
			break;
	}

	//返回数据给客户端
	return res
};
