'use strict';
var db = uniCloud.database(); // 全局数据库引用
var _ = db.command; // 数据库操作符
var $ = _.aggregate; // 聚合查询操作符
exports.main = async (event, context) => {

	// 清空以下表
	await db.collection("opendb-verify-codes").remove();
	await db.collection("uni-id-log").remove();

	return {
		errCode: 0,
		errMsg: 'ok'
	}
};
