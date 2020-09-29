const auth = require('./middleware/auth')
const permission = require('./middleware/permission')

module.exports = {
    debug: true, // 输出调试信息
    baseDir: __dirname,
    middleware: [
        [
            auth(), // uniId 校验 token 中间件
            {
                name: 'auth',
                enable: true,
                ignore: 'user'
            }
        ],
        [
            permission(), // uniId 校验权限中间件
            {
                name: 'permission',
                enable: true,
                ignore: ['public', 'user', 'system']
            }
        ]
    ]
}
