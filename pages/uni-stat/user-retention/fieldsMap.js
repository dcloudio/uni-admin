function fieldsFactory(maps = [{
	title: '新增用户',
	field: 'new_user_count',
	stat: 0
}]) {
	let fieldsMap = [{
		title: '日期',
		field: 'start_time',
		tooltip: '',
		formatter: '-',
		stat: -1
	}]

	if (maps) {
		fieldsMap.push(...maps)
	}

	const values = [1, 2, 3, 4, 5, 6, 7, 14, 30]
	const fields = values.map(val => {
		return {
			title: `${val}天后`,
			field: `d_${val}`,
			computed: `d_${val}/${maps[0].field}`,
			formatter: '%',
			tooltip: ''
		}
	})

	fieldsMap = fieldsMap.concat(fields)

	return fieldsMap


}

export default fieldsFactory
