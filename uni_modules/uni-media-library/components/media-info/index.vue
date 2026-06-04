<template>
	<view class="media-info-wrap">
		<scroll-view scroll-y class="info-scroll-body" v-if="showMediaInfoPanel">
			<view class="info-content-box">
				<view class="preview" v-if="currentMedia.src">
					<view class="image" v-if="currentMedia.type === 'image'">
						<image
							class="img"
							:src="coverImage"
							mode="aspectFill"
						></image>
					</view>
					<view class="video" v-else-if="currentMedia.type === 'video'">
						<video
							style="width: 100%; height: 100%; border-radius: 4px;"
							:src="currentMedia.src"
							:poster="coverImage"
						></video>
					</view>
					<view class="ops" v-if="currentMedia.type === 'image'">
						<!-- #ifdef H5 -->
						<view class="op" @click="openCropper" title="裁剪">
							<text class="ri-crop-line op-icon"></text>
						</view>
						<!-- #endif -->
						<view class="op" @click="previewImage" title="预览">
							<text class="ri-eye-line op-icon"></text>
						</view>
					</view>
				</view>

				<view class="edit-section">
					<view class="edit-item">
						<view class="label">描述</view>
						<view class="content">
							<media-input
								placeholder="描述; 用于媒体资源搜索"
								v-model="currentMedia.description"
								@blur="onFiledChange('description')"
								@clear="onFiledChange('description')"
							></media-input>
						</view>
					</view>
					<view class="edit-item">
						<view class="label">替代文字 (Alt)</view>
						<view class="content">
							<media-input
								placeholder="替代文字，资源加载失败时展示"
								v-model="currentMedia.alt"
								@blur="onFiledChange('alt')"
								@clear="onFiledChange('alt')"
							></media-input>
						</view>
					</view>
					<view class="edit-item">
						<view class="label">标签</view>
						<view class="content">
							<view class="tag-input-wrap">
								<uni-easyinput
									v-model="tagSearchKeyword"
									class="tag-search-input"
									suffixIcon="search"
									placeholder="搜索或创建标签..."
									@confirm="onTagInputConfirm"
								></uni-easyinput>
								<scroll-view scroll-y class="tag-dropdown" v-if="tagSearchKeyword && filteredAvailableTags.length > 0">
									<view
										class="tag-option"
										v-for="tag in filteredAvailableTags"
										:key="tag._id"
										@click="addTag(tag._id)"
									>
										<text>{{ tag.name }}</text>
									</view>
								</scroll-view>
								<view class="tag-dropdown" v-if="tagSearchKeyword && filteredAvailableTags.length === 0 && !isExistingTag">
									<view class="tag-option create-option" @click="createAndAddTag">
										<text class="ri-add-line"></text>
										<text>创建标签「{{ tagSearchKeyword }}」</text>
									</view>
								</view>
							</view>
							<view class="media-tags">
								<view class="tag-chip" v-for="tag in currentMediaTags" :key="tag._id">
									<text>{{ tag.name }}</text>
									<uni-icons type="clear" size="14" color="#1677ff" class="tag-remove" @click="removeTag(tag._id)"></uni-icons>
								</view>
							</view>
						</view>
					</view>
					<view class="media-base-info">
						<view class="info-item">
							<view class="label">文件类型</view>
							<view class="content">{{ fileType }}</view>
						</view>
						<view class="info-item">
							<view class="label">分辨率</view>
							<view class="content">{{ resolution.width }}*{{ resolution.height }}</view>
						</view>
						<view class="info-item">
							<view class="label">文件大小</view>
							<view class="content">{{ fileSize || '-' }}</view>
						</view>
						<view class="info-item" v-if="currentMedia.type === 'video'">
							<view class="label">时长</view>
							<view class="content">{{ mediaDuration }}</view>
						</view>
						<view class="info-item">
							<view class="label">上传者</view>
							<view class="content">
								{{ currentMedia.uploadUser && currentMedia.uploadUser[0] && currentMedia.uploadUser[0].nickname || '-' }}
							</view>
						</view>
						<view class="info-item">
							<view class="label">存储位置</view>
							<view class="content">{{ storageProviderLabel }}</view>
						</view>
						<view class="info-item" style="width: 100%;">
							<view class="label">原始URL</view>
							<view class="content" v-if="/^(cloud|qiniu):\/\//.test(currentMedia._src)">{{
									currentMedia._src
								}}
							</view>
							<view class="content" v-else>{{ currentMedia.src }}</view>
						</view>
						<view class="info-item" style="width: 100%;">
							<view class="label">原始文件名</view>
							<view class="content">{{ currentMedia.originalName || '-' }}</view>
						</view>
						<view class="info-item" style="width: 100%;">
							<view class="label">上传时间</view>
							<view class="content">{{ createDate }}</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		<view class="info-empty" v-else>
			<uni-icons type="info" size="28" color="#bfbfbf"></uni-icons>
			<text>选择素材查看详情</text>
		</view>
		<!-- #ifdef H5 -->
		<media-cropper
			ref="cropper"
			:image-url="currentMedia ? currentMedia.src : ''"
			:file-name="currentMedia ? currentMedia.originalName : ''"
			@confirm="uploadCroppedImage"
		></media-cropper>
		<!-- #endif -->
	</view>
