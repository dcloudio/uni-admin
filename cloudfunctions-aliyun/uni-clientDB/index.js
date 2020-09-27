const uniCurd = require('./uni-curd/index.js')
exports.main = async (event, context) => {
	const res = await uniCurd({
		event,
		debug: true
	})
	return res
};
