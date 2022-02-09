export default [{
	title: '最近发生时间',
	field: 'last_time',
	tooltip: '',
	formatter: '',
}, {
	title: '平台版本号',
	field: 'version',
	tooltip: '',
	formatter: '',
}, {
	title: '错误次数',
	field: 'count',
	tooltip: '',
}, {
	title: '错误占比',
	computed: 'count/total_count',
	field: 'count/total_count',
	formatter: '%',
	tooltip: '',
}, {
	title: '错误信息',
	field: 'hash',
	formatter: '',
}]