</template>

<script>
import {generateCoverURL} from "../../common/crop";
import {getMediaLibraryCo} from "../../common/cloud-object";
import {FromFileUploader} from "../../common/uploader";
import MediaInput from "../media-input/index.vue";
import MediaCropper from "../media-cropper/index.vue";

const db = uniCloud.database()
const CROP_UPLOAD_TAG_NAME = '裁剪上传'

export default {
	name: "media-info",
	components: {
		MediaInput,
		MediaCropper
	},
	props: {
		currentMedia: {
			type: Object,
			default: () => {
			}
		},
		tags: {
			type: Array,
			default: () => []
		},
		storageProvider: {
			type: String,
			default: 'internal'
		}
	},
	emits: ['tagsChanged', 'cropUploaded'],
	data() {
		return {
			mediaInfo: {
				height: 200
			},
			tagSearchKeyword: '',
			creatingTag: false,
			croppingUploading: false
		}
	},
	computed: {
		showMediaInfoPanel() {
			return this.currentMedia && this.currentMedia._id
		},
		fileSize() {
			const size = this.currentMedia.size;

			if (!size) return '0.00 MB';
			if (size < 1024) return size + ' B';
			if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
			if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(2) + ' MB';
			return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB';
		},
		fileType() {
			if (this.currentMedia.fileType) {
				return this.currentMedia.fileType.toUpperCase()
			} else {
				return '-'
			}
		},
		resolution() {
			const res = {
				width: 0,
				height: 0
			}

			if (this.currentMedia.resolution) {
				res.width = this.currentMedia.resolution.width || 0
				res.height = this.currentMedia.resolution.height || 0
			}

			return res
		},
		mediaDuration() {
			if (this.currentMedia.duration) {
				const duration = this.currentMedia.duration
				const hours = Math.floor(duration / 3600)
				const minutes = Math.floor((duration - hours * 3600) / 60)
				const seconds = Math.floor(duration - hours * 3600 - minutes * 60)

				return `${hours}:${minutes}:${seconds}`
			} else {
				return '-'
			}
		},
		createDate() {
			if (!this.currentMedia.createDate) return '-'

			const date = new Date(this.currentMedia.createDate)
			const year = date.getFullYear()
			const month = date.getMonth() + 1
			const day = date.getDate()
			const hour = date.getHours()
			const minute = date.getMinutes()
			const second = date.getSeconds()

			return `${year}年${month}月${day}日 ${hour}:${minute}:${second}`
		},
		coverImage() {
			return generateCoverURL(this.currentMedia.cover, this.currentMedia.thumbRules?.detailCover)
		},
		storageProviderLabel() {
			const providerMap = {
				'internal': '内置存储',
				'ext-qiniu': '扩展存储'
			}
			return providerMap[this.currentMedia.storageProvider] || (this.currentMedia.storageProvider || '-')
		},
		currentMediaTags() {
			const tags = this.currentMedia.tags || []
			return this.tags.filter(tag => tags.includes(tag._id))
		},
		filteredAvailableTags() {
			const mediaTags = this.currentMedia.tags || []
			const keyword = this.normalizeTagName(this.tagSearchKeyword)
			return this.tags.filter(tag => {
				if (mediaTags.includes(tag._id)) return false
				if (keyword) {
					return this.normalizeTagName(tag.name).includes(keyword)
				}
				return true
			})
		},
		isExistingTag() {
			if (!this.tagSearchKeyword) return false
			const keyword = this.normalizeTagName(this.tagSearchKeyword)
			return this.tags.some(tag => this.normalizeTagName(tag.name) === keyword)
		}
	},
	watch: {
		'currentMedia._id'() {
			this.tagSearchKeyword = ''
		}
	},
	methods: {
		normalizeTagName(name = '') {
			return String(name).trim().toLowerCase()
		},
		copyUrl() {
			const url = /^(cloud|qiniu):\/\//.test(this.currentMedia._src) ? this.currentMedia._src : this.currentMedia.src;
			uni.setClipboardData({
				data: url,
				success: () => {
					uni.showToast({title: '链接已复制', icon: 'none'})
				}
			})
		},
		previewImage() {
			uni.previewImage({
				current: this.currentMedia.src,
				urls: [this.currentMedia.src]
			})
		},
		openCropper() {
			// #ifdef H5
			if (this.currentMedia?.type !== 'image') return
			this.$refs.cropper.open()
			// #endif
		},
		async uploadCroppedImage(payload) {
			// #ifdef H5
			if (this.croppingUploading) return
			if (!payload?.blob || !this.currentMedia?._id) return
			this.croppingUploading = true

			const fileName = payload.fileName || this.getCroppedFileName()
			const mimeType = payload.mimeType || 'image/jpeg'
			const fileType = payload.fileType || this.getFileTypeByMime(mimeType)
			const file = new File([payload.blob], fileName, { type: mimeType })
			const objectUrl = URL.createObjectURL(file)

			uni.showLoading({ title: '正在上传裁剪图', mask: true })
			try {
				const tag = await this.ensureCropUploadTag()
				const uploadedFile = await this.uploadCroppedFile({
					name: fileName,
					type: mimeType,
					fileType: mimeType,
					path: objectUrl,
					size: file.size
				})

				if (!uploadedFile || uploadedFile.status !== 'uploaded') {
					throw uploadedFile?.error || new Error('上传失败')
				}

				await getMediaLibraryCo().report({
					storageProvider: this.storageProvider,
					src: uploadedFile.url,
					cover: uploadedFile.url,
					type: 'image',
					originalName: fileName,
					fileType,
					size: file.size,
					resolution: {
						width: payload.width || uploadedFile.attributes?.width || 0,
						height: payload.height || uploadedFile.attributes?.height || 0
					},
					duration: 0,
					uploadUser: uniCloud.getCurrentUserInfo().uid,
					tags: [tag._id]
				})

				this.$emit('tagsChanged', { type: 'count', tagId: tag._id, delta: 1 })
				this.$emit('cropUploaded')
				this.$refs.cropper && this.$refs.cropper.completeUpload()
				uni.showToast({ title: '裁剪上传成功', icon: 'none' })
			} catch (e) {
				console.error('Upload cropped image failed', e)
				this.$refs.cropper && this.$refs.cropper.failUpload()
				uni.showToast({ title: '裁剪上传失败', icon: 'none' })
			} finally {
				this.croppingUploading = false
				URL.revokeObjectURL(objectUrl)
				uni.hideLoading()
			}
			// #endif
		},
		async ensureCropUploadTag() {
			const normalizedName = this.normalizeTagName(CROP_UPLOAD_TAG_NAME)
			const localTag = this.tags.find(tag => this.normalizeTagName(tag.name) === normalizedName)
			if (localTag) return localTag

			const existingRes = await db.collection('uni-media-tags').where({ name: CROP_UPLOAD_TAG_NAME }).get()
			const existingTag = existingRes.result?.data?.[0]
			if (existingTag) {
				const tag = { ...existingTag, count: existingTag.count || 0 }
				this.$emit('tagsChanged', { type: 'create', tag })
				return tag
			}

			await db.collection('uni-media-tags').add({
				name: CROP_UPLOAD_TAG_NAME,
				createDate: Date.now()
			})
			const tagRes = await db.collection('uni-media-tags').where({ name: CROP_UPLOAD_TAG_NAME }).get()
			const tag = tagRes.result?.data?.[0]
			if (!tag) throw new Error('创建裁剪上传标签失败')

			const newTag = { ...tag, count: 0 }
			this.$emit('tagsChanged', { type: 'create', tag: newTag })
			return newTag
		},
		uploadCroppedFile(file) {
			const provider = this.storageProvider === 'ext-qiniu' ? 'qiniu' : 'internal'
			const uploader = new FromFileUploader({ provider })

			return new Promise(async (resolve, reject) => {
				uploader.on('success', (files) => {
					const file = files && files[0]
					if (!file || file.status !== 'uploaded') {
						reject(file?.error || new Error('上传失败'))
						return
					}
					resolve(file)
				})
				uploader.on('error', (file) => {
					reject(file?.error || new Error('上传失败'))
				})

				try {
					await uploader.add([file])
					await uploader.upload()
				} catch (e) {
					reject(e)
				}
			})
		},
		getCroppedFileName() {
			const name = String(this.currentMedia.originalName || 'image').replace(/\.[^.]+$/, '')
			return `${name}-crop.jpg`
		},
		getFileTypeByMime(mimeType = '') {
			if (mimeType.includes('png')) return 'png'
			if (mimeType.includes('webp')) return 'webp'
			return 'jpg'
		},
		onFiledChange(field) {
			db.collection('uni-media-library').doc(this.currentMedia._id).update({
				[field]: this.currentMedia[field] || ''
			}).catch(err => {
				console.log(err)
				uni.showToast({
					title: '更新失败',
					icon: 'none'
				})
			})
		},
		async createAndAddTag() {
			if (this.creatingTag) return
			const name = this.tagSearchKeyword.trim()
			if (!name) return

			uni.showLoading({ title: '创建中...' })
			try {
				this.creatingTag = true
				const normalizedName = this.normalizeTagName(name)
				if (this.tags.some(tag => this.normalizeTagName(tag.name) === normalizedName)) {
					uni.showToast({ title: '标签名称已存在', icon: 'none' })
					return
				}

				await db.collection('uni-media-tags').add({
					name,
					createDate: Date.now()
				})

				const tagRes = await db.collection('uni-media-tags').where({ name }).get()
				const tag = tagRes.result?.data?.[0]
				if (!tag) {
					uni.showToast({ title: '创建标签失败', icon: 'none' })
					return
				}

				this.$emit('tagsChanged', { type: 'create', tag: { ...tag, count: 0 } })
				uni.hideLoading()
				await this.addTag(tag._id)
			} catch (e) {
				console.error('Failed to create tag', e)
				uni.showToast({ title: '创建标签失败', icon: 'none' })
			} finally {
				this.creatingTag = false
				uni.hideLoading()
			}
		},
		onTagInputConfirm() {
			if (this.filteredAvailableTags.length === 1) {
				this.addTag(this.filteredAvailableTags[0]._id)
			} else if (this.filteredAvailableTags.length === 0 && this.tagSearchKeyword && !this.isExistingTag) {
				this.createAndAddTag()
			}
		},
		async addTag(tagId) {
			if (!this.currentMedia._id || !tagId) return

			uni.showLoading({ title: '添加中...' })
			try {
				const uniMediaLibraryCo = getMediaLibraryCo()
				await uniMediaLibraryCo.addTagToMedia({
					mediaId: this.currentMedia._id,
					tagId
				})

				if (!this.currentMedia.tags) {
					this.$set(this.currentMedia, 'tags', [])
				}
				this.currentMedia.tags.push(tagId)
				this.tagSearchKeyword = ''
				this.$emit('tagsChanged', { type: 'count', tagId, delta: 1 })
			} catch (e) {
				console.error('Failed to add tag', e)
				uni.showToast({ title: '添加标签失败', icon: 'none' })
			} finally {
				uni.hideLoading()
			}
		},
		async removeTag(tagId) {
			if (!this.currentMedia._id || !tagId) return

			uni.showLoading({ title: '移除中...' })
			try {
				const uniMediaLibraryCo = getMediaLibraryCo()
				await uniMediaLibraryCo.removeTagFromMedia({
					mediaId: this.currentMedia._id,
					tagId
				})

				const tags = [...(this.currentMedia.tags || [])]
				const index = tags.indexOf(tagId)
				if (index > -1) {
					tags.splice(index, 1)
				}
				this.$set(this.currentMedia, 'tags', tags)
				this.$emit('tagsChanged', { type: 'count', tagId, delta: -1 })
			} catch (e) {
				console.error('Failed to remove tag', e)
				uni.showToast({ title: '移除标签失败', icon: 'none' })
			} finally {
				uni.hideLoading()
			}
		}
	}
}
</script>

