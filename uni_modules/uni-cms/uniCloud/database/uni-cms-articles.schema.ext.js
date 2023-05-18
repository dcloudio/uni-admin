// 获取配置
const createConfig = safeRequire('uni-config-center')
const config = createConfig({
	pluginId: 'uni-cms'
}).config()

// 获取数据库实例
const db = uniCloud.database()

// 文章数据库名称
const articleDBName = 'uni-cms-articles'

// 解锁内容数据库名称
const unlockContentDBName = 'uni-cms-unlock-record'

// 安全检测文本内容
async function checkContentSec(content, requestId, errorMsg) {
	// 安全引入内容安全检测模块
	const UniSecCheck = safeRequire('uni-sec-check')
	// 创建内容安全检测实例
	const uniSecCheck = new UniSecCheck({
		provider: 'mp-weixin',
		requestId
	})
	// 调用文本安全检测接口
	const res = await uniSecCheck.textSecCheck({
		content, // 待检测的文本内容
		scene: 1, // 表示资料类场景
		version: 1 // 调用检测API的版本号
	})

	// 如果存在敏感词，抛出异常
	if (res.errCode === uniSecCheck.ErrorCode.RISK_CONTENT) {
		throw new Error(errorMsg || '存在敏感词，请修改后提交')
	} else if (res.errCode !== 0) {
		console.error(res)
		throw new Error('内容安全检测异常：' + res.errCode)
	}
}

// 安全检测图片内容
async function checkImageSec(image, requestId, errorMsg) {
	// 安全引入内容安全检测模块
	const UniSecCheck = safeRequire('uni-sec-check')
	// 创建内容安全检测实例
	const uniSecCheck = new UniSecCheck({
		provider: 'mp-weixin',
		requestId
	})

	// 调用图片安全检测接口
	const res = await uniSecCheck.imgSecCheck({
		image, // 待检测的图片URL
		scene: 1, // 表示资料类场景
		version: 1 // 调用检测API的版本号
	})

	// 如果存在违规内容，抛出异常
	if (res.errCode === uniSecCheck.ErrorCode.RISK_CONTENT) {
		throw new Error(errorMsg || '图片违规，请修改后提交')
	} else if (res.errCode !== 0) {
		console.error(res)
		throw new Error('内容安全检测异常：' + res.errCode)
	}
}

// 检测内容安全开关
function checkContentSecurityEnable(field) {
	// 1. 从配置中心获取配置
	return config.contentSecurity && config.contentSecurity.allowCheckType && config.contentSecurity.allowCheckType.includes(field)
}

// 安全require
function safeRequire(module) {
	try {
		return require(module)
	} catch (e) {
		if (e.code === 'MODULE_NOT_FOUND') {
			throw new Error(`${module} 公共模块不存在，请在 uniCloud/database 目录右击"配置schema扩展公共模块"添加 ${module} 模块`)
		}
	}
}

