module.exports = () => {
    // 返回中间件函数
    return async function permission(ctx, next) {
        if (ctx.auth || !ctx.auth.permission.includes(ctx.event.action)) {
            ctx.throw('Forbidden', '禁止访问')
        }
        await next() // 执行后续中间件
    }
}
