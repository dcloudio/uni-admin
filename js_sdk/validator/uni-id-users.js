// 校验规则由 schema 生成，请不要直接修改当前文件，如果需要请在uniCloud控制台修改schema
// uniCloud: https://unicloud.dcloud.net.cn/



export default {
  "username": {
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
    "label": "用户名"
  },
  "password": {
    "rules": [
      {
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
    "label": "初始密码"
  },
  "mobile": {
    "rules": [
      {
        "format": "string"
      },
      {
        "minLength": 11
      }
    ],
    "label": "手机号"
  },
  "email": {
    "rules": [
      {
        "format": "string"
      }
    ],
    "label": "邮箱"
  },
  "status": {
    "rules": [
      {
        "format": "bool"
      }
    ],
    "label": "是否启用"
  }
}
