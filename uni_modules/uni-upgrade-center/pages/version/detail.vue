<template>
	<view class="uni-container">
		<view class="uni-header">
			<view class="uni-group">
				<view class="uni-title">包类型</view>
				<view class="uni-sub-title" style="display: flex;justify-content: center;align-items: center;">
					{{type_valuetotext[formData.type]}}
				</view>
			</view>
			<view v-if="!isStable" class="uni-group">
				<button class="uni-button delete-version" type="warn" size="mini" @click="deletePackage">删除</button>
			</view>
		</view>
		<uni-forms ref="form" :value="formData" validateTrigger="bind" :labelWidth="labelWidth">
			<!-- region 基础信息 -->
			<uni-forms-item name="appid" label="AppID" required>
				<uni-easyinput :disabled="true" v-model="formData.appid" trim="both" />
			</uni-forms-item>
			<uni-forms-item name="name" label="应用名称">
				<uni-easyinput :disabled="true" v-model="formData.name" trim="both" />
			</uni-forms-item>
			<uni-forms-item name="title" label="更新标题">
				<uni-easyinput :disabled="detailsState" placeholder="更新标题" v-model="formData.title" />
			</uni-forms-item>
			<uni-forms-item name="contents" label="更新内容" required>
				<textarea auto-height style="box-sizing: content-box;" :disabled="detailsState"
					@input="binddata('contents', $event.detail.value)" class="uni-textarea-border" placeholder="更新内容 (可换行)"
					:value="formData.contents" @update:value="val => formData.contents = val"></textarea>
			</uni-forms-item>
      <uni-forms-item v-if="isWGT" key="is_vapor" name="is_vapor" label="蒸汽模式">
      	<!-- 发布后不允许修改蒸汽模式标记，避免与已发布资源包及其 SHA256 不匹配 -->
      	<switch :disabled="true" :checked="formData.is_vapor" />
      	<show-info :content="vaporContent"></show-info>
      </uni-forms-item>
			<uni-forms-item name="platform" label="平台" required>
				<!-- 蒸汽模式应用的平台为单选；普通 wgt 支持多选（multiple 为 true 时才会按数组反显） -->
				<uni-data-checkbox :disabled="true" :multiple="isWGT && !formData.is_vapor" v-model="formData.platform"
					:localdata="platformLocaldata" />
			</uni-forms-item>
			<uni-forms-item name="version" label="版本号" required>
				<uni-easyinput :disabled="true" v-model="formData.version" placeholder="当前包版本号，必须大于当前已上线版本号" />
			</uni-forms-item>
			<!-- endregion -->

			<uni-forms-item v-if="isWGT" key="min_uni_version" name="min_uni_version" label="原生App最低版本"
				:required="isWGT">
				<uni-easyinput :disabled="detailsState" placeholder="原生App最低版本" v-model="formData.min_uni_version" />
				<show-info :content="minUniVersionContent"></show-info>
			</uni-forms-item>

			<template v-if="enableUploadPackage && !detailsState">
				<uni-forms-item label="存储选择">
					<view class="flex">
						<radio-group @change="e => uniFilePickerProvider = e.detail.value" style="width: 100%;">
							<view class="flex" style="flex-wrap: nowrap;">
						上传至：
								<label>
									<radio value="unicloud" :checked="uniFilePickerProvider === 'unicloud'"/><text>内置存储</text>
								</label>
								<label style="margin-left: 20rpx;">
									<radio value="extStorage" :checked="uniFilePickerProvider === 'extStorage'"/><text>扩展存储</text>
								</label>
							</view>
						</radio-group>
						<text class="uni-sub-title" style="margin-top: 10px;font-size: 12px;color: #666;width: 100%;">内置存储是服务空间开通后自带的云存储，不支持自定义域名，不支持阶梯计费</text>
						<text class="uni-sub-title" style="margin-top: 10px;font-size: 12px;color: #666;">扩展存储支持自定义域名、阶梯计费，越用越便宜、功能更强大</text>
						<text class="uni-sub-title" style="margin-top: 10px;font-size: 12px;color: #2979ff;cursor: pointer;text-decoration: underline; margin-left: 10px;" @click="toUrl('https://doc.dcloud.net.cn/uniCloud/ext-storage/service.html')">扩展存储开通文档</text>
					</view>
				</uni-forms-item>

				<uni-forms-item label="自定义域名" v-if="uniFilePickerProvider === 'extStorage'">
					<view class="flex" style="flex-direction: column;align-items:flex-start;">
						<uni-easyinput placeholder="请输入扩展存储自定义域名" v-model="domain" :maxlength="-1" style="width: 550px;"/>
						<text class="uni-sub-title" style="margin-top: 10px;font-size: 12px;color: #666;">输入扩展存储绑定的域名，在服务空间-云存储-扩展存储页面可查看，如：cdn.example.com</text>
					</view>
				</uni-forms-item>

			<uni-forms-item :label="'上传'+fileExtname[0]+'包'">
				<uni-file-picker v-model="appFileList" :dir="uploadFileDir" :file-extname="fileExtname" :disabled="hasPackage"
					returnType="object" file-mediatype="all" limit="1" @success="packageUploadSuccess" :provider="uniFilePickerProvider"
					@delete="packageDelete">
					<view class="flex">
						<button type="primary" size="mini" @click="selectFile" style="margin: 0px;">选择文件</button>
					</view>
				</uni-file-picker>
				<text v-if="hasPackage"
					style="padding-left: 20px;color: #a8a8a8;">{{Number(appFileList.size / 1024 / 1024).toFixed(2)}}M</text>
			</uni-forms-item>
		</template>

			<uni-forms-item key="url" name="url" :label="urlLabel" required>
				<view class="flex" style="flex-direction: column;align-items:flex-start;flex: 1;">
					<view class="flex" style="width: 100%;">
						<uni-easyinput :disabled="detailsState" placeholder="下载链接" v-model="formData.url" :maxlength="-1" />
						<text style="margin-left: 10px;color: #2979ff;cursor: pointer;text-decoration: underline;" v-if="formData.url" @click="toUrl(formData.url)">测试下载</text>
					</view>
					<text style="margin-top: 10px;font-size: 12px;color: #666;" v-if="formData.url && !detailsState">建议点击【测试下载】能正常下载后，再进行发布</text>
				</view>
			</uni-forms-item>

			<uni-forms-item v-if="sha256Status" key="sha256" name="sha256" label="SHA256">
				<view v-if="sha256Status === 'success'" class="flex" style="align-items: center;width: 100%;">
					<text class="package-sha256-value" :title="formData.sha256">{{formData.sha256}}</text>
					<text class="package-sha256-copy" @click="copyPackageSha256">复制</text>
				</view>
				<text v-else-if="sha256Status === 'loading'" class="package-sha256-tip">SHA256 计算中，完成后方可提交…</text>
				<view v-else class="flex" style="align-items: center;width: 100%;">
					<text class="package-sha256-fail">SHA256 获取失败</text>
					<text class="package-sha256-copy" @click="regeneratePackageSha256">重新生成</text>
				</view>
			</uni-forms-item>

			<uni-forms-item v-if="isAndroid && !isWGT && formData.store_list.length" label="Android应用市场" key="store_list"
				name="store_list" labelWidth="120">
				<view style="flex: 1;">
					<view v-for="(item,index) in formData.store_list" :key="item.id">
						<uni-card style="margin: 0px 0px 20px 0px;">
							<view style="display: flex;">
								<checkbox-group style="user-select: none;"
									@change="({detail:{value}}) => {item.enable = !!value.length}">
									<label class="title_padding">
										<checkbox :disabled="detailsState" value="scheme" :checked="item.enable" />
										<text>是否启用</text>
									</label>
								</checkbox-group>
							</view>
							<uni-forms-item label="商店名称">
								<uni-easyinput disabled v-model="item.name" trim="both"></uni-easyinput>
							</uni-forms-item>
							<uni-forms-item label="Scheme">
								<uni-easyinput disabled v-model="item.scheme" trim="both"></uni-easyinput>
							</uni-forms-item>
							<uni-forms-item label="优先级">
								<uni-easyinput :disabled="detailsState" v-model="item.priority" type="number">
								</uni-easyinput>
								<show-info :content="priorityContent"></show-info>
							</uni-forms-item>
						</uni-card>
					</view>
				</view>
			</uni-forms-item>

			<uni-forms-item v-if="isWGT" key="is_silently" name="is_silently" label="静默更新">
				<switch :disabled="detailsState"
					@change="onSilentlyChange"
					:checked="formData.is_silently" />
				<show-info :content="silentlyContent"></show-info>
			</uni-forms-item>
			<uni-forms-item key="is_mandatory" name="is_mandatory" label="强制更新">
				<switch :disabled="detailsState"
					@change="onMandatoryChange"
					:checked="formData.is_mandatory" />
				<show-info :content="mandatoryContent"></show-info>
			</uni-forms-item>
			<uni-forms-item name="stable_publish" label="上线发行">
			<switch :disabled="detailsState"
				@change="binddata('stable_publish', $event.detail.value)"
					:checked="formData.stable_publish" />
				<show-info v-if="isStable" :content="stablePublishContent"></show-info>
				<show-info v-else :content="stablePublishContent2"></show-info>
			</uni-forms-item>
			<uni-forms-item name="create_date" label="上传时间">
				<uni-dateformat format="yyyy-MM-dd hh:mm:ss" :date="formData.create_date" :threshold="[0, 0]" />
			</uni-forms-item>
			<uni-forms-item v-show="false" name="type" label="安装包类型">
				<uni-data-checkbox v-model="formData.type" :localdata="formOptions.type_localdata" />
			</uni-forms-item>
			<view class="uni-button-group">
			<button type="primary" class="uni-button" style="width: 100px;" @click="enterEdit"
				v-if="detailsState">修改</button>
			<button type="primary" class="uni-button" style="width: 100px;" @click="submit"
				:disabled="submitting || (formData.is_vapor && sha256Loading)" v-if="!detailsState">提交</button>
				<button type="warn" class="uni-button" style="width: 100px;" @click="cancelEdit"
					v-if="!detailsState">取消</button>
				<button class="uni-button" style="width: 100px;margin-left: 15px;" @click="backPage">返回</button>
			</view>
		</uni-forms>
	</view>
