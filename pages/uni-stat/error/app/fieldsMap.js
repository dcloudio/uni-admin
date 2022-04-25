const fieldsMap = [{
	title: '创建时间',
	field: 'create_time',
	tooltip: '',
	formatter: '',
}, {
	title: '设备标识 ',
	field: 'device_id',
	formatter: '',
}, {
	title: '设备网络',
	field: 'device_net',
	tooltip: '',
	formatter: '',
}, {
	title: '设备系统版本',
	field: 'device_os_version',
	formatter: ''
}, {
	title: '设备供应商',
	field: 'device_vendor',
	formatter: ''
}, {
	title: '设备型号',
	field: 'device_model',
	formatter: ''
}, {
	title: '页面 url',
	field: 'page_url',
	formatter: ''
}, {
	title: '使用的内存量',
	field: 'use_memery_size',
	formatter: ''
}, {
	title: '运行应用的个数',
	field: 'app_count',
	formatter: ''
}, {
	title: '打开 Webview 个数',
	field: 'webview_count',
	formatter: ''
}, {
	title: '错误信息',
	field: 'error_msg',
	formatter: '',
}]

const popupFieldsMap = [{
	title: '创建时间',
	field: 'create_time',
	formatter: '',
}, {
	title: '设备标识',
	field: 'device_id',
	formatter: '',
}, {
	title: '客户端操作系统',
	field: 'os',
	formatter: '',
}, {
	title: '客户端 user-agent 信息',
	field: 'ua',
	formatter: '',
}, {
	title: '服务空间编号',
	field: 'space_id',
	formatter: '',
}, {
	title: '服务空间提供商',
	field: 'space_provider',
	formatter: '',
}]

export {
	fieldsMap,
	popupFieldsMap,
}
