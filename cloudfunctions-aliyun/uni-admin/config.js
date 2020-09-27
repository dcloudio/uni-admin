const auth = require('./middleware/auth')

module.exports = {
    baseDir: __dirname,
    middleware: [
        [
            auth(), // 注册中间件
            {
                enable: true,
                ignore: /\/login$/
            }
        ]
    ]
}