<style lang="scss">
@import "../../font/remixicon.css";
.media-info-wrap {
	width: 100%;
	background-color: #fff;
	box-sizing: border-box;
	border-left: #f0f0f0 solid 1px;
	display: flex;
	flex-direction: column;
	height: 100%;
	flex: 1;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.info-scroll-body {
	flex: 1;
	height: 0;
}

.info-empty {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 10px;
	padding: 24px;
	box-sizing: border-box;
	font-size: 13px;
	color: #8c8c8c;
	text-align: center;
}

.info-content-box {
	padding: 12px;
}

.preview {
	width: 100%;
	overflow: hidden;
	position: relative;
	border-radius: 8px;
	background-color: #fafafa;
	margin-bottom: 16px;
	border: 1px solid rgba(0, 0, 0, 0.04);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);

	&:hover {
		.ops {
			opacity: 1;
			visibility: visible;
		}
	}

	.ops {
		position: absolute;
		top: 10px;
		right: 10px;
		display: flex;
		justify-content: flex-end;
		gap: 10px;
		opacity: 0;
		visibility: hidden;
		transition: opacity .3s;

		.op {
			cursor: pointer;
			width: 32px;
			height: 32px;
			background-color: rgba(255, 255, 255, 0.9);
			backdrop-filter: blur(4px);
			display: flex;
			justify-content: center;
			align-items: center;
			border-radius: 6px;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
			transition: all .2s;

			&:hover {
				background: #fff;
				transform: translateY(-1px);
			}

			.op-icon {
				font-size: 16px;
				line-height: 1;
				color: #333;
			}
		}
	}

	.img {
		width: 100%;
		height: 200px;
		display: block;
	}

	.video {
		height: 200px;

		video {
			width: 100%;
			height: 100%;
			display: block;
		}
	}
}

