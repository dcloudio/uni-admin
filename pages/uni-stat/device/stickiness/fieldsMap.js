export default [{
	title: '名称',
	field: 'name',
	tooltip: '',
	formatter: '',
}, {
	title: '访问人数',
	field: 'visit_devices',
	tooltip: '访问人数（活跃用户数）：访问过应用内任意页面的总用户数（去重）',
	value: 0
}, {
	title: '访问人数占比',
	field: 'visit_devices/total_visit_devices',
	computed: 'visit_devices/total_visit_devices',
	formatter: '%',
}, {
	title: '访问次数',
	field: 'visit_times',
	tooltip: '访问过应用内任意页面总次数，多个页面之间跳转、同一页面的重复访问计为多次访问',
	value: 0
}, {
	title: '访问次数占比',
	field: 'visit_times/total_visit_times',
	computed: 'visit_times/total_visit_times',
	formatter: '%',
	tooltip: '',
}]
