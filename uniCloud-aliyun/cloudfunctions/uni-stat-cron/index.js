'use strict';
const uniStat = require('uni-stat')
exports.main = async (event, context) => {
	//数据跑批处理函数
	let res = await uniStat.init().statCron(context)
	return res
};