module.exports = {
	trigger: {
		// 创建文章前触发
		beforeCreate: async function ({
			clientInfo,
			addDataList,
		}) {
			// addDataList 是一个数组，因为可以一次性创建多条数据
			if (addDataList.length <= 0) return

			// 遍历数组，对每一条数据进行安全检测
			for (const addData of addDataList) {
				// 如果是草稿，不检测
				if (addData.article_status !== 1) continue

				// 并行检测
				const parallel = []
				// 检测标题
				if (addData.title && checkContentSecurityEnable('content')) {
					parallel.push(checkContentSec(addData.title, clientInfo.requestId, '标题存在敏感字，请修改后提交'))
				}
				// 检测摘要
				if (addData.excerpt && checkContentSecurityEnable('content')) {
					parallel.push(checkContentSec(addData.excerpt, clientInfo.requestId, '摘要存在敏感字，请修改后提交'))
				}
				// 检测内容
				if (addData.content && checkContentSecurityEnable('content')) {
					parallel.push(checkContentSec(JSON.stringify(addData.content), clientInfo.requestId, '内容存在敏感字，请修改后提交'))
				}
				// 检测封面图
				if (addData.thumbnail && checkContentSecurityEnable('image')) {
					parallel.push(checkImageSec(addData.thumbnail, clientInfo.requestId, '封面图存在违规，请修改后提交'))
				}
				// 等待所有并行检测完成
				await Promise.all(parallel)
			}
		},
		// 更新文章前触发
		beforeUpdate: async function ({
			clientInfo,
			where,
			updateData
		}) {
			const id = where && where._id

			if (!id) return

			// 如果是草稿，不检测
			if (updateData.article_status !== 1) return

			// 并行检测
			const parallel = []

			// 检测标题
			if (updateData.title && checkContentSecurityEnable('content')) {
				parallel.push(checkContentSec(updateData.title, clientInfo.requestId, '标题存在敏感字，请修改后提交'))
			}
			// 检测摘要
			if (updateData.excerpt && checkContentSecurityEnable('content')) {
				parallel.push(checkContentSec(updateData.excerpt, clientInfo.requestId, '摘要存在敏感字，请修改后提交'))
			}
			// 检测内容
			if (updateData.content && checkContentSecurityEnable('content')) {
				parallel.push(checkContentSec(JSON.stringify(updateData.content), clientInfo.requestId, '内容存在敏感字，请修改后提交'))
			}
			// 检测封面图
			if (updateData.thumbnail && checkContentSecurityEnable('image')) {
				parallel.push(checkImageSec(updateData.thumbnail, clientInfo.requestId, '封面图存在违规，请修改后提交'))
			}

			// 等待所有并行检测完成
			await Promise.all(parallel)

		},
		// 读取文章前触发
		afterRead: async function ({ userInfo, clientInfo, result, where, field }) {
			// 检查是否配置了clientAppIds字段，如果没有则抛出错误
			if (!config.clientAppIds && clientInfo.uniPlatform !== 'web') {
				throw new Error('请在 uni-cms 配置文件中配置 clientAppIds 字段后访问，详见：https://uniapp.dcloud.net.cn/uniCloud/uni-cms.html#uni-cms-config')
			}

			// 如果clientAppIds字段未配置或当前appId不在clientAppIds中，则返回
			if (!config.clientAppIds || !config.clientAppIds.includes(clientInfo.appId)) return

			// 获取广告配置
			const adConfig = config.adConfig || {}

			// 获取文章id
			const id = where && where._id

			// 如果id不存在或者field不包含content，则返回
			if (id && field.includes('content')) {
				// 读取了content字段后view_count加1
				await db.collection(articleDBName).where(where).update({
					view_count: db.command.inc(1)
				})
			}

			// 如果查询结果为空，则返回
			if (!result.data || result.data.length <= 0) return

			// 获取文章
			const article = result.data[0]

			// 如果文章内容不存在，则返回
			if (!article.content) return

			let needUnlock = false
			let unlockContent = []

			// 遍历文章内容，找到解锁内容
			for (const op of article.content.ops) {
				unlockContent.push(op)
				if (op.insert.unlockContent) {
					needUnlock = true
					break
				}
			}

			// 如果文章不需要解锁，则返回
			if (!needUnlock) return

			// 获取唯一标识符
			const uniqueId = adConfig.watchAdUniqueType === 'user' ? userInfo.uid : clientInfo.deviceId

			// 如果未登录或者文章未解锁，则返回解锁内容
			if (!uniqueId || !article._id) {
				article.content = {
					ops: unlockContent
				}
				return
			}

			// 查询解锁记录
			const unlockRecord = await db.collection(unlockContentDBName).where({
				unique_id: uniqueId,
				article_id: article._id
			}).get()

			// 如果未解锁，则返回解锁内容
			if (unlockRecord.data && unlockRecord.data.length <= 0) {
				article.content = {
					ops: unlockContent
				}
				return
			}

			// 将文章解锁替换为行结束符 \n
			article.content = {
				ops: article.content.ops.map(op => {
					if (op.insert.unlockContent) {
						op.insert = "\n"
					}
					return op
				})
			}
		}

	}
}
