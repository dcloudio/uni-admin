export default [{
	title: '受访页',
	field: 'path',
	tooltip: '设备进入应用访问的所有页面，例如设备从页面1进入应用，跳转到页面2，1,2均为受访页',
	stat: -1
}, {
	title: '页面名称',
	field: 'title',
	stat: -1
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
	tooltip: '访问过应用内任意页面总次数，多个页面之间跳转、同一页面的重复访问计为多次访问；',
	value: 0
}, {
	title: '退出页次数',
	field: 'exit_times',
	tooltip: '作为访问会话最后一个访问页面(即离开页）的次数',
	value: 0
}, {
	title: '退出率',
	field: 'exitRate',
	computed: 'exit_times/visit_times',
	formatter: '%',
	tooltip: '在此页面，选择离开应用占此页面访问次数的比例',
	// value: 0,
	stat: -1
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
	title: '设备平均停留时长',
	field: 'avg_user_time',
	computed: 'duration/visit_devices',
	formatter: ':',
	tooltip: '平均每个设备停留在应用内的总时长，即应用停留总时长/访问设备数',
	value: 0
}, {
	title: '分享次数',
	field: 'share_count',
	tooltip: '页面被分享成功的次数',
	value: 0
}]
