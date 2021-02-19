// 校验规则由 schema 生成，请不要直接修改当前文件，如果需要请在uniCloud控制台修改schema
// uniCloud: https://unicloud.dcloud.net.cn/



export default {
	"username": {
		"rules": [{
				"required": true,
				"errorMessage": "{label}必填"
			},
			{
				"format": "string"
			},
			{
				"minLength": 2
			}
		],
		"label": "用户名"
	},
	"password": {
		"rules": [{
				"required": true,
				"errorMessage": "{label}必填"
			},
			{
				"format": "string"
			},
			{
				"minLength": 6
			}
		],
		"label": "密码"
	},
	"mobile": {
		"rules": [{
				"format": "string"
			},
			{
				"pattern": "^\\+?[0-9-]{3,20}$"
			}
		],
		"label": "手机号"
	},
	"email": {
		"rules": [{
				"format": "string"
			},
			{
				"format": "email"
			}
		],
		"label": "邮箱"
	},
	"role": {
		"rules": [{
			"format": "array"
		}]
	}
}
