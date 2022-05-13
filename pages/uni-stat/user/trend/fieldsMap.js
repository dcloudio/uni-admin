export default [{
	title: '日期',
	field: 'start_time',
	tooltip: '',
	formatter: '',
	stat: -1
}, {
	title: '新增用户',
	field: 'new_user_count',
	tooltip: '首次访问应用的用户数（以设备为判断标准，去重）',
	value: 0
}, {
	title: '活跃用户',
	field: 'active_user_count',
	tooltip: '访问过应用内任意页面的总用户数（去重）',
	value: 0
}, {
	title: '次均停留时长',
	field: 'avg_user_session_time',
	formatter: ':',
	tooltip: '平均每次打开应用停留在应用内的总时长，即应用停留总时长/启动次数',
	value: 0,
	stat: 'avg'
}, {
	title: '人均停留时长 ',
	field: 'avg_user_time',
	formatter: ':',
	tooltip: '平均每个用户停留在应用内的总时长，即应用停留总时长/活跃用户',
	value: 0,
	stat: 'avg'
}, {
	title: '总用户数',
	field: 'total_users',
	tooltip: '从添加统计到当前选择时间的总用户数（去重）',
	value: 0,
}]
