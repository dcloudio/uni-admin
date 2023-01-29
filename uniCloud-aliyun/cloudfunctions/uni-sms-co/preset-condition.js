const presetCondition = {
	all: {},
	'7-day-offline-users': () => ({
		last_login_date: {
			type: 'lt',
			value: Date.now() - (7 * 24 * 60 * 60 * 1000)
		}
	}),
	'15-day-offline-users': () => ({
		last_login_date: {
			type: 'lt',
			value: Date.now() - (15 * 24 * 60 * 60 * 1000)
		}
	}),
	'30-day-offline-users': () => ({
		last_login_date: {
			type: 'lt',
			value: Date.now() - (30 * 24 * 60 * 60 * 1000)
		}
	})
}

function conditionConvert(condition, command) {
	const newCondition = {}

	for (const key in condition) {
		const field = condition[key]

		switch (field.type) {
			case 'search':
				newCondition[key] = new RegExp(field.value)
				break
			case 'select':
				if (field.value.length) {
					newCondition[key] = command.or(
						field.value.map(value => command.eq(value))
					)
				}
				break
			case 'range':
				if (field.value.length) {
					const [gt, lt] = field.value
					newCondition[key] = command.and([
						command.gte(gt),
						command.lte(lt)
					])
				}
				break
			case 'date':
				if (field.value.length) {
					const [startTimestamp, endTimestamp] = field.value
					const startDate = new Date(startTimestamp)
					const endDate = new Date(endTimestamp)

					newCondition[key] = command.and([
						command.gte(startDate),
						command.lte(endDate)
					])
				}
				break
			case 'timestamp':
				if (field.value.length) {
					const [startDate, endDate] = field.value

					newCondition[key] = command.and([
						command.gte(startDate),
						command.lte(endDate)
					])
				}
				break
			case 'lt':
				newCondition[key] = command.lt(field.value)
				break
		}
	}

	return newCondition
}


module.exports.presetCondition = presetCondition
module.exports.conditionConvert = conditionConvert
