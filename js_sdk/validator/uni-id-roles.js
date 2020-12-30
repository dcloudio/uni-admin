// 校验规则由 schema 生成，请不要直接修改当前文件，如果需要请在uniCloud控制台修改schema
// uniCloud: https://unicloud.dcloud.net.cn/



export default {
	"role_id": {
		"rules": [{
				"required": true,
				"errorMessage": "{label}必填"
			}, {
				"format": "string"
			}
		],
		"label": "角色Id"
	},
	"role_name": {
		"rules": [{
			"required": true,
			"errorMessage": "{label}必填"
		}, {
			"format": "string"
		}],
		"label": "角色名"
	},
	"permission": {
		"rules": [{
			"format": "array"
		}],
		"label": "权限"
	},
	"comment": {
		"rules": [{
			"format": "string"
		}],
		"label": "备注"
	}
}