.quick-url-item {
	margin-bottom: 24px;

	.label {
		font-size: 12px;
		color: #8c8c8c;
		margin-bottom: 6px;
	}

	.url-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #fafafa;
		border: 1px solid rgba(0, 0, 0, 0.04);
		padding: 10px 12px;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;

		&:hover {
			background: #f0f0f0;

			.copy-btn {
				opacity: 1;
			}
		}

		.url-text {
			font-size: 13px;
			color: #262626;
			word-break: break-all;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
			flex: 1;
			padding-right: 12px;
		}

		.copy-btn {
			flex-shrink: 0;
			width: 24px;
			height: 24px;
			display: flex;
			justify-content: center;
			align-items: center;
			border-radius: 4px;
			background: rgba(0, 0, 0, 0.05);
			opacity: 0.7;
			transition: all 0.2s;

			&:hover {
				background: rgba(0, 0, 0, 0.1);
				opacity: 1;
			}
		}
	}
}

.media-base-info {
	display: flex;
	flex-wrap: wrap;
	margin-bottom: 24px;
	background: #fafafa;
	border-radius: 8px;
	padding: 16px;
  margin-top: 12px;

	.info-item {
		width: 50%;
		margin-bottom: 16px;

		//&:last-child, &:nth-last-child(2) {
		//  margin-bottom: 0;
		//}

		.label {
			font-size: 12px;
			color: #8c8c8c;
			margin-bottom: 6px;
		}

		.content {
			font-size: 13px;
			color: #262626;
			word-break: break-all;
		}
	}
}

