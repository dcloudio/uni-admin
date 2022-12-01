const db = uniCloud.database()

module.exports = async function () {
	try {
		const count = await db.collection('batch-sms-template').count()

		if (count.total > 0) {
			this.tableNames = {
				template: 'batch-sms-template',
				task: 'batch-sms-task',
				log: 'batch-sms-result'
			}
		}
	} catch (e) {}
}
