const fieldsMap = [{
	value: '今天',
	contrast: '昨天'
}, {
	title: '新增设备',
	field: 'new_device_count',
	tooltip: '首次访问应用的设备数（以设备为判断标准，去重）',
	value: 0,
	contrast: 0
}, {
	title: '活跃设备',
	field: 'active_device_count',
	tooltip: '访问过应用内任意页面的总设备数，今日数据为每小时活跃设备累加（未虑重），昨日数据为全天活跃设备虑重后结果',
	value: 0,
	contrast: 0
}, {
	title: '访问次数',
	field: 'page_visit_count',
	tooltip: '访问过应用内任意页面总次数，多个页面之间跳转、同一页面的重复访问计为多次访问',
	value: 0,
	contrast: 0
}, {
	title: '启动次数',
	field: 'app_launch_count',
	tooltip: '设备从打开应用到主动关闭应用或超时退出计为一次启动',
	value: 0,
	contrast: 0
}, {
	title: '次均停留时长',
	field: 'avg_device_session_time',
	formatter: ':',
	tooltip: '平均每次打开应用停留在应用内的总时长，即应用停留总时长/启动次数',
	value: 0,
	contrast: 0,
	stat: 'avg'
}, {
	title: '设备平均停留时长 ',
	field: 'avg_device_time',
	formatter: ':',
	tooltip: '平均每个设备停留在应用内的总时长，即应用停留总时长/活跃设备',
	value: 0,
	contrast: 0,
	stat: 'avg'
}, {
	title: '跳出率',
	field: 'bounceRate',
	computed: 'bounce_times/app_launch_count',
	formatter: '%',
	tooltip: '只浏览一个页面便离开应用的次数占总启动次数的百分比',
	value: 0,
	contrast: 0,
	fix: 2
}, {
	title: '总设备数',
	field: 'total_devices',
	tooltip: '从添加统计到当前选择时间的总设备数（去重）',
	value: 0,
	contrast: 0
}]

const resFieldsMap = [{
	title: '受访页',
	field: 'path',
	tooltip: '设备进入应用访问的所有页面，例如设备从页面1进入应用，跳转到页面2，1,2均为受访页',
	formatter: ''
}, {
	title: '访问次数',
	field: 'visit_times',
	tooltip: '访问该页面的总次数',
	value: 0

}, {
	title: '占比',
	field: 'rate',
	computed: 'visit_times/total_app_access',
	tooltip: '页面的访问次数占所有页面访问次数的比例',
	formatter: '%',
}]

const entFieldsMap = [{
	title: '入口页',
	field: 'path',
	tooltip: '设备进入应用访问的第一个页面，例如设备从页面1进入应用，跳转到页面2，1为入口页，而2不是',
	formatter: ''
}, {
	title: '入口页次数',
	field: 'entry_count',
	tooltip: '访问该入口页的总次数',
	value: 0
}, {
	title: '占比',
	field: 'rate',
	computed: 'entry_count/total_app_access',
	tooltip: '页面的入口页次数占所有页面访问次数的比例',
	formatter: '%'
}]

export {
	fieldsMap,
	resFieldsMap,
	entFieldsMap
}
