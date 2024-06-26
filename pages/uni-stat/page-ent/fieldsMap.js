/**
 * 页面上的数据都来自数据库，且多处 ui 消费，页面直接使用字段会造成耦合和冗余，固在此抽出来统一配置（clientdb 查询方法、概念文字提示等）和处理（对值再计算、格式化等）
 * title 显示所使用名称
 * field 数据库字段名
 * computed 计算表达式配置，只支持除法计算（需要 mapfield 函数支持，也可自行扩展）
 * tooltip 对字段解释的提示文字
 * formatter 数字格式化的配置，省缺为 ','
  	* '' 空字符串 则表示不格式化
	* ',' 数字格式，例：1000 格式为 1,000
	* '%' 百分比格式 例：0.1 格式为 10%
	* ':' 时分秒格式 例：90 格式为 00:01:30
	* '-' 日期格式 例：1655196831390(值需为时间戳) 格式为 2022-06-14
 * stat 对字段做 groupField 时需使用的数据库计算方法，省缺为 'sum'
  	* 'sum' 表示对字段做求和运算
  	* 'avg' 表示对字段做平均运算
  	* '-1' 表示不对字段做运算
 * fix 数字保留几位小数，>1 默认不保留小数，<1 默认保留两位小数
 * value 默认值 (仅用于 uni-stat-panel 组件) todo: 可移除
 * contrast 对比值 (仅用于 uni-stat-panel 组件) todo: 可移除
 */

export default [{
	title: '入口页',
	field: 'path',
	tooltip: '设备进入应用访问的第一个页面，例如设备从页面1进入应用，跳转到页面2，1为入口页，而2不是',
}, {
	title: '页面名称',
	field: 'title',
}, {
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
	title: '访问总时长(秒)',
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
