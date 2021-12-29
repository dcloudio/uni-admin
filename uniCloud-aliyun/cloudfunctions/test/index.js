'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	const res = await db.collection('uni-stat-app-page-view-daily').aggregate()
	.project({
		abc: db.command.aggregate.divide(['$num_visitor', '$num_share'])
	})
	.end()
	return res
};
