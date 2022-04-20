'use strict';
const uniStat = require('uni-stat')
const uniID = require('uni-id')
exports.main = async (event, context) => {
	const token = event.uniIdToken ? event.uniIdToken : ''
	let uid
	if(token) {
		const tokenRes  = uniID.createInstance({
			context
		}).checkToken(token)
		
		if(tokenRes.code) {
			uid = tokenRes.uid
		}
	}
	//数据上报处理函数
	return await uniStat.init().report(event, {
		...context,
		uid: uid
	})
};
