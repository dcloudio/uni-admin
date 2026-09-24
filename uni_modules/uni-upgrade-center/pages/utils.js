// 判断arr是否为一个数组，返回一个bool值
function isArray(arr) {
	return Object.prototype.toString.call(arr) === '[object Array]';
}

// 深度克隆
export function deepClone(obj) {
	// 对常见的“非”值，直接返回原来值
	if ([null, undefined, NaN, false].includes(obj)) return obj;
	if (typeof obj !== "object" && typeof obj !== 'function') {
		//原始类型直接返回
		return obj;
	}
	let o = isArray(obj) ? [] : {};
	for (let i in obj) {
		if (obj.hasOwnProperty(i)) {
			o[i] = typeof obj[i] === "object" ? deepClone(obj[i]) : obj[i];
		}
	}
	return o;
}

export const appListDbName = 'opendb-app-list'
export const appVersionListDbName = 'opendb-app-versions'
// 版本列表默认显示应用Appid
export const defaultDisplayApp = ''

/**
 * 将文件项按存储分组去重：file_domain 为空即内置存储，否则为该域名的扩展存储
 * @param {Array} files 文件项列表（需含 file_id、file_domain）
 * @returns {Object} { [fileDomain]: fileID[] }
 */
export function groupFilesByDomain(files) {
	const groups = {}
	files.forEach(file => {
		if (!file || !file.file_id) return
		const key = file.file_domain || ''
		if (!groups[key]) groups[key] = []
		if (groups[key].indexOf(file.file_id) === -1) groups[key].push(file.file_id)
	})
	return groups
}

/**
 * 按分组删除云存储文件：每组一次调用（domain 为空字符串时云端按内置存储删除）
 * 删除为幂等操作（文件不存在时亦视为成功），失败的分组仅记录日志
 * @param {Object} groups groupFilesByDomain 的返回值
 * @returns {Promise<Array>} 删除成功的 fileID 列表
 */
export async function deleteFileGroups(groups) {
	const deletedFiles = []
	for (const domain of Object.keys(groups)) {
		try {
			const res = await uniCloud.callFunction({
				name: 'uni-upgrade-center',
				data: {
					action: 'deleteFile',
					params: { fileList: groups[domain], domain }
				}
			})
			// 云函数业务失败（如权限不足）不会 reject，需检查 success 标记
			if (res && res.result && res.result.success === false) {
				console.error('删除安装包失败（domain: ' + domain + '）：' + (res.result.errMsg || ''))
				continue
			}
			deletedFiles.push(...groups[domain])
		} catch (e) {
			console.error('同步删除安装包失败（domain: ' + domain + '）：', e)
		}
	}
	return deletedFiles
}

/**
 * 删除版本记录的确认交互：一次选择同时决定是否同步删除云存储中的安装包文件
 * 待删清单包含记录当前引用的包（file_id）与已收集的废弃包（obsolete_file_ids）
 * 仅 file_id 可识别的文件会被同步删除（历史记录无 file_id 时仅删记录，文件需在 uniCloud web 控制台手动清理）
 * @param {Array} records 待删除的记录列表（需含 file_id、file_domain、obsolete_file_ids 字段）
 * @param {Function} deleteRecords 执行删除记录的函数，需返回 Promise（reject 时终止，不删文件）
 * @param {Object} popover H5 下 ActionSheet 的锚定位置（参照发布新版的处理，由调用方通过触发按钮 getBoundingClientRect 获取）
 */
export function confirmDeleteVersionRecords(records, deleteRecords, popover) {
	// 当前引用的包 + 各记录收集的废弃包，统一分组去重
	const files = []
	records.forEach(record => {
		files.push({ file_id: record.file_id, file_domain: record.file_domain })
		;(record.obsolete_file_ids || []).forEach(item => {
			files.push(item)
		})
	})
	const groups = groupFilesByDomain(files)
	uni.showActionSheet({
		itemList: ['仅删除记录', '删除记录及安装包'],
		// #ifdef H5
		popover,
		// #endif
		success: ({
			tapIndex
		}) => {
			// 先删记录、成功后再删文件，避免文件已删而记录删除失败的中间态
			deleteRecords().then(() => {
				if (tapIndex !== 1) return
				deleteFileGroups(groups)
			}).catch(err => {
				console.error('删除记录失败：', err)
			})
		}
	})
}


/**
 * 对比版本号，如需要，请自行修改判断规则
 * 支持比对	("3.0.0.0.0.1.0.1", "3.0.0.0.0.1")	("3.0.0.1", "3.0")	("3.1.1", "3.1.1.1") 之类的
 * @param {Object} v1
 * @param {Object} v2
 * v1 > v2 return 1
 * v1 < v2 return -1
 * v1 == v2 return 0
 */
export function compare(v1 = '0', v2 = '0') {
		v1 = String(v1).split('.')
		v2 = String(v2).split('.')
		const minVersionLens = Math.min(v1.length, v2.length);

		let result = 0;
		for (let i = 0; i < minVersionLens; i++) {
			const curV1 = Number(v1[i])
			const curV2 = Number(v2[i])

			if (curV1 > curV2) {
				result = 1
				break;
			} else if (curV1 < curV2) {
				result = -1
				break;
			}
		}

		if (result === 0 && (v1.length !== v2.length)) {
			const v1BiggerThenv2 = v1.length > v2.length;
			const maxLensVersion = v1BiggerThenv2 ? v1 : v2;
			for (let i = minVersionLens; i < maxLensVersion.length; i++) {
				const curVersion = Number(maxLensVersion[i])
				if (curVersion > 0) {
					v1BiggerThenv2 ? result = 1 : result = -1
					break;
				}
			}
		}

		return result;
	}
