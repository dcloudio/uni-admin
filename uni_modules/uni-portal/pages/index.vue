<template>
	<view class="uni-container">
		<view v-if="isEdit" class="tip">
			<view class="flex-center-r">
				<text>1、该应用已有发布记录，您可以点击右侧下载按钮，获取上次版本数据对应的发布页；</text>
				<button class="custom-button" size="mini" type="primary" @click="preview">下载</button>
			</view>
			<text>2、若有新版本需修改发布，请编辑下方表单并保存，重新生成新的发布页</text>
		</view>
		<uni-forms ref="form" v-model="formData" validateTrigger="bind" style="max-width: 792px;" :rules="rules">
			<uni-card title="基础信息">
				<uni-forms-item class="forn-item__flex" name="appid" label="AppID" required>
					<uni-easyinput disabled placeholder="应用的AppID" v-model="formData.appid" trim="both">
					</uni-easyinput>
					<button class="custom-button" size="mini" type="primary" @click="autoFill">自动填充</button>
					<show-info :left="-180" :top="25" content="填写 appid 从数据库（opendb-app-list）查询填充数据" />
				</uni-forms-item>
				<uni-forms-item name="name" label="应用名称" required>
					<uni-easyinput disabled placeholder="应用名称" v-model="formData.name" trim="both"></uni-easyinput>
				</uni-forms-item>
				<uni-forms-item name="introduction" label="应用简介">
					<uni-easyinput placeholder="应用简介" v-model="formData.introduction" trim="both"></uni-easyinput>
				</uni-forms-item>
				<uni-forms-item name="description" label="应用描述">
					<textarea :maxlength="-1" auto-height placeholder="应用描述"
						@input="binddata('description', $event.detail.value)" class="uni-textarea-border"
						v-model="formData.description"></textarea>
				</uni-forms-item>
			</uni-card>

			<uni-card title="图标素材">
				<uni-forms-item label="应用图标">
					<uni-file-picker v-model="middleware_img.icon_url" :image-styles="{'width' : '200rpx'}"
						return-type="object" file-mediatype="image" limit="1" mode="grid"
						@success="(res) => iconUrlSuccess(res,'icon_url')"
						@delete="(res) => iconUrlDelete(res,'icon_url')">
					</uni-file-picker>
				</uni-forms-item>
				<uni-forms-item label="应用截图">
					<uni-file-picker v-model="screenshotList" file-mediatype="image" mode="grid"
						:image-styles="{'height': '500rpx','width' : '300rpx'}" @delete="iconUrlDelete">
					</uni-file-picker>
				</uni-forms-item>
			</uni-card>

			<uni-card class="app_platform" title="App">
				<view class="extra-button">
					<button type="primary" plain size="mini" @click="autoFillApp">自动填充</button>
					<show-info :left="40" :top="-35" content="填写 appid 从数据库（opendb-app-version）查询填充数据" />
				</view>
				<view v-for="item in appPlatformKeys" :key="item">
					<checkbox-group @change="({detail:{value}}) => {setPlatformChcekbox(item,!!value.length)}">
						<label class="title_padding" :class="{'font_bold':getPlatformChcekbox(item)}">
							<checkbox :value="item" :checked="middleware_checkbox[item]" />
							<text>{{appPlatformValues[item]}}</text>
						</label>
					</checkbox-group>
					<template v-if="getPlatformChcekbox(item)">
						<uni-forms-item label="名称">
							<uni-easyinput v-model="formData[item].name" trim="both"></uni-easyinput>
						</uni-forms-item>
						<uni-forms-item class="forn-item__flex" v-if="item === 'app_android'" label="上传包">
							<uni-file-picker v-model="appPackageInfo" file-extname="apk" :disabled="hasPackage"
								returnType="object" file-mediatype="all" limit="1"
								@success="(res) => iconUrlSuccess(res, `${item}.url`)"
								@delete="(res) => iconUrlDelete(res,`${item}.url`)" style="flex:1;">
								<button type="primary" size="mini" @click="selectFile">选择文件</button>
							</uni-file-picker>
							<text v-if="hasPackage"
								style="padding-left: 20px;color: #a8a8a8;">{{appPackageInfo.size && Number(appPackageInfo.size / 1024 / 1024).toFixed(2) + 'M'}}</text>
						</uni-forms-item>
						<uni-forms-item label="下载链接">
							<uni-easyinput v-model="formData[item].url" trim="both"></uni-easyinput>
						</uni-forms-item>
					</template>
				</view>
			</uni-card>

			<uni-card class="mp_platform" title="小程序">
				<view class="extra-button">
					<button type="primary" plain size="mini" @click="mpAccordion">{{mpExtra}}</button>
					<show-info :left="40" :top="-20" content="折叠状态下，即使勾选也不会显示详情" />
				</view>
				<view v-for="item in Object.keys(mpPlatform)" :key="item">
					<checkbox-group @change="({detail:{value}}) => {setPlatformChcekbox(item,!!value.length)}">
						<label class="title_padding" :class="{'font_bold':getPlatformChcekbox(item)}">
							<checkbox :value="item" :checked="middleware_checkbox[item]" />
							<text>{{mpPlatform[item]}}</text>
						</label>
					</checkbox-group>
					<template v-if="mpAccordionStatus && getPlatformChcekbox(item)">
						<uni-forms-item label="名称">
							<uni-easyinput v-model="formData[item].name" trim="both"></uni-easyinput>
						</uni-forms-item>
						<uni-forms-item label="小程序码">
							<uni-file-picker v-model="middleware_img[item]" :image-styles="{'width' : '200rpx'}"
								return-type="object" file-mediatype="image" limit="1" mode="grid"
								@success="(res) => iconUrlSuccess(res, `${item}.qrcode_url`)"
								@delete="(res) => iconUrlDelete(res, `${item}.qrcode_url`)">
							</uni-file-picker>
						</uni-forms-item>
					</template>
				</view>
			</uni-card>

			<uni-card title="H5">
				<uni-forms-item label="链接地址">
					<uni-easyinput v-model="formData.h5.url" trim="both"></uni-easyinput>
					<span style="font-size: 13px; color: #999;">如需免费的前端网页托管，请开通 <a style="color: inherit;"
							href="https://unicloud.dcloud.net.cn">uniCloud</a> ，创建服务空间，并在 “前端网页托管”
						里上传你的网页</span>
				</uni-forms-item>
			</uni-card>

			<uni-card title="快应用">
				<uni-forms-item label="名称">
					<uni-easyinput v-model="formData.quickapp.name" trim="both"></uni-easyinput>
				</uni-forms-item>
				<uni-forms-item label="快应用码">
					<uni-file-picker v-model="middleware_img.quickapp" :image-styles="{'width' : '200rpx'}"
						return-type="object" file-mediatype="image" limit="1" mode="grid"
						@success="(res) => iconUrlSuccess(res,'quickapp.qrcode_url')"
						@delete="(res) => iconUrlDelete(res,'quickapp.qrcode_url')">
					</uni-file-picker>
				</uni-forms-item>
			</uni-card>

			<view class="uni-button-group">
				<button type="primary" class="uni-button" style="width: 100px;" @click="submit">保存</button>
				<navigator open-type="navigateBack" style="margin-left: 15px;">
					<button class="uni-button" style="width: 100px;">返回</button>
				</navigator>
			</view>
		</uni-forms>
	</view>
