<template>
	<view class="uni-container">
		<view class="uni-header">
			<view class="uni-group">
				<view class="uni-title">包类型</view>
				<view class="uni-sub-title">{{type_valuetotext[formData.type]}}</view>
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
				<uni-easyinput placeholder="更新标题" v-model="formData.title" />
			</uni-forms-item>
			<uni-forms-item name="contents" label="更新内容" required>
				<textarea auto-height style="box-sizing: content-box;" :maxlength="-1"  placeholder="更新内容 (可换行)"
					@input="binddata('contents', $event.detail.value)" class="uni-textarea-border"
					:value="formData.contents" @update:value="val => formData.contents = val"></textarea>
			</uni-forms-item>
      <uni-forms-item v-if="isWGT" key="is_vapor" name="is_vapor" label="蒸汽模式">
      	<!-- SHA256 计算中禁止取消勾选：蒸汽模式标记与摘要计算强关联，计算期间变更会破坏校验语义 -->
      	<switch :disabled="sha256Loading" @change="onVaporChange" :checked="formData.is_vapor" />
      	<show-info :content="vaporContent"></show-info>
      </uni-forms-item>
      
      <uni-forms-item name="platform" label="平台" required>
        <!-- sha256 计算中禁止切换平台：蒸汽模式切换平台会暂存旧包，需等待摘要写入暂存信息 -->
        <uni-data-checkbox :disabled="sha256Loading" :multiple="isWGT && !formData.is_vapor" v-model="formData.platform" :localdata="platformLocaldata" />
      </uni-forms-item>
			<uni-forms-item name="version" label="版本号" required>
				<uni-easyinput v-model="formData.version" placeholder="当前包版本号，必须大于当前线上发行版本号" />
			</uni-forms-item>
			<!-- endregion -->
			<uni-forms-item v-if="isWGT" key="min_uni_version" name="min_uni_version" label="原生App最低版本"
				:required="isWGT">
				<uni-easyinput placeholder="原生App最低版本" v-model="formData.min_uni_version" />
				<show-info :content="minUniVersionContent"></show-info>
			</uni-forms-item>

			<template v-if="enableUploadPackage">
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
						<uni-easyinput placeholder="请输入扩展存储自定义域名" v-model="domain" :maxlength="-1" style="width: 550px;" />
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
					<view class="flex">
						<text style="margin-top: 10px;font-size: 12px;color: #666;">上传{{fileExtname[0]}}到当前服务空间的云存储中，上传成功后，会自动使用云存储地址填充下载链接</text>
						<text style="margin-top: 10px;font-size: 12px;color: #666;">上传文件后同步到各地cdn缓存节点有延迟。请适当等候再提交新版信息入库，触发客户端更新提示。</text>
					</view>
				</uni-file-picker>
				<text v-if="hasPackage" style="padding-left: 20px;color: #a8a8a8;">{{Number(appFileList.size / 1024 / 1024).toFixed(2)}}M</text>
			</uni-forms-item>
		</template>

			<uni-forms-item key="url" name="url" :label="urlLabel" required>
				<view class="flex" style="flex-direction: column;align-items:flex-start;flex: 1;">
					<view class="flex" style="width: 100%;">
						<uni-easyinput placeholder="链接" v-model="formData.url" :maxlength="-1" />
						<text style="margin-left: 10px;color: #2979ff;cursor: pointer;text-decoration: underline;" v-if="isApk" @click="toUrl(formData.url)">测试下载</text>
					</view>
					<text style="margin-top: 10px;font-size: 12px;color: #666;" v-if="isApk">建议点击【测试下载】能正常下载后，再进行发布</text>
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

			<uni-forms-item v-if="isAndroid && !isWGT && formData.store_list.length" label="Android应用市场" labelWidth="125px"
				key="store_list" name="store_list">
				<view style="flex: 1;">
					<view v-for="(item) in formData.store_list" :key="item.id">
						<uni-card style="margin: 0px 0px 20px 0px;">
							<view style="display: flex;">
								<checkbox-group style="user-select: none;"
									@change="({detail:{value}}) => {item.enable = !!value.length}">
									<label class="title_padding">
										<checkbox value="scheme" :checked="item.enable" />
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
								<uni-easyinput v-model="item.priority" type="number"></uni-easyinput>
								<show-info :content="priorityContent"></show-info>
							</uni-forms-item>
						</uni-card>
					</view>
				</view>
			</uni-forms-item>
			<uni-forms-item v-if="isWGT" key="is_silently" name="is_silently" label="静默更新">
				<switch @change="onSilentlyChange" :checked="formData.is_silently" />
				<show-info :content="silentlyContent"></show-info>
			</uni-forms-item>
			<uni-forms-item key="is_mandatory" name="is_mandatory" label="强制更新">
				<switch @change="onMandatoryChange" :checked="formData.is_mandatory" />
				<show-info :content="mandatoryContent"></show-info>
			</uni-forms-item>
			<uni-forms-item name="stable_publish" label="上线发行">
				<switch @change="binddata('stable_publish', $event.detail.value)" :checked="formData.stable_publish" />
				<show-info :content="stablePublishContent2"></show-info>
			</uni-forms-item>
			<uni-forms-item v-show="false" name="type" label="安装包类型">
				<uni-data-checkbox v-model="formData.type" :localdata="formOptions.type_localdata" />
			</uni-forms-item>
			<view class="uni-button-group">
				<button type="primary" class="uni-button" style="width: 100px;" @click="submit"
					:disabled="submitting || (formData.is_vapor && sha256Loading)">发布</button>
				<button type="warn" class="uni-button" style="width: 100px;margin-left: 15px;" @click="back">取消</button>
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
		fields,
		platform_Android
	} from '../use-version-form.js';
	import {
		appVersionListDbName,
		compare,
		groupFilesByDomain,
		deleteFileGroups
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
		packageDelete,
		tryCalcVaporSha256,
		regeneratePackageSha256,
		ensureVaporSha256,
		ensurePackageExt,
		copyPackageSha256,
		selectFile,
		createCenterRecord,
		createStatQuery,
		toUrl,
		getCloudStorageConfig,
		setCloudStorageConfig,
		setCloudStorage
	} = useVersionForm(form);

	const latestVersion = ref('0.0.0');
	const lastVersionId = ref('');
	const submitting = ref(false); // 提交进行中：防止离开页面时的兜底删除与提交竞态

	onLoad(async ({
		appid,
		name,
		type
	}) => {
		let {
			domain: storageDomain,
			provider
		} = getCloudStorageConfig();
		if (storageDomain) domain.value = storageDomain;
		if (provider) uniFilePickerProvider.value = provider;

		if (appid && type && name) {
			const store_list = await getStoreList(appid)
			formData.value = {
				...formData.value,
				...{
					appid,
					name,
					type,
					store_list,
				}
			}

			latestStableData.value = (await getDetail(appid, type)) || []
			// 如果有数据，否则为发布第一版，默认为Android
			if (!isWGT.value && latestStableData.value.length) {
				setFormData(platform_Android)
			}
			// 如果是wgt ，则需要将 min_uni_version 设为必填
			if (isWGT.value) {
				rules.min_uni_version.rules.push({
					"required": true
				})
			}
		}
	});

	onUnload(() => {
		// 兜底：未提交离开（物理返回/关闭页面等未走确认流程的路径）时尽力删除本会话上传的包，避免遗留无引用文件；
		// 提交进行中不删（防与提交竞态误删刚入库的包），删除失败不再重试
		if (!submitting.value && sessionUploadedFiles.value.length) {
			deleteFileGroups(groupFilesByDomain(sessionUploadedFiles.value))
		}
		// 临时处理，后面会再优化
		setCloudStorage({
			provider: null
		});
	});

	watch(isiOS, (val) => {
		// wgt 的链接不在此处理：普通 wgt 多平台共用不随平台变化；蒸汽模式包由 handlePlatformChange 按平台暂存/恢复
		if (isWGT.value) return
		// 原生 App：按平台切换链接（Android 安装包 / iOS 商店地址）
		if (!val && hasPackage.value) {
			formData.value.url = appFileList.value.url
			return;
		}
		formData.value.url = ''
	});

	watch(() => formData.value.platform, (val, oldVal) => {
		// 蒸汽模式应用切换平台时先维护按平台暂存的包，再按平台带出历史版本信息
		handlePlatformChange(val, oldVal)
		setFormData(val)
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
	}, {
		immediate: true
	});

	// binddata 即对 formData 字段的直接赋值（原 uni-forms vue3 全局 binddata 亦不触发校验），无需再手动赋值一遍

	function onVaporChange(e) {
		binddata('is_vapor', e.detail.value);
		// 平台在单选/多选间切换，数据形态变化需清除已选；勾选时 Harmony 会置为 disabled（见 platformLocaldata）
		binddata('platform', []);
		// 先上传后勾选的场景，自动补算 SHA256
		tryCalcVaporSha256()
	}

	function setFormData(os) {
		uni.showLoading({
			mask: true
		})
		// 每次需初始化 版本 与 id ，因为可能是新增第一版
		latestVersion.value = '0.0.0';
		lastVersionId.value = ''

		const data = getData(latestStableData.value, os)[0]

		if (data) {
			const {
				_id,
				version,
				name,
				platform,
				min_uni_version,
				url
			} = data

			lastVersionId.value = _id
			latestVersion.value = version;

			formData.value.name = name

			// 如果不是wgt，则需要删除 min_uni_version 字段
			if (!isWGT.value) {
				delete formData.value.min_uni_version;
				formData.value.platform = platform[0]

				// iOS需要带出上一版本的AppStore链接
				if (isiOS.value || isHarmony.value) {
					formData.value.url = url;
				}
			} else {
				formData.value.min_uni_version = min_uni_version
				// formData.value.platform = [os]
			}
		} else if (isWGT.value) {
			formData.value.min_uni_version = ''
		}
		uni.hideLoading()
	}

	/**
	 * 触发表单提交
	 */
	function submit() {
		uni.showLoading({
			mask: true
		})
		form.value.validate(['store_list']).then((res) => {
			if (compare(latestVersion.value, res.version) >= 0) {
				uni.showModal({
					content: `版本号必须大于当前已上线版本（${latestVersion.value}）`,
					showCancel: false
				})
				throw new Error('版本号必须大于已上线版本');
			}
			// 校验本次上传的包后缀与蒸汽模式标记匹配（防止先上传普通 wgt 再勾选蒸汽模式等操作发布坏包）
			ensurePackageExt()
			// 蒸汽模式应用必须携带 SHA256 提交（计算中/缺失时抛出异常中断）
			ensureVaporSha256()
			// 勾选蒸汽模式会清空平台选择（多选转单选且数据形态变化），防止未重选平台时提交空平台记录
			if (!res.platform || !res.platform.length) {
				uni.showModal({
					content: '请选择更新平台',
					showCancel: false
				})
				throw new Error('平台未选择')
			}
			// 链接必填（上传安装包会自动填充；蒸汽模式切换平台会清空链接，需重新提供对应平台的包）
			if (!res.url) {
				uni.showModal({
					content: '请填写下载链接或上传安装包',
					showCancel: false
				})
				throw new Error('链接未填写')
			}
			// is_vapor 或原生包时平台为单选，需将 platform 字段还原为 array
			if (!isWGT.value || formData.value.is_vapor) {
				res.platform = [res.platform]
			}
			if (isiOS.value || isHarmony.value || isWGT.value) delete res.store_list;
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
		value = createCenterRecord(value)
		const collectionDB = db.collection(dbCollectionName)
		// uni-stat 会创建这些字段 appid
		let recordCreateByUniStat = []
		if (!isWGT.value) {
			const statRecords = await getDetail(value.appid, value.type, createStatQuery(value))
			// getDetail 查询失败时已提示，终止提交并复位（避免读取 undefined 抛错，且防止 submitting 卡住阻塞离开页面的兜底清理）
			if (!statRecords) {
				submitting.value = false
				return
			}
			recordCreateByUniStat = statRecords
		}

		let dbOperate
		if (!recordCreateByUniStat.length) {
			dbOperate = collectionDB.add(value)
		} else {
			value.create_date = Date.now()
			dbOperate = collectionDB.doc(recordCreateByUniStat[0]._id).update(value)
		}

		// 使用 clientDB 提交数据
		dbOperate.then(async (res) => {
			// 提交成功即会话结束：本会话的废弃标记已随记录入库，
			// 清空会话记录，防止其后（navigateBack 前的操作窗口内）误触发取消发布的删除逻辑
			sessionUploadedFiles.value = []
			// 如果新增版本为上线发行，且之前有该平台的上线发行，则自动将上一版设为下线
			if (value.stable_publish && lastVersionId.value) {
				await collectionDB.doc(lastVersionId.value).update({
					stable_publish: false
				})
			}
			uni.showToast({
				title: '新增成功'
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

		setCloudStorageConfig({
			provider: uniFilePickerProvider.value,
			domain: domain.value,
		});
	}

	/**
	 * 获取表单数据
	 * @param {Object} id
	 */
	function getDetail(appid, type, args = {}) {
		uni.showLoading({
			mask: true
		})
		return db.collection(dbCollectionName)
			.where(
				Object.assign({
					appid,
					type,
					stable_publish: true
				}, args)
			)
			.field(fields)
			.get()
			.then((res) => res.result.data)
			.catch((err) => {
				uni.showModal({
					content: err.message || '请求服务失败',
					showCancel: false
				})
			}).finally(() => {
				uni.hideLoading()
			})
	}

	function getData(data = [], platform) {
		if (typeof platform === 'string') {
			return data.filter(item => item.platform.includes(platform))
		} else {
			return data.filter(item => item.platform.toString() === platform.toString())
		}
	}

	function back() {
		// 提交进行中禁止取消发布（防与提交竞态误删刚入库记录的安装包）
		if (submitting.value) {
			uni.showModal({
				content: '正在提交，请稍候',
				showCancel: false
			})
			return
		}
		// sessionUploadedFiles 含当前挂着的与已被 × 移除的所有本会话上传包
		uni.showModal({
			title: '取消发布',
			content: sessionUploadedFiles.value.length ? '将会删除已上传的包（含已移除但未提交清理的）' : undefined,
			success: res => {
				if (res.confirm) {
					// 取消发布时记录尚未创建，废弃标记无处挂载，须当场删净本会话上传的所有包（失败交互式重试）
					if (sessionUploadedFiles.value.length) {
						removeUploadedPackages()
						return
					}

					uni.navigateBack()
				}
			}
		});
	}

	/**
	 * 取消发布时删除本会话上传的所有包（file_domain 为上传时快照，各包可能分属不同存储）
	 * 删除为幂等操作，失败时交互式重试；放弃将遗留无引用的安装包文件，需在云存储控制台手动清理
	 */
	function removeUploadedPackages() {
		uni.showLoading({
			mask: true
		})
		const total = sessionUploadedFiles.value.length
		deleteFileGroups(groupFilesByDomain(sessionUploadedFiles.value)).then(deletedFiles => {
			uni.hideLoading()
			if (deletedFiles.length >= total) {
				// 已全部删除，清空会话记录避免 onUnload 兜底重复删除
				sessionUploadedFiles.value = []
				uni.navigateBack()
				return
			}
			uni.showModal({
				title: '已上传的包删除失败',
				content: '可点击重试（安全幂等）；放弃将遗留无引用的安装包文件，需稍后在云存储控制台手动清理',
				confirmText: '重试',
				cancelText: '放弃',
				success: res => {
					if (res.confirm) {
						removeUploadedPackages()
					} else {
						uni.navigateBack()
					}
				}
			})
		})
	}
</script>

<style lang="scss">
  page {
    height: auto;
  }

	::v-deep .uni-forms-item__content {
		display: flex;
		align-items: center;
	}

	.uni-button-group {
		& button {
			margin-left: 15px;
		}

		& button:first-child {
			margin-left: 0px;
		}
	}

	.title_padding {
		padding-bottom: 15px;
		display: block;
	}

	::v-deep .uni-file-picker__files {
		max-width: 100%;
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
</style>
