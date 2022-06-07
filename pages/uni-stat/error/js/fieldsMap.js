const fieldsMap = [{
	title: '最近发生时间',
	field: 'last_time',
	tooltip: '',
	formatter: '',
}, {
	title: '错误次数',
	field: 'count',
	tooltip: '相同错误在某时间段内发生的次数',
}, {
	title: '错误占比',
	computed: 'count/total_count',
	field: 'count/total_count',
	formatter: '%',
	tooltip: '某个错误发生的次数/总错误数',
}, {
	title: '平台',
	field: 'platform',
	formatter: '',
}, {
	title: '平台版本号',
	field: 'version',
	tooltip: '原生平台为客户端 SDK 版本号；小程序平台为微信、支付宝、百度等应用的版本号',
	formatter: '',
}, {
	title: '错误信息',
	field: 'msg',
	formatter: '',
}]

const popupFieldsMap = [{
	title: '创建时间',
	field: 'create_time',
	formatter: '',
},
// {
// 	title: '错误类型',
// 	field: 'error_type',
// 	formatter: '',
// },
{
	title: '客户端操作系统',
	field: 'os',
	formatter: '',
}, {
	title: '客户端 user-agent 信息',
	field: 'ua',
	formatter: '',
}
// , {
// 	title: '页面信息',
// 	field: 'page_url',
// 	formatter: '',
// }
// , {
// 	title: '服务空间编号',
// 	field: 'space_id',
// 	formatter: '',
// }, {
// 	title: '服务空间提供商',
// 	field: 'space_provider',
// 	formatter: '',
// },
]

export {
	fieldsMap,
	popupFieldsMap,
}