</template>

<script>
	import mixin from './mixin/publish_add_detail_mixin.js';
	import showInfo from './components/show-info.vue'

	const db = uniCloud.database();
	const dbCmd = db.command;
	const dbCollectionName = 'opendb-app-publish';

	var download = function(content, filename) {
		var eleLink = document.createElement('a');
		eleLink.download = filename;
		eleLink.style.display = 'none';
		var blob = new Blob([content]);
		eleLink.href = URL.createObjectURL(blob);
		document.body.appendChild(eleLink);
		eleLink.click();
		document.body.removeChild(eleLink);
	};

	export default {
		components: {
			showInfo
		},
		mixins: [mixin],
		data() {
			return {
				mpExtra: ' ',
				mpAccordionStatus: 1
			}
		},
		onLoad(e) {
			if (e.id) {
				this.formDataId = e.id
				this.setFormData('appid', e.id)
				this.getDetail(e.id)
			} else {
				uni.showToast({
					icon: 'error',
					title: '缺少 appid',
					success() {
						setTimeout(() => {
							uni.navigateBack()
						}, 500)
					}
				})
			}
		},
		onReady() {
			this.mpExtra = '折叠'
		},
		methods: {
			/**
			 * 验证表单并提交
			 */
			submit() {
				uni.showLoading({
					mask: true
				})

				this.formatFormData()

				this.$refs.form.validate(this.keepItems).then((res) => {
					return this.submitForm(res)
				}).catch((err) => {
					console.error(err)
				}).finally(() => {
					uni.hideLoading()
				})
			},
			/**
			 * 提交表单
			 */
			submitForm(value) {
				// 使用 clientDB 提交数据
				(
					this.isEdit ?
					this.requestCloudFunction('setPublishData', {
						id: this.formDataId,
						value
					}) :
					db.collection(dbCollectionName).add(value)
				)
				.then((res) => {
					/* uni.showToast({
						title: `${this.isEdit ? '更新' : '新增'}成功`
					}) */
					uni.showModal({
						title: '保存成功',
						content: '是否立即下载统一发布页面？',
						cancelText: '否',
						confirmText: '是',
						success: (res) => {
							if (res.confirm) {
								this.preview()
							}

							setTimeout(() => uni.navigateBack(), 500)
						}
					})
				}).catch((err) => {
					uni.showModal({
						content: err.message || '请求服务失败',
						showCancel: false
					})
				})
			},
			/**
			 * 获取表单数据
			 * @param {Object} id
			 */
			getDetail(id) {
				uni.showLoading({
					mask: true
				})
				db.collection(dbCollectionName).where({
					appid: id
				}).get().then((res) => {
					const data = res.result.data[0]
					if (data) {
						this.isEdit = true
						this.formDataId = data._id
						this.initFormData(data)
					} else {
						this.autoFill()
						this.autoFillApp()
					}
				}).catch((err) => {
					uni.showModal({
						content: err.message || '请求服务失败',
						showCancel: false
					})
				}).finally(() => {
					uni.hideLoading()
				})
			},
			mpAccordion() {
				if (this.mpAccordionStatus) {
					this.mpExtra = '展开'
					this.mpAccordionStatus = 0
				} else {
					this.mpExtra = '折叠'
					this.mpAccordionStatus = 1
				}
			},
			preview() {
				this.requestCloudFunction('createPublishHtml', {
					id: this.formDataId
				}).then(res => {
					// #ifdef H5
					if ('download' in document.createElement('a')) {
						download(res.body, 'index.html');
					} else {
						uni.showToast({
							icon: 'error',
							title: '浏览器不支持',
							duration: 800
						})
					}
					// #endif
				})
			}
		}
	}
</script>

<style lang="scss">
	.title_padding {
		padding-bottom: 15px;
		display: block;
	}

	.font_bold {
		font-weight: bold;
	}

	.uni-button-group {
		& button {
			margin-left: 15px;
		}

		& button:first-child {
			margin-left: 0px;
		}
	}

	::v-deep {
		.forn-item__flex {
			.uni-forms-item__content {
				display: flex;
				align-items: center;

				.custom-button {
					height: 100%;
					margin-left: 10rpx;
					line-height: 36px;
				}
			}
		}

		.uni-card {
			padding: 0 !important;
			cursor: auto;
		}

		.uni-card__header {
			background-color: #eee;
		}

		.uni-card__header-title-text {
			font-weight: bold;
		}
	}

	.extra-button {
		display: flex;
		align-items: center;
		margin-bottom: 15px;

		button {
			margin: 0;
		}
	}

	.flex-center-r {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tip {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		background-color: #f3f5f7;
		color: #2c3e50;
		padding: 10px;
		font-size: 32rpx;

		border: {
			color: #409EFF;
			left-width: 8px;
			left-style: solid;
		}

		text {
			margin-right: 15px;
		}

		.custom-button {
			margin-left: 0px;
		}
	}
</style>
