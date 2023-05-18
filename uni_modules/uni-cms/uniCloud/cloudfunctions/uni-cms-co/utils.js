// 为模块添加安全的 require 方法
exports.safeRequire = function (module) {
  try {
    return require(module)
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      // 如果模块不存在，抛出错误提示用户添加模块
      throw new Error(`${module} 公共模块不存在，请在 uni-cms-co 目录右击"管理公共模块或扩展依赖"添加 ${module} 模块`)
    }
  }
}

// 检查内容安全是否启用
exports.checkContentSecurityEnable = function (config, field) {
  // 1. 从配置中心获取配置
  return config && config.allowCheckType && config.allowCheckType.includes(field)
}
