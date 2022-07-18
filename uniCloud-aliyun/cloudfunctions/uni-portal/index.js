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

	let res = {};
	let params = event.data || event.params;

	switch (event.action) {
		case 'createPublishHtml':
			res = createPublishHtml(params.id)
			break;
	}

	//返回数据给客户端
	return res
};
