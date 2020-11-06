// 校验规则由 schema 生成，请不要直接修改当前文件，如果需要请在uniCloud控制台修改schema
// uniCloud: https://unicloud.dcloud.net.cn/



export default {
  "role_id": {
    "rules": [
      {
        "required": true,
        "errorMessage": "{label}必填"
      },
      {
        "format": "string"
      },
      {
        "minLength": 2,
        "maxLength": 10
      }
    ],
    "label": "角色Id"
  },
  "role_name": {
    "rules": [
      {
        "format": "string"
      },
      {
        "minLength": 2,
        "maxLength": 10
      }
    ],
    "label": "角色名"
  },
  "comment": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "备注"
  }
}
