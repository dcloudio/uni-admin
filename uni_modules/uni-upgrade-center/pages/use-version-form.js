import {
	ref,
	computed,
	watch
} from 'vue';
import {
	onReady
} from '@dcloudio/uni-app';
import {
	validator,
	enumConverter
} from '@/js_sdk/validator/opendb-app-versions.js';
import {
	request
} from '@/js_sdk/uni-admin/request.js';
import {
	getPackageSha256Source,
	isSamePackageSha256Source,
	isValidPackageSha256
} from './package-sha256.js';

export const platform_iOS = 'iOS';
export const platform_Android = 'Android';
export const platform_Harmony = 'Harmony'
const db = uniCloud.database();

function getValidator(fields) {
	let result = {}
	for (let key in validator) {
		if (fields.includes(key)) {
			// 克隆规则，避免页面内对 rules 的动态修改（如追加 required）污染共享的 validator 定义
			result[key] = { ...validator[key],
				rules: [...validator[key].rules]
			}
		}
	}
	return result
}

export const fields =
	'appid,name,title,contents,is_update_prompt,update_prompt,update_prompt_content,platform,type,version,min_uni_version,min_required_version,url,stable_publish,is_silently,is_mandatory,is_vapor,isVapor,sha256,verify_sha256,file_id,file_domain,obsolete_file_ids,create_date,store_list'

/**
 * 新增/编辑版本页面共用逻辑（原 mixin 改写为组合式 API，兼容 vue3 蒸汽模式）
 * @param {Object} formRef uni-forms 组件实例的 ref
 */
