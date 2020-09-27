const {
    Service
} = require('uni-cloud-router')
const uniID = require('uni-id')
module.exports = class UserService extends Service {
    async login({
        username,
        password
    }) {
        const err = await uniCloud.validate({
            username,
            password
        }, {
            // 对name字段进行必填验证
            username: {
                rules: [{
                        required: true,
                        errorMessage: '请输入姓名'
                    },
                    {
                        minLength: 3,
                        maxLength: 30,
                        errorMessage: '姓名长度在{minLength}到{maxLength}个字符'
                    }
                ]
            },
            // 对email字段进行必填验证
            password: {
                rules: [{
                        required: true,
                        errorMessage: '请输入正确的密码'
                    },
                    {
                        minLength: 6,
                        errorMessage: '密码长度大于{minLength}个字符'
                    }
                ]
            }
        })
        if(err) {
            this.throw({
                code: 'Validate_Error',
                message: err.errorMessage
            })
        }
        return uniID.login({
            username,
            password,
            needPermission: true
        })
    }
}
