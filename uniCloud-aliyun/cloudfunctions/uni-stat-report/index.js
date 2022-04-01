'use strict';
const uniStat = require('uni-stat')
exports.main = async (event, context) => {
	//数据上报处理函数
	let res = await uniStat.init().report(event)
	return res
};
