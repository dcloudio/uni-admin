const uniID = require('uni-id')
module.exports = (options) => {
    // 初始化 uniID 配置
    if (options) {
        uniID.init(options)
    }
    // 返回中间件函数
    return async function auth(ctx, next) {
        // 校验 token
        const auth = await uniID.checkToken(ctx.event.uniIdToken)
        if (auth.code) {
            // 校验失败，抛出错误信息
            ctx.throw(auth.code, auth.message)
        }
        if (!auth.permission.includes(ctx.event.action)) {
            ctx.throw(403, '禁止访问')
        }
        ctx.auth = auth // 设置当前请求的 auth 对象
        await next() // 执行后续中间件
    }
}
