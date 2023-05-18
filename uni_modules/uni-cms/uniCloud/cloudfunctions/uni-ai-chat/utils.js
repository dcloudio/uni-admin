exports.safeRequire = function (module) {
	try {
		return require(module)
	} catch (e) {
		if (e.code === 'MODULE_NOT_FOUND') {
			console.log(e);
			throw new Error(`${module} 公共模块不存在，请在 uni-ai-chat 目录右击"管理公共模块或扩展依赖"添加 ${module} 模块`)
		}
	}
}

exports.checkContentSecurityEnable = function (config, field) {
	// 1. 从配置中心获取配置
	return config && config.allowCheckType && config.allowCheckType.includes(field)
}