export function useVersionForm(formRef) {
	// 模板与方法共用的常量
	const labelWidth = '100px';
	const enableiOSWgt = true; // 是否开启iOS的wgt更新
	const silentlyContent = '后台下载安装wgt包，不提示、不主动重启，下次启动App时生效'
	const updatePromptContent = computed(() => isNativeApp.value ? '仅 Android 可用；后台下载APK，完成后弹窗提醒安装' : '后台下载安装wgt包，完成后提醒重启；与静默更新互斥')
	const updatePromptModalContent = '完成后弹窗先显示提醒内容，再附上更新内容；按钮文字固定。'
	const mandatoryContent = computed(() => {
		if (isNativeApp.value) {
			return formData.value.is_update_prompt
				? '开启安装提醒时，强制更新决定安装弹窗是否显示“取消”；系统安装器仍由系统控制'
				: '未开启安装提醒时，强制更新使下载前的升级弹窗不可关闭'
		}
		if (formData.value.is_update_prompt) {
			return formData.value.update_prompt === 'toast'
				? '更新提醒选择轻提示时没有可取消的弹窗；强制更新不改变提示方式'
				: '开启弹窗提醒时，强制更新决定重启弹窗是否显示“取消”'
		}
		return '未开启更新提醒时，强制更新使下载前的升级弹窗不可关闭'
	})
	const vaporContent = '蒸汽模式：标记该wgt资源包为蒸汽模式应用。平台仅支持单选，且暂不支持鸿蒙'
	const verifySha256Content = '开启后仅 uni-app x 客户端会在安装前校验安装包 SHA256；uni1 客户端不支持运行时校验，将忽略此开关'
	const stablePublishContent = '将线上发行包变更为下线'
	const stablePublishContent2 = '使用本包替换当前线上发行版'
	const minUniVersionContent = '上次使用新Api或打包新模块的App版本'
	const minRequiredVersionContent = '当前 App 版本低于此版本时强制升级；等于此版本时不强制。仅原生 App 安装包生效'
	const priorityContent = '检查更新时，按照优先级从大到小依次尝试跳转商店。如果都跳转失败，则会打开浏览器使用下载链接下载apk安装包'
	const uploadFileDir = '/upgrade-center'
	const type_valuetotext = enumConverter.type_valuetotext
	const formOptions = {
		"platform_localdata": [{
				"value": "Android",
				"text": "安卓"
			},
			{
				"value": "iOS",
				"text": "苹果"
			},
			{
				"value": "Harmony",
				"text": "鸿蒙 Next"
			}
		],
		"type_localdata": [{
				"value": "native_app",
				"text": "原生App安装包"
			},
			{
				"value": "wgt",
				"text": "App资源包"
			}
		],
		"update_prompt_localdata": [{
			"value": "modal",
			"text": "弹窗提示"
		}, {
			"value": "toast",
			"text": "轻提示"
		}]
	}
	const rules = getValidator([
		"appid", "contents", "is_update_prompt", "update_prompt", "update_prompt_content", "platform", "type",
		"version", "min_uni_version", "min_required_version", "url", "stable_publish",
		"title", "name", "is_silently", "is_mandatory", "is_vapor", "store_list"
	])

	// 响应式状态
	const latestStableData = ref([]) // 库中最新已上线版
	const appFileList = ref(null) // 上传包
	const sha256Loading = ref(false) // 上传包SHA256计算中
	// SHA256 请求序号：计算期间重新上传会并发新请求，仅最新请求的结果生效（旧请求不写入/不复位/不提示）
	let sha256RequestId = 0
	const sha256Binding = ref(null) // 仅表单实例持有，不写入数据库
	let restoringPackage = false
	let managedPackageUrl = ''
	let managedExtStorage = false
	const platformPackages = new Map()
	const uniFilePickerProvider = ref('unicloud') // 上传存储供应商：unicloud 内置存储；extStorage 扩展存储
	const domain = ref('') // 扩展存储绑定的自定义域名
	const previousPackage = ref(null) // × 移除新上传的包时一并恢复引用与摘要绑定
	// 本会话上传过的所有包（含已被 × 移除的），取消编辑时统一标记废弃写库
	const sessionUploadedFiles = ref([])
	const formData = ref({
		"appid": "",
		"name": "",
		"title": "",
		"contents": "",
		"is_update_prompt": false,
		"update_prompt": "modal",
		"update_prompt_content": "应用已更新，是否立即重启？",
		"platform": [],
		"store_list": [],
		"type": "",
		"version": "",
		"min_uni_version": "",
		"min_required_version": "",
		"url": "",
		"file_id": "",
		"file_domain": "",
		"obsolete_file_ids": [],
		"stable_publish": false,
		"is_vapor": false,
		"sha256": "",
		"verify_sha256": false,
		"create_date": null
	})

	// 计算属性
	const isWGT = computed(() => formData.value.type === 'wgt')
	const isNativeApp = computed(() => formData.value.type === 'native_app')
	// 需要生成/校验 SHA256：蒸汽模式 wgt，或开启校验的 APK
	const needSha256 = computed(() => (isWGT.value && formData.value.is_vapor === true) || (isNativeApp.value && formData.value.verify_sha256 === true))
	const updatePromptLocaldata = computed(() => isNativeApp.value ? [formOptions.update_prompt_localdata[0]] : formOptions.update_prompt_localdata)
	const isiOS = computed(() => formData.value.platform.includes(platform_iOS))
	const isAndroid = computed(() => formData.value.platform.includes(platform_Android))
	const isHarmony = computed(() => formData.value.platform.includes(platform_Harmony))
	const hasPackage = computed(() => appFileList.value && !!Object.keys(appFileList.value).length)
	const fileExtname = computed(() => {
		let wgtExt = ['wgt']
		const apkExt = ['apk']
		if (formData.value.is_vapor) {
			// 蒸汽模式应用资源包支持 .zst（zstd 压缩）与 .wgt
			wgtExt = ['wgt', 'zst']
		}
		return isWGT.value ? wgtExt : apkExt
	})
	const platformLocaldata = computed(() => {
		let localdata = !isWGT.value ? formOptions.platform_localdata : enableiOSWgt ? formOptions
			.platform_localdata : [formOptions.platform_localdata[0], formOptions.platform_localdata[2]]
		// 蒸汽模式应用暂不支持鸿蒙
		if (isWGT.value && formData.value.is_vapor) {
			localdata = localdata.map(item => item.value === platform_Harmony ? { ...item,
				disabled: true
			} : item)
		}
		return localdata
	})
	const uni_platform = computed(() => {
		if (isiOS.value) return platform_iOS.toLocaleLowerCase()
		else if (isAndroid.value) return platform_Android.toLocaleLowerCase()
		return platform_Harmony.toLocaleLowerCase()
	})
	const enableUploadPackage = computed(() => isWGT.value || !(isiOS.value || isHarmony.value))
	const urlLabel = computed(() => {
		if (isWGT.value || isAndroid.value) return '下载链接'
		if (isiOS.value) return 'AppStore'
		else if (isHarmony.value) return '应用商店'
		return '下载链接'
	})
	const isApk = computed(() => {
		const url = formData.value.url || ''
		const apkIndex = url.indexOf('apk')
		return url && (apkIndex > -1 && apkIndex === url.length - 3)
	})
	const packageSource = computed(() => getPackageSha256Source(formData.value))
	const hasBoundPackageSha256 = computed(hasCurrentPackageSha256)
	// 只使摘要失效，不自动发请求；同步监听保证程序修改 URL 也无法在提交前绕过来源检查。
	watch(() => [formData.value.url, formData.value.file_id, formData.value.file_domain], () => {
		if (!restoringPackage) invalidatePackageSha256()
	}, { flush: 'sync' })
	watch(needSha256, (needed) => {
		if (!needed) resetSha256Request()
	}, { flush: 'sync' })
	/**
	 * SHA256 展示状态：'' 不展示；loading 计算中；success 已获取；fail 获取失败
	 * 需校验 SHA256 的记录（蒸汽模式 wgt 或开启校验的 APK）；有可校验文件但摘要缺失时展示失败以提供重算入口
	 */
	const sha256Status = computed(() => {
		if (!needSha256.value) return ''
		if (sha256Loading.value) return 'loading'
		if (hasBoundPackageSha256.value) return 'success'
		return packageSource.value ? 'fail' : ''
	})

	// 方法
	function hasCurrentPackageSha256() {
		return isValidPackageSha256(formData.value.sha256) && sha256Binding.value &&
			sha256Binding.value.sha256 === formData.value.sha256 && sha256Binding.value.generation === sha256RequestId &&
			isSamePackageSha256Source(sha256Binding.value, getPackageSha256Source(formData.value))
	}

	function invalidatePackageSha256() {
		resetSha256Request()
		sha256Binding.value = null
		formData.value.sha256 = ''
	}

	function capturePackageState() {
		const data = formData.value
		return {
			url: data.url || '', file_id: data.file_id || '', file_domain: data.file_domain || '',
			sha256: hasBoundPackageSha256.value ? data.sha256 : '',
			binding: hasBoundPackageSha256.value ? { ...sha256Binding.value } : null,
			managedUrl: managedPackageUrl, extStorage: managedExtStorage
		}
	}

	function restorePackageState(state = {}) {
		resetSha256Request()
		restoringPackage = true
		try {
			formData.value.url = state.url || ''
			formData.value.file_id = state.file_id || ''
			formData.value.file_domain = state.file_domain || ''
			managedPackageUrl = state.managedUrl || ''
			managedExtStorage = state.extStorage === true || !!state.file_domain
			const valid = isValidPackageSha256(state.sha256) && state.binding &&
				state.binding.sha256 === state.sha256 && isSamePackageSha256Source(state.binding, packageSource.value)
			formData.value.sha256 = valid ? state.sha256 : ''
			sha256Binding.value = valid ? { ...state.binding, generation: sha256RequestId } : null
		} finally {
			restoringPackage = false
		}
	}

	/** 仅在加载库中数据时认可已有摘要，不下载、不写库；后续恢复必须使用保存的 binding。 */
	function bindLoadedPackageSha256(data) {
		if (data) {
			restoringPackage = true
			try { formData.value = data } finally { restoringPackage = false }
		}
		resetSha256Request()
		managedPackageUrl = formData.value.file_id ? (formData.value.url || '') : ''
		managedExtStorage = !!formData.value.file_domain
		const source = packageSource.value
		sha256Binding.value = source && isValidPackageSha256(formData.value.sha256)
			? { ...source, generation: sha256RequestId, sha256: formData.value.sha256 } : null
		platformPackages.clear()
		previousPackage.value = null
		;(formData.value.obsolete_file_ids || []).forEach(slot => {
			if (!slot.platform) return
			const slotSource = getPackageSha256Source(slot)
			platformPackages.set(slot.platform, { ...slot, managedUrl: slot.url || '',
				binding: slotSource && isValidPackageSha256(slot.sha256)
					? { ...slotSource, generation: sha256RequestId, sha256: slot.sha256 } : null })
		})
	}

	function onPackageUrlInput(value) {
		binddata('url', value)
		if (value !== managedPackageUrl) managedPackageUrl = ''
	}

	function changePackageDomain(value) {
		// 存储配置不改写手填外链，也不改变其清理引用；已上传扩展存储包的地址变更需重新生成摘要。
		if (!managedExtStorage || !managedPackageUrl || formData.value.url !== managedPackageUrl) return
		const url = formData.value.url.replace(/^(https?:\/\/)[^\/]+/i, `$1${value || '请输入自定义域名'}`)
		if (url === formData.value.url && (value || '') === formData.value.file_domain) return
		restorePackageState({ ...formData.value, file_domain: value || '', url, managedUrl: url, extStorage: true })
	}

	/**
	 * 等价于 uni-forms 挂载的 binddata：向表单数据中写入字段值
	 */
	function binddata(name, value) {
		formData.value[name] = value
	}

	/** 静默更新与安装后提醒、强制更新互斥（仅 WGT） */
	function onSilentlyChange(e) {
		const val = e.detail.value
		binddata('is_silently', val)
		if (val) {
			binddata('is_update_prompt', false)
			binddata('is_mandatory', false)
		}
	}

	function onUpdatePromptChange(e) {
		const val = e.detail.value
		binddata('is_update_prompt', val)
		if (isNativeApp.value) {
			binddata('is_silently', val)
			if (val && !isAndroid.value) binddata('platform', platform_Android)
		} else if (val) {
			binddata('is_silently', false)
		}
	}

	/** 强制更新只限制取消；WGT 的静默更新不允许与强制更新同时开启 */
	function onMandatoryChange(e) {
		const val = e.detail.value
		binddata('is_mandatory', val)
		if (val && isWGT.value) binddata('is_silently', false)
	}

	function validatePromptFields(data) {
		if (data.is_update_prompt === false) return
		if (data.type === 'native_app') data.update_prompt = 'modal'
		const prompt = data.update_prompt || 'modal'
		if (prompt === 'modal' && !String(data.update_prompt_content || '').trim()) {
			uni.showModal({ content: '弹窗提醒内容不能为空', showCancel: false })
			throw new Error('提醒内容未填写')
		}
	}

	function validateMinRequiredVersion(data, compare) {
		if (data.type !== 'native_app' || !String(data.min_required_version || '').trim()) return
		if (!/^\d+(\.\d+)*$/.test(data.min_required_version) ||
			!/^\d+(\.\d+)*$/.test(data.version) || compare(data.min_required_version, data.version) > 0) {
			uni.showModal({ content: '最低强制版本须为数字版本号且不能高于目标版本号', showCancel: false })
			throw new Error('最低强制版本无效')
		}
	}

	function getStoreList(appid) {
		return db.collection('opendb-app-list')
			.where({
				appid
			})
			.get()
			.then(res => {
				const data = res.result.data[0]
				return data ? data.store_list || [] : []
			})
	}

	/**
	 * 将文件标记进废弃列表（同一文件去重）
	 * @param {String} fileId 云存储文件ID
	 * @param {String} fileDomain 文件所在扩展存储的自定义域名，为空表示内置存储
	 * @param {Object} slotInfo 可选的平台槽位信息（{ platform, url, sha256 }），用于蒸汽模式应用切换平台后切回时恢复
	 */
	function pushObsoleteFile(fileId, fileDomain, slotInfo) {
		if (!fileId) return
		// 历史记录可能无该字段，惰性初始化
		if (!formData.value.obsolete_file_ids) formData.value.obsolete_file_ids = []
		if (formData.value.obsolete_file_ids.some(item => item.file_id === fileId)) return
		formData.value.obsolete_file_ids.push(Object.assign({
			file_id: fileId,
			file_domain: fileDomain || '',
			obsolete_date: Date.now()
		}, slotInfo || {}))
	}

	/**
	 * 将文件移出废弃列表（× 移除新包后，被替换的原包回到引用状态）
	 */
	function removeObsoleteFile(fileId) {
		if (!fileId) return
		const list = formData.value.obsolete_file_ids
		if (!list) return
		const index = list.findIndex(item => item.file_id === fileId)
		if (index > -1) list.splice(index, 1)
	}

	/**
	 * 记录本会话上传过的包（含后续被 × 移除的），取消编辑时统一标记废弃
	 */
	function pushSessionUploadedFile(fileId, fileDomain) {
		if (!fileId) return
		if (sessionUploadedFiles.value.some(item => item.file_id === fileId)) return
		sessionUploadedFiles.value.push({
			file_id: fileId,
			file_domain: fileDomain || ''
		})
	}

	/**
	 * 提取平台标识：蒸汽模式应用平台为单选，值可能是字符串或单元素数组
	 */
	function getPlatformKey(platform) {
		return Array.isArray(platform) ? String(platform[0] || '') : String(platform || '')
	}

	/**
	 * 蒸汽模式应用切换平台时维护按平台暂存的包：
	 * - 蒸汽模式的 wgt 内部为平台相关字节码（Android/iOS/鸿蒙互不兼容），同一时间仅一个平台的包处于引用
	 * - 旧平台的引用包暂存进废弃列表（带 platform/url/sha256，切回时可恢复）
	 * - 目标平台若已有暂存的包则从废弃列表取出恢复（含下载链接与 SHA256）；否则清空等待重新上传
	 * - 普通 wgt（多平台共用）与原生 App（链接按平台手填）不参与
	 */
	function handlePlatformChange(newPlatform, oldPlatform) {
		if (!isWGT.value || formData.value.is_vapor !== true) return
		const newKey = getPlatformKey(newPlatform)
		const oldKey = getPlatformKey(oldPlatform)
		if (!newKey || !oldKey || newKey === oldKey) return
		platformPackages.set(oldKey, capturePackageState())
		// 清理归属仍只使用 file_id，外链槽位仅在当前表单实例暂存。
		if (formData.value.file_id) {
			pushObsoleteFile(formData.value.file_id, formData.value.file_domain, {
				platform: oldKey,
				url: formData.value.url || '',
				sha256: formData.value.sha256 || ''
			})
		}
		const target = platformPackages.get(newKey)
		restorePackageState(target || {})
		appFileList.value = null
		previousPackage.value = null
		// 目标平台有暂存包则恢复
		const obsoleteList = formData.value.obsolete_file_ids
		if (!obsoleteList) return
		const slotIndex = obsoleteList.findIndex(item => item.platform === newKey)
		if (slotIndex === -1) return
		obsoleteList.splice(slotIndex, 1)
	}

	function packageUploadSuccess(res) {
		uni.showToast({
			icon: 'success',
			title: '上传成功',
			duration: 800
		})
		// 暂存被替换包的引用信息，× 移除新包时恢复
		previousPackage.value = capturePackageState()
		// 被替换的原包标记废弃（无 file_id 的历史记录/手动外链无从删除，跳过）
		pushObsoleteFile(formData.value.file_id, formData.value.file_domain)
		const file = res.tempFiles[0]
		// 保存文件ID与存储域名（内置存储 domain 为空；扩展存储为其自定义域名），用于删除记录时同步删除云存储文件
		restorePackageState({ url: file.url, file_id: file.fileID || file.url || '',
			file_domain: uniFilePickerProvider.value === 'extStorage' ? (domain.value || '') : '', managedUrl: file.url,
			extStorage: uniFilePickerProvider.value === 'extStorage' })
		// 记录本会话上传的包，取消编辑时统一标记废弃
		pushSessionUploadedFile(formData.value.file_id, formData.value.file_domain)
		// 需校验 SHA256 的记录需要计算摘要
		if (needSha256.value) {
			getPackageSha256()
		}
	}

	/**
	 * 需校验 SHA256 的记录（蒸汽模式 wgt 或开启校验的 APK）若已上传包但尚未计算摘要，则自动补算
	 */
	function tryCalcPackageSha256() {
		if (!needSha256.value || hasBoundPackageSha256.value || sha256Loading.value) return
		return getPackageSha256()
	}

	/** APK 开启/关闭 SHA256 校验；开启时若已上传包但未计算摘要，自动补算 */
	function onVerifySha256Change(e) {
		const val = e.detail.value
		binddata('verify_sha256', val)
		if (val) return tryCalcPackageSha256()
		resetSha256Request()
	}

	/**
	 * 重新生成上传包的 SHA256（获取失败后的重试入口，无需删除重传）
	 */
	function regeneratePackageSha256() {
		if (!needSha256.value || sha256Loading.value) return
		return getPackageSha256()
	}

	/** 使在途 SHA256 请求失效（取消编辑/退出时调用），避免旧响应写入已还原的表单 */
	function resetSha256Request() {
		const binding = sha256Binding.value
		sha256RequestId++
		sha256Loading.value = false
		// 使在途请求失效不等于丢弃已完成摘要；来源未变时为已有绑定换代。
		if (binding && isSamePackageSha256Source(binding, packageSource.value)) {
			sha256Binding.value = { ...binding, generation: sha256RequestId }
		}
	}

	/**
	 * 需校验 SHA256 的记录提交前校验（计算中或缺失时提示并抛出异常，中断提交）
	 */
	function ensurePackageSha256(data = formData.value) {
		if (!needSha256.value) return
		if (sha256Loading.value) {
			uni.showModal({
				content: 'SHA256 计算中，请稍候再提交',
				showCancel: false
			})
			throw new Error('SHA256计算中')
		}
		if (data.url !== formData.value.url || !hasCurrentPackageSha256()) {
			// 即使调用方/组件以程序方式改值，提交也必须与当前下载 URL 的绑定一致。
			uni.showModal({
				content: packageSource.value ? 'SHA256 缺失、无效或下载来源已变更，请点击【重新生成】' : '请填写下载链接或上传安装包以生成 SHA256',
				showCancel: false
			})
			throw new Error('SHA256来源未绑定或无效')
		}
	}

	/**
	 * 提交前校验本次上传的包后缀与蒸汽模式标记匹配（先上传普通 wgt 再勾选蒸汽模式等操作会发布客户端无法安装的包）
	 * 蒸汽模式应用资源包支持 .zst（zstd 压缩）与 .wgt；普通 wgt 仅支持 .wgt，不能使用 .zst
	 * 仅校验本次新上传的文件，编辑历史记录、手动填写下载链接时不触发
	 */
	function ensurePackageExt() {
		if (!hasPackage.value) return
		// appFileList.name 为上传的完整文件名（含后缀）
		const fileName = (appFileList.value.name || '').toLowerCase()
		const isZstFile = fileName.endsWith('.zst')
		const isWgtFile = fileName.endsWith('.wgt')
		if (formData.value.is_vapor === true && !isZstFile && !isWgtFile) {
			uni.showModal({
				content: '蒸汽模式应用需上传 .zst 或 .wgt 格式的资源包，请删除已上传的包后重新上传',
				showCancel: false
			})
			throw new Error('蒸汽模式应用资源包格式错误')
		}
		if (formData.value.is_vapor !== true && isZstFile) {
			uni.showModal({
				content: '当前上传的是 .zst 格式资源包，请勾选蒸汽模式，或重新上传普通 wgt 包',
				showCancel: false
			})
			throw new Error('资源包格式与蒸汽模式标记不匹配')
		}
	}

	/**
	 * 按当前客户端下载来源计算 SHA256；URL 参数沿用已有云接口，不改变服务端访问权限。
	 */
	async function getPackageSha256() {
		const source = getPackageSha256Source(formData.value)
		if (!source) return
		const requestId = ++sha256RequestId
		const binding = { ...source, generation: requestId }
		sha256Binding.value = null
		formData.value.sha256 = ''
		sha256Loading.value = true
		const res = await request('getFileSha256', {
			fileID: binding.fileID,
			domain: binding.domain
		}, {
			functionName: 'uni-upgrade-center',
			timeout: 115000
		}).catch(err => {
			if (requestId === sha256RequestId && isSamePackageSha256Source(binding, getPackageSha256Source(formData.value))) {
				console.error('获取文件SHA256失败：', err && (err.errMsg || err.message) || err)
			}
		}).finally(() => {
			// 仅最新请求结束时复位计算状态：计算期间重新上传会并发新请求，旧请求结束不得提前解锁
			if (requestId === sha256RequestId) {
				sha256Loading.value = false
			}
		})
		const isCurrentRequest = requestId === sha256RequestId && isSamePackageSha256Source(binding, getPackageSha256Source(formData.value))
		if (res && res.success && isValidPackageSha256(res.sha256)) {
			if (isCurrentRequest && needSha256.value) {
				formData.value.sha256 = res.sha256
				sha256Binding.value = { ...binding, sha256: res.sha256 }
			}
		} else if (res) {
			// 旧请求/已移除的包不打扰
			if (isCurrentRequest) {
				uni.showToast({
					icon: 'none',
					title: '获取SHA256失败：' + (res.errMsg || '摘要格式无效'),
					duration: 3000
				})
			}
		}
	}

	function copyPackageSha256() {
		if (!hasBoundPackageSha256.value) return
		uni.setClipboardData({
			data: formData.value.sha256,
			showToast: false,
			success: () => {
				uni.showToast({
					icon: 'none',
					title: 'SHA256已复制',
					duration: 800
				})
			}
		})
	}

	function packageDelete(res) {
		if (!res.tempFile) return;
		// × 移除的是本会话新上传的包（云端已存在且无引用），标记废弃，由版本列表的清理入口统一删除；
		// file_domain 为上传时快照，须在恢复引用信息前取值
		const removedFileId = res.tempFile.fileID || res.tempFile.url || ''
		const uploadedFile = sessionUploadedFiles.value.find(item => item.file_id === removedFileId)
		pushObsoleteFile(removedFileId, uploadedFile ? uploadedFile.file_domain : formData.value.file_domain)
		// 恢复被替换包的引用信息（原记录的 file_id 不能丢失，否则后续删除记录时无法同步删除其文件）
		restorePackageState(previousPackage.value || {})
		appFileList.value = null
		previousPackage.value = null
		// 被替换的原包回到引用状态，移出废弃列表
		removeObsoleteFile(formData.value.file_id)
		uni.showToast({
			icon: 'success',
			title: '已移除并标记废弃',
			duration: 800
		})
		formRef.value.clearValidate('url')
	}

	function selectFile() {
		if (hasPackage.value) {
			uni.showToast({
				icon: 'none',
				title: '只可上传一个文件，请删除已上传后重试',
				duration: 1000
			});
		}
	}

	// SHA256 提交校验在页面 submit() 中统一执行（可被表单校验链捕获），此处不再重复校验
	function createCenterRecord(value) {
		// 局部变量保持驼峰命名，数据库字段使用蛇形 is_vapor
		const isVaporPackage = isWGT.value && formData.value.is_vapor === true
		// verify_sha256 仅 Android APK 生效（iOS/Harmony 无上传入口）；uni1 客户端忽略该开关
		const verifySha256 = isNativeApp.value && isAndroid.value && formData.value.verify_sha256 === true
		// 仅 wgt 或 Android APK 会引用上传文件，其余平台不写文件引用
		const keepFileRef = isWGT.value || (isNativeApp.value && isAndroid.value)
		const referencedFileId = keepFileRef ? (formData.value.file_id || '') : ''
		// 本会话上传但最终未被引用的包并入废弃列表，避免切离 Android 后成为孤儿文件
		const obsoleteFileIds = (formData.value.obsolete_file_ids || []).slice()
		sessionUploadedFiles.value.forEach(item => {
			if (item.file_id && item.file_id !== referencedFileId && !obsoleteFileIds.some(o => o.file_id === item.file_id)) {
				obsoleteFileIds.push({
					file_id: item.file_id,
					file_domain: item.file_domain || '',
					obsolete_date: Date.now()
				})
			}
		})
		return {
			...value,
			is_vapor: isVaporPackage,
			verify_sha256: verifySha256,
			// 蒸汽模式 wgt 或开启校验的 APK 携带 SHA256
			sha256: (isVaporPackage || verifySha256) ? (formData.value.sha256 || '') : '',
			file_id: referencedFileId,
			file_domain: referencedFileId ? (formData.value.file_domain || '') : '',
			// 本会话产生的废弃文件（被替换的原包、× 移除的新包）随记录原子入库
			obsolete_file_ids: obsoleteFileIds,
			uni_platform: uni_platform.value,
			create_env: 'upgrade-center'
		}
	}

	// 入参为 createCenterRecord 的返回值（uni_platform 已由其填充）
	function createStatQuery({
		appid,
		type,
		version,
		uni_platform
	}) {
		return {
			appid,
			type,
			version,
			uni_platform,
			create_env: 'uni-stat',
			stable_publish: false
		}
	}

	async function toUrl(url) {
		if (/^cloud:\/\//.test(url)) {
			const tcbRes = await uniCloud.getTempFileURL({ fileList: [url] });
			if (typeof tcbRes.fileList[0].tempFileURL !== 'undefined') url = tcbRes.fileList[0].tempFileURL;
		}
		// #ifdef H5
		window.open(url);
		// #endif
		// #ifndef H5
		uni.showToast({
			title: '请在浏览器中打开',
			icon: 'none'
		});
		// #endif
	}

	function getCloudStorageConfig() {
		return uni.getStorageSync('uni-admin-cloud-storage-config') || {};
	}

	function setCloudStorageConfig(data = {}) {
		uni.setStorageSync('uni-admin-cloud-storage-config', data);
	}

	// 临时方法，后面会优化
	function setCloudStorage(data) {
		// uniCloud.setCloudStorage 不是标准的API，临时挂载在uniCloud对象上的，后面会优化
		if (typeof uniCloud.setCloudStorage === "function") {
			uniCloud.setCloudStorage(data);
		}
	}

	onReady(() => {
		formRef.value.setRules(rules)
	})

	return {
		labelWidth,
		silentlyContent,
		mandatoryContent,
		updatePromptContent,
		updatePromptModalContent,
		vaporContent,
		verifySha256Content,
		stablePublishContent,
		stablePublishContent2,
		minUniVersionContent,
		minRequiredVersionContent,
		priorityContent,
		uploadFileDir,
		type_valuetotext,
		formOptions,
		rules,
		latestStableData,
		appFileList,
		sha256Loading,
		sha256Binding,
		uniFilePickerProvider,
		domain,
		sessionUploadedFiles,
		formData,
		isWGT,
		isNativeApp,
		updatePromptLocaldata,
		isiOS,
		isAndroid,
		isHarmony,
		hasPackage,
		fileExtname,
		platformLocaldata,
		enableUploadPackage,
		urlLabel,
		isApk,
		sha256Status,
		needSha256,
		binddata,
		onPackageUrlInput,
		changePackageDomain,
		bindLoadedPackageSha256,
		capturePackageState,
		restorePackageState,
		onSilentlyChange,
		onUpdatePromptChange,
		onMandatoryChange,
		onVerifySha256Change,
		validatePromptFields,
		validateMinRequiredVersion,
		handlePlatformChange,
		getStoreList,
		packageUploadSuccess,
		tryCalcPackageSha256,
		regeneratePackageSha256,
		resetSha256Request,
		ensurePackageSha256,
		ensurePackageExt,
		copyPackageSha256,
		packageDelete,
		selectFile,
		createCenterRecord,
		createStatQuery,
		toUrl,
		getCloudStorageConfig,
		setCloudStorageConfig,
		setCloudStorage
	}
}
