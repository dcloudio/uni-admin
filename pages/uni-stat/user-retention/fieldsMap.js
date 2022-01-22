function fieldsFactory() {
	let fieldsMap = [{
			title: '日期',
			field: 'stat_date',
			tooltip: '',
			formatter: '',
		}, {
			title: '名称',
			field: 'name',
			tooltip: '',
			formatter: '',
		}
	]

	const values = [1, 2, 3, 4, 5, 6, 7, 14, 30]
	const fields = values.map(val => {
		return {
			title: `${val}天后`,
			field: `d_${val}`,
			formatter: '%',
			tooltip: ''
		}
	})

	fieldsMap = fieldsMap.concat(fields)

	return fieldsMap


}

export default fieldsFactory()
