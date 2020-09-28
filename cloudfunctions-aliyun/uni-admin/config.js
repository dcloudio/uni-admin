const auth = require('./middleware/auth')
const permission = require('./middleware/permission')

module.exports = {
    baseDir: __dirname,
    middleware: [
        [
            auth(), // 注册中间件
            {
                enable: true,
                ignore: 'user'
            }
        ],
        [
            permission(),
            {
                enable: true,
                ignore: ['public', 'user', 'system']
            }
        ]
    ]
}
