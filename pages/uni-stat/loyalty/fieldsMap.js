export default [{
	title: '名称',
	field: 'name',
	tooltip: '',
	formatter: '',
}, {
	title: '访问人数',
	field: 'visit_users',
	tooltip: '',
	value: 0
}, {
	title: '访问人数占比',
	field: 'visit_users/total_visit_users',
	computed: 'visit_users/total_visit_users',
	formatter: '%',
	tooltip: '',
}, {
	title: '访问次数',
	field: 'visit_times',
	tooltip: '',
	value: 0
}, {
	title: '访问次数占比',
	field: 'visit_times/total_visit_times',
	computed: 'visit_times/total_visit_times',
	formatter: '%',
	tooltip: '',
}]
