import {
	ref,
	computed
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
	'appid,name,title,contents,platform,type,version,min_uni_version,url,stable_publish,is_silently,is_mandatory,is_vapor,isVapor,sha256,file_id,file_domain,obsolete_file_ids,create_date,store_list'

/**
 * 新增/编辑版本页面共用逻辑（原 mixin 改写为组合式 API，兼容 vue3 蒸汽模式）
 * @param {Object} formRef uni-forms 组件实例的 ref
 */
export function useVersionForm(formRef) {
	// 模板与方法共用的常量
	const labelWidth = '100px';
	const enableiOSWgt = true; // 是否开启iOS的wgt更新
	const silentlyContent = '静默更新：App升级时会在后台下载wgt包并自行安装。新功能在下次启动App时生效'
	const mandatoryContent = '强制更新：App升级弹出框不可取消'
	const vaporContent = '蒸汽模式：标记该wgt资源包为蒸汽模式应用。平台仅支持单选，且暂不支持鸿蒙'
	const stablePublishContent = '将线上发行包变更为下线'
	const stablePublishContent2 = '使用本包替换当前线上发行版'
	const minUniVersionContent = '上次使用新Api或打包新模块的App版本'
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
		]
	}
	const rules = getValidator([
		"appid", "contents", "platform", "type",
		"version", "min_uni_version", "url", "stable_publish",
		"title", "name", "is_silently", "is_mandatory", "is_vapor", "store_list"
	])

	// 响应式状态
	const latestStableData = ref([]) // 库中最新已上线版
	const appFileList = ref(null) // 上传包
	const sha256Loading = ref(false) // 上传包SHA256计算中
	// SHA256 请求序号：计算期间重新上传会并发新请求，仅最新请求的结果生效（旧请求不写入/不复位/不提示）
	let sha256RequestId = 0
	const uniFilePickerProvider = ref('unicloud') // 上传存储供应商：unicloud 内置存储；extStorage 扩展存储
	const domain = ref('') // 扩展存储绑定的自定义域名
	const preUrl = ref('')
	// 被替换包的引用信息暂存（× 移除新上传的包时恢复，防止丢失原记录的 file_id）
	const preFileId = ref('')
	const preFileDomain = ref('')
	const preSha256 = ref('')
	// 本会话上传过的所有包（含已被 × 移除的），取消编辑时统一标记废弃写库
	const sessionUploadedFiles = ref([])
	const formData = ref({
		"appid": "",
		"name": "",
		"title": "",
		"contents": "",
		"platform": [],
		"store_list": [],
		"type": "",
		"version": "",
		"min_uni_version": "",
		"url": "",
		"file_id": "",
		"file_domain": "",
		"obsolete_file_ids": [],
		"stable_publish": false,
		"is_vapor": false,
		"sha256": "",
		"create_date": null
	})

	// 计算属性
	const isWGT = computed(() => formData.value.type === 'wgt')
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
	})
	const isApk = computed(() => {
		const url = formData.value.url || ''
		const apkIndex = url.indexOf('apk')
		return url && (apkIndex > -1 && apkIndex === url.length - 3)
	})
	/**
	 * 当前待校验的蒸汽模式资源包文件：优先使用文件选择器中的包；从平台槽位恢复的包（选择器为空）使用当前引用的 file_id
	 */
	const vaporPackageFile = computed(() => {
		if (appFileList.value) return appFileList.value
		if (formData.value.file_id) return {
			fileID: formData.value.file_id
		}
		return null
	})
	/**
	 * SHA256 展示状态：'' 不展示；loading 计算中；success 已获取；fail 获取失败
	 * 仅蒸汽模式应用需要展示与校验 SHA256；有可校验文件但摘要缺失时展示失败以提供重算入口
	 */
	const sha256Status = computed(() => {
		if (!formData.value.is_vapor) return ''
		if (sha256Loading.value) return 'loading'
		if (formData.value.sha256) return 'success'
		return vaporPackageFile.value ? 'fail' : ''
	})

	// 方法
	/**
	 * 等价于 uni-forms 挂载的 binddata：向表单数据中写入字段值
	 */
	function binddata(name, value) {
		formData.value[name] = value
	}

	/**
	 * 静默更新切换：与强制更新互斥
	 */
	function onSilentlyChange(e) {
		const val = e.detail.value
		binddata('is_silently', val)
		if (val) binddata('is_mandatory', false)
	}

	/**
	 * 强制更新切换：与静默更新互斥
	 */
	function onMandatoryChange(e) {
		const val = e.detail.value
		binddata('is_mandatory', val)
		if (val) binddata('is_silently', false)
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
		// 旧平台的引用包暂存（无 file_id 的手填链接无处安放，随清空处理）
		if (formData.value.file_id) {
			pushObsoleteFile(formData.value.file_id, formData.value.file_domain, {
				platform: oldKey,
				url: formData.value.url || '',
				sha256: formData.value.sha256 || ''
			})
		}
		// 清空当前引用与文件选择器显示
		formData.value.url = ''
		formData.value.file_id = ''
		formData.value.file_domain = ''
		formData.value.sha256 = ''
		appFileList.value = null
		// 目标平台有暂存包则恢复
		const obsoleteList = formData.value.obsolete_file_ids
		if (!obsoleteList) return
		const slotIndex = obsoleteList.findIndex(item => item.platform === newKey)
		if (slotIndex === -1) return
		const slot = obsoleteList.splice(slotIndex, 1)[0]
		formData.value.url = slot.url || ''
		formData.value.file_id = slot.file_id || ''
		formData.value.file_domain = slot.file_domain || ''
		formData.value.sha256 = slot.sha256 || ''
	}

	function packageUploadSuccess(res) {
		uni.showToast({
			icon: 'success',
			title: '上传成功',
			duration: 800
		})
		// 暂存被替换包的引用信息，× 移除新包时恢复
		preUrl.value = formData.value.url
		preFileId.value = formData.value.file_id
		preFileDomain.value = formData.value.file_domain
		preSha256.value = formData.value.sha256
		// 被替换的原包标记废弃（无 file_id 的历史记录/手动外链无从删除，跳过）
		pushObsoleteFile(formData.value.file_id, formData.value.file_domain)
		formData.value.url = res.tempFiles[0].url
		// 保存文件ID与存储域名（内置存储 domain 为空；扩展存储为其自定义域名），用于删除记录时同步删除云存储文件
		formData.value.file_id = res.tempFiles[0].fileID || res.tempFiles[0].url || ''
		formData.value.file_domain = uniFilePickerProvider.value === 'extStorage' ? (domain.value || '') : ''
		// 记录本会话上传的包，取消编辑时统一标记废弃
		pushSessionUploadedFile(formData.value.file_id, formData.value.file_domain)
		// 仅蒸汽模式应用需要计算 SHA256
		if (formData.value.is_vapor) {
			getPackageSha256(res.tempFiles[0])
		}
	}

	/**
	 * 开启蒸汽模式时，若已上传包但尚未计算 SHA256，则自动补算（如先上传后勾选的场景）
	 */
	function tryCalcVaporSha256() {
		if (formData.value.is_vapor && hasPackage.value && !formData.value.sha256 && !sha256Loading.value) {
			getPackageSha256(appFileList.value)
		}
	}

	/**
	 * 重新生成上传包的 SHA256（获取失败后的重试入口，无需删除重传）
	 */
	function regeneratePackageSha256() {
		if (!formData.value.is_vapor || sha256Loading.value) return
		const file = vaporPackageFile.value
		if (!file) return
		getPackageSha256(file)
	}

	/**
	 * 蒸汽模式应用提交前校验 SHA256（计算中或缺失时提示并抛出异常，中断提交）
	 */
	function ensureVaporSha256() {
		if (!formData.value.is_vapor) return
		if (sha256Loading.value) {
			uni.showModal({
				content: 'SHA256 计算中，请稍候再提交',
				showCancel: false
			})
			throw new Error('SHA256计算中')
		}
		if (!formData.value.sha256) {
			// 存在可校验文件（选择器中的上传包或平台槽位恢复的包）时引导重新生成
			const hasFile = vaporPackageFile.value != null
			uni.showModal({
				content: hasFile ? 'SHA256 获取失败，请点击【重新生成】重试，或删除已上传的包后重新上传' : '蒸汽模式应用需上传资源包以生成 SHA256',
				showCancel: false
			})
			throw new Error('SHA256缺失')
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
	 * 获取上传包的SHA256（仅蒸汽模式应用，用于鸿蒙应用市场上架等场景填写）
	 * @param {Object} file 上传成功后的文件对象，需包含 fileID 或 url
	 */
	async function getPackageSha256(file) {
		const fileID = file && (file.fileID || file.url)
		if (!fileID) return
		const requestId = ++sha256RequestId
		formData.value.sha256 = ''
		sha256Loading.value = true
		const res = await request('getFileSha256', {
			fileID,
			// file_domain 为上传时快照，与删除逻辑一致（避免上传后切换存储类型导致路由错误）
			domain: formData.value.file_domain || ''
		}, {
			functionName: 'uni-upgrade-center'
		}).catch(err => {
			console.error('获取文件SHA256失败：', err && (err.errMsg || err.message) || err)
		}).finally(() => {
			// 仅最新请求结束时复位计算状态：计算期间重新上传会并发新请求，旧请求结束不得提前解锁
			if (requestId === sha256RequestId) {
				sha256Loading.value = false
			}
		})
		if (res && res.success && res.sha256) {
			// 计算期间可能取消勾选蒸汽模式、删除/更换了包，或从平台槽位恢复；
			// 选择器为空时以当前引用的 file_id 作为对应标识，仅最新请求且结果仍对应当前包时写入
			const currentFileID = appFileList.value ? (appFileList.value.fileID || appFileList.value.url) : (
				formData.value.file_id || '')
			if (requestId === sha256RequestId && formData.value.is_vapor && currentFileID === fileID) {
				formData.value.sha256 = res.sha256
			}
		} else if (res && res.errMsg) {
			// 旧请求的失败不打扰（当前已是更新的请求/包）
			if (requestId === sha256RequestId) {
				uni.showToast({
					icon: 'none',
					title: '获取SHA256失败：' + res.errMsg,
					duration: 3000
				})
			}
		}
	}

	function copyPackageSha256() {
		if (!formData.value.sha256) return
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
		if (!hasPackage.value) return;
		// × 移除的是本会话新上传的包（云端已存在且无引用），标记废弃，由版本列表的清理入口统一删除；
		// file_domain 为上传时快照，须在恢复引用信息前取值
		pushObsoleteFile(res.tempFile.fileID || res.tempFile.url || '', formData.value.file_domain)
		// 恢复被替换包的引用信息（原记录的 file_id 不能丢失，否则后续删除记录时无法同步删除其文件）
		formData.value.file_id = preFileId.value || ''
		formData.value.file_domain = preFileDomain.value || ''
		formData.value.sha256 = preSha256.value || ''
		// 被替换的原包回到引用状态，移出废弃列表
		removeObsoleteFile(preFileId.value)
		uni.showToast({
			icon: 'success',
			title: '已移除并标记废弃',
			duration: 800
		})
		formData.value.url = preUrl.value
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

	function createCenterRecord(value) {
		// 局部变量保持驼峰命名，数据库字段使用蛇形 is_vapor
		const isVaporPackage = isWGT.value && formData.value.is_vapor === true
		return {
			...value,
			is_vapor: isVaporPackage,
			// 仅蒸汽模式应用携带 SHA256
			sha256: isVaporPackage ? (formData.value.sha256 || '') : '',
			file_id: formData.value.file_id || '',
			file_domain: formData.value.file_domain || '',
			// 本会话产生的废弃文件（被替换的原包、× 移除的新包）随记录原子入库
			obsolete_file_ids: formData.value.obsolete_file_ids || [],
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
		vaporContent,
		stablePublishContent,
		stablePublishContent2,
		minUniVersionContent,
		priorityContent,
		uploadFileDir,
		type_valuetotext,
		formOptions,
		rules,
		latestStableData,
		appFileList,
		sha256Loading,
		uniFilePickerProvider,
		domain,
		sessionUploadedFiles,
		formData,
		isWGT,
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
		binddata,
		onSilentlyChange,
		onMandatoryChange,
		handlePlatformChange,
		getStoreList,
		packageUploadSuccess,
		tryCalcVaporSha256,
		regeneratePackageSha256,
		ensureVaporSha256,
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
