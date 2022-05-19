export default [{
	title: '入口页',
	field: 'path',
	tooltip: '设备进入应用访问的第一个页面，例如设备从页面1进入应用，跳转到页面2，1为入口页，而2不是',
}, {
	title: '页面名称',
	field: 'title',
}, 
// {
// 	title: '访问设备数',
// 	field: 'visit_devices',
// 	tooltip: '访问过应用内任意页面的总设备数（去重）',
// 	value: 0
// }, 
{
	title: '访问次数',
	field: 'visit_times',
	tooltip: '访问过应用内任意页面总次数，多个页面之间跳转、同一页面的重复访问计为多次访问',
	value: 0
}, {
	title: '入口页次数',
	field: 'entry_count',
	tooltip: '作为访问会话第一个访问页面（即着陆页）的次数',
	value: 0
}, {
	title: '跳出率',
	field: 'bounce_rate',
	formatter: '%%',
	tooltip: '只浏览一个页面便离开应用的次数占总启动次数的百分比',
	value: 0,
	stat: 'avg'
}, {
	title: '访问总时长',
	field: 'duration',
	disabled: true,
}, {
	title: '次均停留时长',
	field: 'avg_device_session_time',
	computed: 'duration/visit_times',
	formatter: ':',
	tooltip: '平均每次打开应用停留在应用内的总时长，即应用停留总时长/启动次数',
	value: 0
}, {
	title: '设备平均停留时长 ',
	field: 'avg_user_time',
	computed: 'duration/visit_devices',
	formatter: ':',
	tooltip: '平均每个设备停留在应用内的总时长，即应用停留总时长/访问设备数',
	value: 0
}, ]