.edit-section {
	padding-top: 8px;

	.edit-item {
		margin-bottom: 20px;

		.label {
			font-size: 13px;
			color: #595959;
			margin-bottom: 8px;
			font-weight: 600;
		}

		.content {
			font-size: 13px;
			color: #262626;
		}
	}
}

.media-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	align-items: center;
	margin-top: 8px;
}

.tag-chip {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 4px 10px;
	background: #f0f5ff;
	border: 1px solid #adc6ff;
	border-radius: 4px;
	font-size: 12px;
	color: #1677ff;
	height: auto;

	.tag-remove {
		cursor: pointer;
		font-size: 12px;
		opacity: 0.6;
		transition: opacity 0.2s;

		&:hover {
			opacity: 1;
		}
	}
}

.tag-input-wrap {
	position: relative;

	.tag-search-input {
		width: 100%;
	}
}

.tag-dropdown {
	position: absolute;
	left: 0;
	right: 0;
	top: 100%;
	margin-top: 4px;
	max-height: 150px;
	border: 1px solid #e8e8e8;
	border-radius: 6px;
	background: #fff;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	z-index: 10;

	.tag-option {
		padding: 8px 12px;
		cursor: pointer;
		font-size: 13px;
		color: #262626;
		transition: background 0.2s;

		&:hover {
			background: #e6f4ff;
		}

		&.create-option {
			color: #1677ff;
			display: flex;
			align-items: center;
			gap: 4px;
			border-top: 1px solid #f0f0f0;
		}
	}
}

@media screen and (max-width: 1024px) {
	.media-info-wrap {
		border-left: none;
	}
}
</style>
