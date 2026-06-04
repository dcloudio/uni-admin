module.exports = function safeRequire(module) {
  try {
    return require(module)
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      throw new Error(`${module} 公共模块不存在，请在 uni-media-library-co 云对象目录右键“管理公共模块或扩展库依赖”添加 ${module} 模块`)
    }
  }
}