</template>

<script setup>
	import {
		ref,
		watch,
		getCurrentInstance
	} from 'vue';
	import {
		onLoad,
		onUnload
	} from '@dcloudio/uni-app';
	import showInfo from '../components/show-info.vue';
	import {
		useVersionForm,
		fields
	} from '../use-version-form.js';
	import {
		deepClone,
		appVersionListDbName,
		confirmDeleteVersionRecords
	} from '../utils.js';

	const {
		proxy
	} = getCurrentInstance();

	const db = uniCloud.database();
	const dbCollectionName = appVersionListDbName;

	const form = ref(null);
	const {
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
		hasPackage,
		fileExtname,
		platformLocaldata,
		enableUploadPackage,
		urlLabel,
		sha256Status,
		binddata,
		onSilentlyChange,
		onMandatoryChange,
		regeneratePackageSha256,
		packageUploadSuccess,
		packageDelete,
		ensureVaporSha256,
		ensurePackageExt,
		copyPackageSha256,
		selectFile,
		toUrl,
		getCloudStorageConfig,
		setCloudStorage
	} = useVersionForm(form);

	const isStable = ref(true); // 是否是线上发行版
	const originalData = ref({}); // 原始数据，用于恢复状态
	const detailsState = ref(true) // 查看状态
	const submitting = ref(false) // 提交进行中：防止离开页面时的兜底标记与提交写库竞态

	let formDataId = ''

	onLoad(async (e) => {
		let {
			domain: storageDomain,
			provider
		} = getCloudStorageConfig();
		if (storageDomain) domain.value = storageDomain;
		if (provider) uniFilePickerProvider.value = provider;

		const id = e.id
		formDataId = id
		await getDetail(id)
		isStable.value = formData.value.stable_publish;
		latestStableData.value = await getLatestVersion();
		if (isWGT.value) {
			rules.min_uni_version.rules.push({
				"required": true
			})
		}
	});

	onUnload(() => {
		// 兜底：编辑态被直接离开（物理返回/关闭页面等未走确认流程的路径），尽力标记本会话上传的包，
		// 避免文件无引用且无记录；提交进行中不标记（防与提交写库竞态）；页面已卸载，无法反馈结果，失败不再重试
		if (!submitting.value && !detailsState.value && sessionUploadedFiles.value.length) {
			db.collection(dbCollectionName).doc(formDataId).update({
				obsolete_file_ids: buildObsoleteFileList(originalData.value.obsolete_file_ids)
			}).catch(() => {});
		}
		// 临时处理，后面会再优化
		setCloudStorage({
			provider: null
		});
	});

	watch(domain, (val) => {
		setCloudStorage({
			domain: val
		});
		// 已上传的扩展存储文件与域名绑定，域名变更时同步快照，保证删除/校验时路由正确
		if (formData.value.file_domain) {
			formData.value.file_domain = val || ''
		}
		if (formData.value.url) {
			// 替换 formData.value.url 内的域名
			if (!val) val = "请输入自定义域名"
			formData.value.url = formData.value.url.replace(/^(https?:\/\/)[^\/]+/, `$1${val}`);
		}
	});

	watch(uniFilePickerProvider, (val) => {
		setCloudStorage({
			provider: val
		});
	});

	// binddata 即对 formData 字段的直接赋值（原 uni-forms vue3 全局 binddata 亦不触发校验），无需再手动赋值一遍

	/**
	 * 数据未加载成功（无 appid）时提示并返回 false：记录必填 appid，为空即 getDetail 失败
	 */
	function ensureLoaded() {
		if (formData.value.appid) return true
		uni.showModal({
			content: '数据加载失败，请返回后重试',
			showCancel: false
		})
		return false
	}

	/**
	 * 提交进行中时禁止放弃修改/删除等操作并返回 false（防与提交写库竞态）
	 */
	function ensureNotSubmitting() {
		if (!submitting.value) return true
		uni.showModal({
			content: '正在提交，请稍候',
			showCancel: false
		})
		return false
	}

	/**
	 * 进入编辑态：记录未加载成功时禁止编辑，避免空表单提交覆盖原记录、或取消编辑将本地数据清空
	 */
	function enterEdit() {
		if (!ensureLoaded()) return
		detailsState.value = false
	}

	/**
	 * 触发表单提交
	 */
	function submit() {
		uni.showLoading({
			mask: true
		})
		form.value.validate(['store_list']).then((res) => {
			// 校验本次上传的包后缀与蒸汽模式标记匹配（防止先上传普通 wgt 再勾选蒸汽模式等操作发布坏包）
			ensurePackageExt()
			// 蒸汽模式应用必须携带 SHA256 提交（计算中/缺失时抛出异常中断）
			ensureVaporSha256()
			// 链接必填（上传安装包会自动填充），防止手动清空后提交空链接记录
			if (!res.url) {
				uni.showModal({
					content: '请填写下载链接或上传安装包',
					showCancel: false
				})
				throw new Error('链接未填写')
			}
			if (res.store_list) {
				res.store_list.forEach(item => {
					item.priority = parseFloat(item.priority)
				})
			}
			submitForm(res)
		}).catch((errors) => {
			uni.hideLoading()
		})
	}

	async function submitForm(value) {
		submitting.value = true
		// 补充非表单项数据（蒸汽模式标记、安装包SHA256、文件ID与存储域名，仅蒸汽模式应用携带 SHA256）
		value.is_vapor = isWGT.value && formData.value.is_vapor === true
		value.sha256 = value.is_vapor ? (formData.value.sha256 || '') : ''
		value.file_id = formData.value.file_id || ''
		value.file_domain = formData.value.file_domain || ''
		// 本会话产生的废弃文件（被替换的原包、× 移除的新包）随记录更新原子入库，由清理入口统一删除
		value.obsolete_file_ids = formData.value.obsolete_file_ids || []
		const collectionDB = db.collection(dbCollectionName)
		// 使用 clientDB 提交数据
		collectionDB.doc(formDataId).update(value).then(async (res) => {
			// 提交成功即会话结束：本会话的废弃标记已随记录入库，
			// 清空会话记录，防止其后（navigateBack 前的操作窗口内）误触发取消编辑的标记逻辑
			sessionUploadedFiles.value = []
			// 如果不是线上发行版，则在设置为上线发行时，需将之前的已上线版设为下线
			if (!isStable.value && value.stable_publish === true && latestStableData.value) {
				await collectionDB.doc(latestStableData.value._id).update({
					stable_publish: false
				})
			}

			uni.showToast({
				title: '修改成功'
			})

			proxy.getOpenerEventChannel().emit('refreshData')
			setTimeout(() => uni.navigateBack(), 500)
		}).catch((err) => {
			submitting.value = false
			uni.showModal({
				content: err.message || '请求服务失败',
				showCancel: false
			})
		}).finally(() => {
			uni.hideLoading()
		})
	}

	/**
	 * 获取表单数据
	 * @param {Object} id
	 */
	function getDetail(id) {
		uni.showLoading({
			mask: true
		})
		return db.collection(dbCollectionName)
			.doc(id)
			.field(fields)
			.get()
			.then((res) => {
				const data = res.result.data[0]
				if (data) {
					if (!data.store_list) data.store_list = []
					// 历史记录无废弃包字段，补齐默认值（后续 push/remove 依赖数组方法）
					if (!data.obsolete_file_ids) data.obsolete_file_ids = []
					// 兼容历史数据：蒸汽模式标记字段由驼峰 isVapor 更名为蛇形 is_vapor（提交时写回新字段）
					if (data.is_vapor === undefined && data.isVapor !== undefined) {
						data.is_vapor = data.isVapor === true
					}
					formData.value = data
					originalData.value = deepClone(formData.value)
				}
			}).catch((err) => {
				uni.showModal({
					content: err.message || '请求服务失败',
					showCancel: false
				})
			}).finally(() => {
				uni.hideLoading()
			})
	}

	function deletePackage() {
		// 记录未加载成功时禁止删除：待删文件清单来自未加载的数据，会漏删云存储文件
		if (!ensureLoaded()) return
		if (!ensureNotSubmitting()) return
		// #ifdef H5
		const {
			top,
			left,
			height
		} = document.querySelector('.uni-button.delete-version').getBoundingClientRect()
		// #endif

		// 一次交互确认是否同步删除云存储中的安装包
		// 纳入库中原文件（originalData）与本会话上传过的所有包（含被 × 移除的，其废弃标记仅在本地），两者可能分属不同存储
		const records = [originalData.value]
		if (sessionUploadedFiles.value.length) records.push(formData.value)
		confirmDeleteVersionRecords(records, () => {
			return new Promise((resolve, reject) => {
				uni.showLoading({
					mask: true
				})
				db.collection(dbCollectionName).doc(formDataId).remove()
					.then(() => {
						// 记录（含废弃标记）已删除，清空会话记录避免 onUnload 兜底向已删记录写入
						sessionUploadedFiles.value = []
						uni.showToast({
							title: '删除成功'
						})
						proxy.getOpenerEventChannel().emit('refreshData')
						setTimeout(() => uni.navigateBack(), 500)
						resolve()
					}).catch((err) => {
						uni.showModal({
							content: err.message || '请求服务失败',
							showCancel: false
						})
						reject(err)
					}).finally(() => {
						uni.hideLoading()
					})
			})
		}
		// #ifdef H5
		, { top: top + height, left, width: 200 }
		// #endif
		)
	}

	async function getLatestVersion() {
		const where = {
			appid: formData.value.appid,
			type: formData.value.type,
			stable_publish: true
		};
		if (!isWGT.value) {
			where.platform = formData.value.platform[0]
		}
		try {
			const latestStableRes = await db.collection(dbCollectionName).where(where).get()
			return latestStableRes.result.data.find(item => item.platform.toString() === formData.value.platform
				.toString());
		} catch (e) {
			// 查询失败不阻断详情页加载（提交时会经 latestStableData 兜底判断）
			console.error('获取最新上线版本失败：', e)
		}
	}

	function cancelEdit() {
		if (!ensureNotSubmitting()) return
		// sessionUploadedFiles 含当前挂着的与已被 × 移除的所有本会话上传包
		let content = '';
		!isiOS.value && sessionUploadedFiles.value.length ? content += '\n已上传的新包将标记为废弃，可在版本列表的清理入口统一删除' : '';
		uni.showModal({
			title: '取消修改',
			content,
			success: res => {
				if (res.confirm) commitDiscard()
			}
		});
	}

	function backPage() {
		if (detailsState.value) {
			uni.navigateBack()
			return
		}
		if (!ensureNotSubmitting()) return
		// 编辑态返回：放弃当前修改，本会话上传的包标记废弃（与取消编辑一致）
		uni.showModal({
			title: '放弃修改',
			content: (sessionUploadedFiles.value.length ? '已上传的安装包将标记为废弃。' : '') + '返回将放弃当前修改，是否继续？',
			success: res => {
				if (res.confirm) commitDiscard(() => uni.navigateBack())
			}
		})
	}

	/**
	 * 放弃当前修改：本会话上传过包则先标记废弃写库（完成后内部会恢复查看态），否则直接恢复查看态并执行 onDone
	 * @param {Function} onDone 处理完成后的补充动作（如返回列表）
	 */
	function commitDiscard(onDone) {
		if (sessionUploadedFiles.value.length) {
			markSessionFilesObsolete(onDone)
		} else {
			restoreEditState()
			onDone && onDone()
		}
	}

	/**
	 * 构造取消编辑时应写库的废弃列表：基准数组 + 本会话上传的所有包（含被 × 移除的；被替换的原包回到引用状态，不在标记之列）
	 * @param {Array} baseObsolete 基准数组（markSessionFilesObsolete 取服务端最新值，onUnload 兜底取本页原始数据）
	 */
	function buildObsoleteFileList(baseObsolete) {
		const obsolete = (baseObsolete || []).slice()
		sessionUploadedFiles.value.forEach(file => {
			if (!obsolete.some(item => item.file_id === file.file_id)) {
				obsolete.push({
					file_id: file.file_id,
					file_domain: file.file_domain || '',
					obsolete_date: Date.now()
				})
			}
		})
		return obsolete
	}

	/**
	 * 将本会话上传过的包统一标记废弃写库
	 * 写库前拉取服务端最新废弃列表再合并，避免用本页旧快照整体覆盖期间其他操作新增的废弃项
	 * 标记为幂等操作：写库失败自动重试一次，仍失败提示用户重试；用户放弃则直接执行 onDone（文件遗留为无引用，需控制台手动清理）
	 * @param {Function} onDone 标记完成（含用户放弃）后的动作，如取消编辑回到查看态后的补充处理、返回列表等
	 */
	function markSessionFilesObsolete(onDone, retried = false) {
		uni.showLoading({
			mask: true
		})
		db.collection(dbCollectionName).doc(formDataId).field('obsolete_file_ids').get().then((latestRes) => {
			const data = latestRes.result.data[0]
			// 记录已不存在（被并发删除）时退化为本页原始数据，写库将 no-op
			const latestObsolete = data && data.obsolete_file_ids ? data.obsolete_file_ids : (originalData.value
				.obsolete_file_ids || [])
			return db.collection(dbCollectionName).doc(formDataId).update({
				obsolete_file_ids: buildObsoleteFileList(latestObsolete)
			})
		}).then(() => {
			uni.hideLoading()
			restoreEditState()
			// 废弃包统计已变化，通知版本列表刷新
			proxy.getOpenerEventChannel().emit('refreshData')
			onDone && onDone()
		}).catch((err) => {
			uni.hideLoading()
			console.error('取消编辑标记废弃包失败：', err)
			if (!retried) {
				// 幂等操作，失败自动重试一次
				markSessionFilesObsolete(onDone, true)
				return
			}
			uni.showModal({
				title: '废弃包标记失败',
				content: '本会话上传的包未能标记为废弃。可点击重试（安全幂等）；放弃将遗留无引用的安装包文件，需稍后在云存储控制台手动清理',
				confirmText: '重试',
				cancelText: '放弃',
				success: res => {
					if (res.confirm) {
						markSessionFilesObsolete(onDone)
					} else {
						restoreEditState()
						onDone && onDone()
					}
				}
			})
		})
	}

	/**
	 * 恢复查看态：还原入库数据、清空选择器显示与本会话上传记录
	 */
	function restoreEditState() {
		formData.value = deepClone(originalData.value)
		appFileList.value = null
		sessionUploadedFiles.value = []
		detailsState.value = true
	}
</script>
<style lang="scss">
  page {
    height: auto;
  }

	.show-stable-info {
		position: absolute;
		left: 165px;
		padding: 5px 10px;
		background-color: #f4f4f5;
		color: #909399;
		border-radius: 4px;
		border: 1px solid #e9e9eb;
	}

	::v-deep .uni-forms-item__content {
		display: flex;
		align-items: center;
	}

	.package-sha256-value {
		flex: 1;
		color: #999;
		font-size: 12px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.package-sha256-copy {
		margin-left: 10px;
		color: #2979ff;
		cursor: pointer;
		text-decoration: underline;
		flex-shrink: 0;
	}

	.package-sha256-tip {
		color: #999;
		font-size: 12px;
	}

	.package-sha256-fail {
		color: #f56c6c;
		font-size: 12px;
	}

	.uni-button-group {
		& button {
			margin-left: 15px;
		}

		& button:first-child {
			margin-left: 0px;
		}
	}
</style>
