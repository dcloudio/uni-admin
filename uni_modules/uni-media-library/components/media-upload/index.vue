<template>
	<view
		ref="uploadPage"
		class="upload-page"
		:class="{ 'is-dragging': dragging }"
	>
		<view class="config-section">
			<view class="config-grid" :class="{ single: !showStorageSelector }">
				<view class="config-item" v-if="showStorageSelector">
					<view class="config-label">存储位置</view>
					<radio-group class="config-options" @change="onStorageChange">
						<label
							class="radio-item"
							:class="{ active: currentStorageProvider === opt.value, disabled: opt.disabled }"
							v-for="opt in storageOptions"
							:key="opt.value"
						>
							<radio
								:value="opt.value"
								:checked="currentStorageProvider === opt.value"
								:disabled="opt.disabled"
								color="#1677ff"
							/>
							<text>{{ opt.label }}</text>
						</label>
					</radio-group>
					<view class="storage-help" v-if="extStorageOption && extStorageOption.disabled">
						<view class="storage-help-item">
							<text>扩展存储未在媒体库中启用，如需启用，请参考</text>
							<a class="storage-help-link" href="https://ext.dcloud.net.cn/plugin?id=12694" target="_blank">文档</a>
							<text>开启</text>
						</view>
					</view>
				</view>
				<view class="config-item">
					<view class="config-label">上传类型</view>
					<radio-group class="config-options" @change="onTypeChange">
						<label class="radio-item" :class="{ active: uploadType === opt.value }" v-for="opt in uploadTypeOptions" :key="opt.value">
							<radio :value="opt.value" :checked="uploadType === opt.value" color="#1677ff" />
							<text>{{ opt.label }}</text>
						</label>
					</radio-group>
				</view>
				<view class="config-item tags-config">
					<view class="config-label">标签</view>
					<view class="tag-section">
						<view class="tag-input-wrap">
							<uni-easyinput
								v-model="tagSearchKeyword"
								class="tag-search-input"
								suffixIcon="search"
								placeholder="搜索或创建标签..."
								@confirm="onTagInputConfirm"
							></uni-easyinput>
							<scroll-view scroll-y class="tag-dropdown" v-if="tagSearchKeyword && filteredTags.length > 0">
								<view
									class="tag-option"
									v-for="tag in filteredTags"
									:key="tag._id"
									@click="selectTag(tag._id)"
								>
									<text>{{ tag.name }}</text>
								</view>
							</scroll-view>
							<view class="tag-dropdown" v-if="tagSearchKeyword && filteredTags.length === 0 && !isExistingTag">
								<view class="tag-option create-option" @click="createAndSelectTag">
									<uni-icons type="plus" size="14" color="#1677ff"></uni-icons>
									<text>创建标签「{{ tagSearchKeyword }}」</text>
								</view>
							</view>
						</view>
						<view class="selected-tags" v-if="selectedTagIds.length > 0">
							<view class="tag-chip" v-for="tagId in selectedTagIds" :key="tagId">
								<text>{{ getTagName(tagId) }}</text>
								<uni-icons type="clear" size="14" color="#1677ff" class="tag-remove" @click="deselectTag(tagId)"></uni-icons>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<view class="file-list" v-if="fileList.length > 0">
			<view class="file-list-header">
				<view class="file-list-title">文件列表</view>
				<view class="file-list-badge">{{ fileList.length }}</view>
			</view>
			<view class="file-item" v-for="(item, index) in fileList" :key="item.uploadId || index">
				<view class="file-preview">
					<image v-if="item.type === 'image'" :src="item.thumbUrl" mode="aspectFill" class="file-thumb"></image>
					<view v-else class="file-thumb video-thumb">
						<uni-icons type="videocam" size="24" color="#8c8c8c"></uni-icons>
					</view>
				</view>
				<view class="file-info">
					<view class="file-name">
						{{ item.name }}
						<text v-if="item.isUrlFile" class="source-badge">素材库</text>
					</view>
					<view class="file-meta">
						<text v-if="item.size > 0">{{ formatSize(item.size) }}</text>
						<uni-icons v-if="item.status === 'uploading' && item.isUrlFile" type="spinner-cycle" size="14" color="#1677ff" class="spinner-icon"></uni-icons>
						<text
							class="file-status"
							:class="{
								active: item.status === 'uploading',
								success: item.status === 'uploaded',
								error: item.status === 'failed'
							}"
						>{{ item.tip }}</text>
					</view>
					<view class="file-progress" v-if="item.status === 'uploading' && !item.isUrlFile">
						<view class="progress-bar">
							<view class="progress-inner" :style="{ width: item.percent + '%' }"></view>
						</view>
						<text class="progress-text">{{ item.percent }}%</text>
					</view>
				</view>
				<view class="file-action">
					<uni-icons
						v-if="item.status === 'failed' && !uploading"
						type="refresh"
						size="18"
						color="#1677ff"
						class="retry-btn"
						@click="retryFile(index)"
					></uni-icons>
					<uni-icons
						v-if="!uploading"
						type="trash"
						size="18"
						color="#8c8c8c"
						class="delete-btn"
						@click="removeFile(index)"
					></uni-icons>
				</view>
			</view>
		</view>

		<view class="upload-drag-area" :class="{ active: dragging }" v-else @click="chooseFiles">
			<view class="upload-icon-box">
				<uni-icons type="upload" size="32" color="#1677ff"></uni-icons>
			</view>
			<view class="upload-tip">选择文件</view>
			<view class="upload-sub-tip">支持点击、拖拽或粘贴上传</view>
		</view>

		<view class="action-bar" v-if="fileList.length > 0">
			<view class="action-summary">
				已选择 {{ fileList.length }} 个文件，支持拖拽或粘贴继续添加
			</view>
			<media-button v-if="!uploading && !allDone" type="default" size="small" @click="chooseFiles">继续添加</media-button>
			<media-button v-if="!uploading && !allDone" type="primary" size="small" @click="startUpload">开始上传</media-button>
			<media-button v-if="!uploading && allDone" type="primary" size="small" @click="finish">完成</media-button>
		</view>
	</view>
</template>

<script>
import {FromFileUploader, FromURLUploader} from '../../common/uploader'
import {extnameMap} from '../../common/upload-helper'
import {getMediaLibraryCo} from '../../common/cloud-object'
import MediaButton from '../media-button/index.vue'

const db = uniCloud.database()

export default {
	name: "media-upload",
	components: {
		MediaButton
	},
	emits: ['onUploadSuccess', 'onStorageChange', 'tagsChanged'],
	expose: ['addUrlFiles'],
	props: {
		showStorageSelector: {
			type: Boolean,
			default: false
		},
		currentStorageProvider: {
			type: String,
			default: 'internal'
		},
		mediaTabs: {
			type: Array,
			default: () => []
		},
		tags: {
			type: Array,
			default: () => []
		}
	},
	data() {
		return {
			uploadType: 'all',
			fileList: [],
			uploading: false,
			choosingFiles: false,
			allDone: false,
			selectedTagIds: [],
			tagSearchKeyword: '',
			creatingTag: false,
			dragging: false,
			dragDepth: 0,
			objectUrls: [],
			uploadIdSeed: 0,
			imageLibraryProvider: null,
			storageOptions: [
				{ label: '扩展存储', value: 'ext-qiniu', disabled: true },
				{ label: '内置存储', value: 'internal' }
			],
			typeOptions: [
				{ label: '全部', value: 'all' },
				{ label: '图片', value: 'image' },
				{ label: '视频', value: 'video' }
			]
		}
	},
	computed: {
		filteredTags() {
			const selected = this.selectedTagIds
			const keyword = this.normalizeTagName(this.tagSearchKeyword)
			return this.tags.filter(tag => {
				if (selected.includes(tag._id)) return false
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
		},
		extStorageOption() {
			return this.storageOptions.find(item => item.value === 'ext-qiniu')
		},
		uploadTypeOptions() {
			if (this.allowedUploadMediaTypes.length > 1) {
				return this.typeOptions
			}

			return this.typeOptions.filter(item => this.allowedUploadMediaTypes.includes(item.value))
		},
		allowedUploadMediaTypes() {
			const mediaTypes = ['image', 'video']
			if (!this.mediaTabs.length || this.mediaTabs.includes('all')) {
				return mediaTypes
			}

			return mediaTypes.filter(type => this.mediaTabs.includes(type))
		}
	},
	watch: {
		mediaTabs() {
			this.ensureAllowedUploadType()
		}
	},
	mounted() {
		this.ensureAllowedUploadType()
		this.loadStorageOptions()
		// #ifdef H5
		document.addEventListener('paste', this.onPaste)
		this.bindDragEvents()
		// #endif
	},
	destroyed() {
		// #ifdef H5
		document.removeEventListener('paste', this.onPaste)
		this.unbindDragEvents()
		this.revokeObjectUrls()
		// #endif
	},
	beforeDestroy() {
		// #ifdef H5
		document.removeEventListener('paste', this.onPaste)
		this.unbindDragEvents()
		this.revokeObjectUrls()
		// #endif
	},
	methods: {
		normalizeTagName(name = '') {
			return String(name).trim().toLowerCase()
		},
		getTagName(tagId) {
			const tag = this.tags.find(t => t._id === tagId)
			return tag ? tag.name : tagId
		},
		selectTag(tagId) {
			if (!this.selectedTagIds.includes(tagId)) {
				this.selectedTagIds.push(tagId)
			}
			this.tagSearchKeyword = ''
		},
		deselectTag(tagId) {
			const index = this.selectedTagIds.indexOf(tagId)
			if (index > -1) {
				this.selectedTagIds.splice(index, 1)
			}
		},
		onTagInputConfirm() {
			if (this.filteredTags.length === 1) {
				this.selectTag(this.filteredTags[0]._id)
			} else if (this.filteredTags.length === 0 && this.tagSearchKeyword && !this.isExistingTag) {
				this.createAndSelectTag()
			}
		},
		async createAndSelectTag() {
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
				this.selectTag(tag._id)
			} catch (e) {
				console.error('Failed to create tag', e)
				uni.showToast({ title: '创建标签失败', icon: 'none' })
			} finally {
				this.creatingTag = false
				uni.hideLoading()
			}
		},
		onStorageChange(e) {
			const value = e.detail.value
			const option = this.storageOptions.find(item => item.value === value)
			if (option?.disabled) {
				uni.showToast({ title: option.message || '扩展存储未开通', icon: 'none' })
				this.selectDefaultStorageProvider()
				return
			}
			this.$emit('onStorageChange', value)
		},
		selectDefaultStorageProvider() {
			const option = this.storageOptions.find(item => !item.disabled)
			if (option && option.value !== this.currentStorageProvider) {
				this.$emit('onStorageChange', option.value)
			}
		},
		async loadStorageOptions() {
			if (!this.showStorageSelector) return

			try {
				const res = await getMediaLibraryCo().getStorageConfig()
				const options = (res.data || []).map(item => ({
					label: item.name,
					value: item.provider,
					disabled: item.provider !== 'internal' && item.isOpen === false,
					message: item.message
				}))
				const order = ['ext-qiniu', 'internal']
				this.storageOptions = options.sort((a, b) => {
					const aIndex = order.indexOf(a.value)
					const bIndex = order.indexOf(b.value)
					return (aIndex === -1 ? order.length : aIndex) - (bIndex === -1 ? order.length : bIndex)
				})

				this.selectDefaultStorageProvider()
			} catch (e) {
				console.error('Failed to load storage options', e)
				this.storageOptions = [
					{ label: '内置存储', value: 'internal' }
				]
				this.$emit('onStorageChange', 'internal')
			}
		},
		onTypeChange(e) {
			const value = e.detail.value
			if (!this.uploadTypeOptions.some(item => item.value === value)) {
				this.ensureAllowedUploadType()
				return
			}
			this.uploadType = value
		},
		ensureAllowedUploadType() {
			if (this.uploadTypeOptions.some(item => item.value === this.uploadType)) return
			this.uploadType = this.uploadTypeOptions[0]?.value || 'all'
		},
		chooseFiles() {
			if (this.choosingFiles) return
			this.choosingFiles = true

			try {
				const uploader = new FromFileUploader()

				const options = {
					type: this.uploadType,
					extension: extnameMap[this.uploadType]
				}

				const choosePromise = this.uploadType === 'image'
					? uploader.chooseImage(options)
					: this.uploadType === 'video'
						? uploader.chooseVideo(options)
						: uploader.chooseAll(options)

				choosePromise.then(files => {
					this.addFiles(files)
				}).catch(e => {
					console.error('Choose file failed', e)
				}).then(() => {
					this.choosingFiles = false
				})
			} catch (e) {
				console.error('Choose file failed', e)
				this.choosingFiles = false
			}
		},
		removeFile(index) {
			const item = this.fileList[index]
			if (item?.objectUrl) {
				this.revokeObjectUrl(item.objectUrl)
			}
			this.fileList.splice(index, 1)
			this.syncUploadDoneState()
		},
		async retryFile(index) {
			if (this.uploading) return
			const item = this.fileList[index]
			if (!item || item.status !== 'failed') return
			item.status = 'waiting'
			item.percent = 0
			item.tip = '等待上传'
			item.uploadFinished = false
			this.syncUploadDoneState()
			await this.uploadItems([item])
		},
		addFiles(files = []) {
			if (this.uploading) return

			const normalizedFiles = Array.from(files).map(file => this.normalizeInputFile(file)).filter(Boolean)
			const allowFiles = normalizedFiles.filter(file => this.isAllowedFile(file))
			normalizedFiles
				.filter(file => !allowFiles.includes(file) && file.objectUrl)
				.forEach(file => this.revokeObjectUrl(file.objectUrl))

			if (!allowFiles.length) {
				if (normalizedFiles.length) {
					uni.showToast({ title: '未找到符合当前类型的文件', icon: 'none' })
				}
				return
			}

			const newItems = allowFiles.map(file => {
				const mediaType = this.getFileMediaType(file)
				const uploadId = this.createUploadId()
				file.uploadId = uploadId
				return {
					uploadId,
					file,
					name: file.name || file.path?.split('/').pop() || 'unknown',
					size: file.size || 0,
					type: mediaType,
					thumbUrl: file.path || file.tempFilePath || '',
					objectUrl: file.objectUrl,
					status: 'waiting',
					percent: 0,
					tip: '等待上传',
					uploadFinished: false
				}
			})

			this.fileList = this.fileList.concat(newItems)
			this.allDone = false
		},
		addUrlFiles(images = [], provider = '') {
			if (this.uploading || !images.length) return
			if (!this.allowedUploadMediaTypes.includes('image')) {
				uni.showToast({ title: '当前仅支持上传视频资源', icon: 'none' })
				return
			}

			this.imageLibraryProvider = provider
			// 清空已有列表，从免费素材库添加时重新开始
			this.fileList = []
			const newItems = images.map(img => {
				const uploadId = this.createUploadId()
				return {
					uploadId,
					file: {
						id: img.id,
						uploadId,
						name: img.originalName || img.name || 'unknown',
						url: img.url,
						thumbUrl: img.thumbUrl || img.url,
						mediaType: 'image'
					},
					name: img.originalName || img.name || 'unknown',
					size: 0,
					type: 'image',
					thumbUrl: img.thumbUrl || img.url,
					status: 'waiting',
					percent: 0,
					tip: '等待上传',
					uploadFinished: false,
					isUrlFile: true
				}
			})
			this.fileList = newItems
			this.allDone = false
		},
		createUploadId() {
			this.uploadIdSeed += 1
			return `upload-${Date.now()}-${this.uploadIdSeed}`
		},
		normalizeInputFile(file) {
			if (!file) return null

			// #ifdef H5
			if (typeof File !== 'undefined' && file instanceof File) {
				const path = URL.createObjectURL(file)
				const name = file.name || this.createClipboardFileName(file.type)
				const normalized = {
					name,
					type: file.type,
					fileType: file.type,
					path,
					size: file.size,
					objectUrl: path,
					rawFile: file
				}
				this.objectUrls.push(path)
				return normalized
			}
			// #endif

			return file
		},
		isAllowedFile(file) {
			const mediaType = this.getFileMediaType(file)
			const fileName = file.name || file.path || ''
			const ext = fileName.includes('.') ? `.${fileName.split('.').pop().toLowerCase()}` : ''

			if (mediaType && !this.allowedUploadMediaTypes.includes(mediaType)) {
				return false
			}

			if (this.uploadType !== 'all' && mediaType && mediaType !== this.uploadType) {
				return false
			}

			if (this.uploadType !== 'all' && !mediaType && ext) {
				return this.allowedUploadMediaTypes.includes(this.uploadType) && extnameMap[this.uploadType].includes(ext)
			}

			if (mediaType) {
				return ['image', 'video'].includes(mediaType)
			}

			return this.allowedUploadMediaTypes.some(type => extnameMap[type].includes(ext))
		},
		getFileMediaType(file) {
			const [mediaType = ''] = (file.type || file.fileType || file.mediaType || '').split('/')
			if (['image', 'video'].includes(mediaType)) return mediaType

			const fileName = file.name || file.path || ''
			const ext = fileName.includes('.') ? `.${fileName.split('.').pop().toLowerCase()}` : ''
			if (extnameMap.image.includes(ext)) return 'image'
			if (extnameMap.video.includes(ext)) return 'video'

			if (file.duration) return 'video'
			return ''
		},
		createClipboardFileName(type = '') {
			const extMap = {
				'image/jpeg': 'jpg',
				'image/png': 'png',
				'image/gif': 'gif',
				'image/webp': 'webp',
				'video/mp4': 'mp4',
				'video/quicktime': 'mov'
			}
			const ext = extMap[type] || (type.split('/')[1] || 'file')
			return `clipboard-${Date.now()}.${ext}`
		},
		bindDragEvents() {
			// #ifdef H5
			this.dragTarget = this.getDragTarget()
			if (!this.dragTarget) return

			this.dragTarget.addEventListener('dragenter', this.onDragEnter)
			this.dragTarget.addEventListener('dragover', this.onDragOver)
			this.dragTarget.addEventListener('dragleave', this.onDragLeave)
			this.dragTarget.addEventListener('drop', this.onDrop)
			document.addEventListener('dragover', this.preventDocumentDrop)
			document.addEventListener('drop', this.onDocumentDrop)
			// #endif
		},
		unbindDragEvents() {
			// #ifdef H5
			if (this.dragTarget) {
				this.dragTarget.removeEventListener('dragenter', this.onDragEnter)
				this.dragTarget.removeEventListener('dragover', this.onDragOver)
				this.dragTarget.removeEventListener('dragleave', this.onDragLeave)
				this.dragTarget.removeEventListener('drop', this.onDrop)
				this.dragTarget = null
			}
			document.removeEventListener('dragover', this.preventDocumentDrop)
			document.removeEventListener('drop', this.onDocumentDrop)
			// #endif
		},
		getDragTarget() {
			// #ifdef H5
			const ref = this.$refs.uploadPage
			return ref?.$el || ref || this.$el
			// #endif
			// #ifndef H5
			return null
			// #endif
		},
		preventDocumentDrop(e) {
			const types = Array.from(e.dataTransfer?.types || [])
			if (!types.includes('Files')) return
			e.preventDefault()
		},
		onDocumentDrop(e) {
			const types = Array.from(e.dataTransfer?.types || [])
			if (!types.includes('Files')) return
			e.preventDefault()

			if (e._mediaUploadHandled) return
			if (this.dragTarget && this.dragTarget.contains(e.target)) {
				this.onDrop(e)
				return
			}
			this.dragDepth = 0
			this.dragging = false
		},
		onDragEnter(e) {
			e?.preventDefault()
			if (this.uploading) return
			this.dragDepth += 1
			this.dragging = true
		},
		onDragOver(e) {
			e?.preventDefault()
			if (this.uploading) return
			if (e?.dataTransfer) {
				e.dataTransfer.dropEffect = 'copy'
			}
			this.dragging = true
		},
		onDragLeave(e) {
			e?.preventDefault()
			this.dragDepth = Math.max(this.dragDepth - 1, 0)
			if (this.dragDepth === 0) {
				this.dragging = false
			}
		},
		onDrop(e) {
			if (e) {
				e._mediaUploadHandled = true
			}
			e?.preventDefault()
			if (this.uploading) return
			this.dragDepth = 0
			this.dragging = false
			const files = e.dataTransfer?.files || []
			this.addFiles(files)
		},
		onPaste(e) {
			if (this.uploading) return

			const files = []
			const items = e.clipboardData?.items || []
			for (let i = 0; i < items.length; i++) {
				const item = items[i]
				if (item.kind === 'file') {
					const file = item.getAsFile()
					if (file) files.push(file)
				}
			}

			if (!files.length && e.clipboardData?.files?.length) {
				files.push(...Array.from(e.clipboardData.files))
			}

			if (files.length) {
				e.preventDefault()
				this.addFiles(files)
			}
		},
		revokeObjectUrl(url) {
			// #ifdef H5
			if (!url) return
			URL.revokeObjectURL(url)
			this.objectUrls = this.objectUrls.filter(item => item !== url)
			// #endif
		},
		revokeObjectUrls() {
			// #ifdef H5
			this.objectUrls.forEach(url => URL.revokeObjectURL(url))
			this.objectUrls = []
			// #endif
		},
		formatSize(size) {
			if (!size) return '0 B'
			if (size < 1024) return size + ' B'
			if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
			if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(1) + ' MB'
			return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB'
		},
		async startUpload() {
			if (this.uploading || this.fileList.length === 0) return
			const uploadItems = this.fileList.filter(item => item.status !== 'uploaded')
			if (!uploadItems.length) {
				this.syncUploadDoneState()
				return
			}

			await this.uploadItems(uploadItems)
		},
		async uploadItems(uploadItems) {
			if (this.uploading || !uploadItems.length) return

			this.uploading = true
			this.allDone = false
			const localItems = uploadItems.filter(item => !item.isUrlFile)
			const urlItems = uploadItems.filter(item => item.isUrlFile)

			try {
				if (localItems.length > 0) {
					await this.uploadLocalFiles(localItems)
				}
				if (urlItems.length > 0) {
					await this.uploadUrlFiles(urlItems)
				}
			} catch (e) {
				console.error('Upload failed', e)
			} finally {
				this.uploading = false
				this.syncUploadDoneState()
			}
		},
		syncUploadDoneState() {
			this.allDone = this.fileList.length > 0 && this.fileList.every(item => item.status === 'uploaded')
		},
		async uploadLocalFiles(items) {
			const provider = this.currentStorageProvider === 'ext-qiniu' ? 'qiniu' : 'internal'
			const uploader = new FromFileUploader({ provider })

			uploader.on('progress', (file) => {
				const item = this.findUploadItem(items, file)
				if (item) {
					this.applyUploadProgress(item, file, {
						uploading: '正在上传',
						uploaded: '正在保存到媒体库'
					})
				}
			})

			uploader.on('success', async (files) => {
				await this.reportUploadedFiles(files, items)
			})

			uploader.on('error', (file) => {
				const item = this.findUploadItem(items, file)
				if (item) {
					item.status = 'failed'
					item.tip = '上传失败'
				}
			})

			const rawFiles = items.map(f => f.file)
			await uploader.add(rawFiles)
			await uploader.upload()
		},
		async uploadUrlFiles(items) {
			const provider = this.currentStorageProvider === 'ext-qiniu' ? 'qiniu' : 'internal'
			const uploader = new FromURLUploader({
				provider,
				imageLibraryProvider: this.imageLibraryProvider
			})

			uploader.on('progress', (file) => {
				const item = this.findUploadItem(items, file)
				if (item) {
					this.applyUploadProgress(item, file, {
						uploading: '正在下载',
						uploaded: '下载完成，等待上传'
					})
				}
			})

			uploader.on('success', async (files) => {
				await this.reportUploadedFiles(files, items)
			})

			uploader.on('error', (file) => {
				const item = this.findUploadItem(items, file)
				if (item) {
					item.status = 'failed'
					item.tip = '上传失败'
				}
			})

			const rawFiles = items.map(f => f.file)
			await uploader.add(rawFiles)
			await uploader.cloudUpload()
		},
		async reportUploadedFiles(files, items) {
			const uniMediaLibraryCo = getMediaLibraryCo()
			let uploadedCount = 0
			for (const file of files) {
				const item = this.findUploadItem(items, file)
				if (!item) continue

				if (file.status === 'uploaded') {
					item.tip = '正在保存到媒体库'
					const attrs = {
						...(file.attributes || {})
					}
					if (!attrs.cover && item.type === 'image') {
						attrs.cover = file.url
					}

					try {
						await uniMediaLibraryCo.report({
							storageProvider: this.currentStorageProvider,
							src: file.url,
							type: item.type,
							originalName: item.name,
							fileType: this.getFileType(item),
							size: item.size,
							resolution: {
								width: attrs.width || 0,
								height: attrs.height || 0
							},
							duration: attrs.duration || 0,
							uploadUser: uniCloud.getCurrentUserInfo().uid,
							tags: this.selectedTagIds,
							...attrs
						})
						item.status = 'uploaded'
						item.percent = 100
						item.tip = '上传成功'
						item.uploadFinished = true
						uploadedCount++
					} catch (e) {
						console.error('Report failed', e)
						item.status = 'failed'
						item.tip = '保存到媒体库失败'
					}
				} else {
					item.status = 'failed'
					item.tip = '上传失败'
				}
			}
			if (uploadedCount > 0 && this.selectedTagIds.length) {
				this.$emit('tagsChanged', { type: 'count', tagIds: this.selectedTagIds, delta: uploadedCount })
			}
		},
		findUploadItem(items, file) {
			if (file.uploadId) {
				const item = items.find(f => f.uploadId === file.uploadId || f.file.uploadId === file.uploadId)
				if (item) return item
			}

			return items.find(f =>
				f.file.originUrl === file.originUrl ||
				f.file.path === file.originUrl ||
				f.file.id === file.id ||
				f.file.url === file.originUrl
			)
		},
		applyUploadProgress(item, file, tips = {}) {
			if (item.uploadFinished) return

			item.status = file.status
			item.percent = file.percent
			item.tip = tips[file.status] || item.tip
		},
		finish() {
			this.$emit('onUploadSuccess')
		},
		getFileType(item) {
			const fileType = item.file.fileType || item.file.type || ''
			if (fileType.includes('/')) {
				return fileType.split('/').pop()
			}
			return fileType || item.name.split('.').pop()
		}
	}
}
</script>

<style lang="scss">
.upload-page {
	padding: 16px;
	height: 100%;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	background: #fff;

	&.is-dragging {
		.upload-drag-area,
		.file-list {
			border-color: #1677ff;
			background: #f0f5ff;
		}
	}
}

.config-section {
	background: #fafafa;
	border: 1px solid #f0f0f0;
	border-radius: 8px;
	padding: 16px;
	margin-bottom: 16px;
	flex-shrink: 0;
}

.config-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 16px 20px;

	&.single {
		grid-template-columns: 1fr;
	}
}

.config-item {
	.config-label {
		font-size: 13px;
		font-weight: 600;
		color: #595959;
		margin-bottom: 10px;
	}

	&.tags-config {
		grid-column: 1 / -1;
	}
}

.config-options {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;

	.radio-item {
		display: flex;
		align-items: center;
		gap: 4px;
		min-height: 34px;
		padding: 0 10px 0 6px;
		box-sizing: border-box;
		border: 1px solid #d9d9d9;
		border-radius: 6px;
		background: #fff;
		font-size: 13px;
		color: #595959;
		cursor: pointer;
		transition: border-color 0.2s, background-color 0.2s, color 0.2s;

		&:hover {
			border-color: #1677ff;
			color: #1677ff;
		}

		&.active {
			border-color: #1677ff;
			background: #f0f5ff;
			color: #1677ff;
		}

		&.disabled {
			cursor: not-allowed;
			color: #bfbfbf;
			background: #f5f5f5;
			border-color: #e8e8e8;
		}

		radio {
			transform: scale(0.82);
		}
	}
}

.storage-help {
	margin-top: 10px;
	padding-left: 2px;
	display: flex;
	flex-direction: column;
	gap: 4px;
	font-size: 12px;
	line-height: 1.5;
	color: #8c8c8c;
}

.storage-help-item {
	display: flex;
	align-items: flex-start;
	gap: 6px;
}

.storage-help-name {
	flex: 0 0 auto;
	color: #595959;
	font-weight: 500;
}

.storage-help-link {
	color: #1677ff;
	cursor: pointer;
	text-decoration: none;
}

.tag-section {
	display: flex;
	flex-direction: column;
	gap: 10px;
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
	margin-top: 6px;
	max-height: 180px;
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

.selected-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.tag-chip {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	height: 26px;
	padding: 0 9px;
	background: #f0f5ff;
	border: 1px solid #adc6ff;
	border-radius: 4px;
	font-size: 12px;
	color: #1677ff;

	.tag-remove {
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.2s;

		&:hover {
			opacity: 1;
		}
	}
}

.file-list {
	flex: 1;
	overflow-y: auto;
	margin-bottom: 16px;
	min-height: 0;
	padding: 0;
	border: 1px solid #f0f0f0;
	border-radius: 8px;
	background: #fff;
	transition: border-color 0.2s, background-color 0.2s;
}

.file-list-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	padding: 12px 14px;
	border-bottom: 1px solid #f0f0f0;
	background: #fafafa;
}

.file-list-title {
	font-size: 14px;
	font-weight: 600;
	color: #262626;
	line-height: 20px;
}

.file-list-badge {
	min-width: 24px;
	height: 22px;
	padding: 0 7px;
	border-radius: 11px;
	background: #f5f5f5;
	color: #8c8c8c;
	font-size: 12px;
	line-height: 22px;
	text-align: center;
	box-sizing: border-box;
}

.file-item {
	display: flex;
	align-items: center;
	min-height: 76px;
	padding: 10px 14px;
	border-bottom: 1px solid #f0f0f0;
	background: #fff;
	transition: background-color 0.2s;

	&:hover {
		background: #fafafa;
	}

	&:last-child {
		border-bottom: none;
	}
}

.file-preview {
	flex-shrink: 0;
	margin-right: 12px;
}

.file-thumb {
	width: 56px;
	height: 56px;
	border-radius: 6px;
	object-fit: cover;
	background: #f5f5f5;
	display: block;
	border: 1px solid #f0f0f0;
	box-sizing: border-box;
}

.video-thumb {
	display: flex;
	align-items: center;
	justify-content: center;
}

.file-info {
	flex: 1;
	min-width: 0;
}

.file-name {
	font-size: 13px;
	font-weight: 500;
	color: #262626;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	display: flex;
	align-items: center;
	gap: 6px;
}

.source-badge {
	font-size: 11px;
	font-weight: 500;
	color: #722ed1;
	background: #f9f0ff;
	border: 1px solid #d3adf7;
	border-radius: 3px;
	padding: 0 5px;
	line-height: 18px;
	flex-shrink: 0;
}

.file-meta {
	display: flex;
	align-items: center;
	gap: 5px;
	margin-top: 4px;
	font-size: 12px;
	color: #8c8c8c;

	.file-status {
		color: #8c8c8c;
		font-weight: 500;

		&.active {
			color: #1677ff;
		}

		&.success {
			color: #16a34a;
		}

		&.error {
			color: #dc2626;
		}
	}
}

.file-progress {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-top: 6px;
}

.progress-bar {
	flex: 1;
	height: 5px;
	border-radius: 999px;
	background: #f0f0f0;
	overflow: hidden;

	.progress-inner {
		height: 100%;
		border-radius: 999px;
		background: #1677ff;
		transition: width 0.3s;
	}
}

.progress-text {
	font-size: 12px;
	color: #1677ff;
	flex-shrink: 0;
	width: 36px;
	text-align: right;
}

.spinner-icon {
	animation: rotate 1s linear infinite;
}

@keyframes rotate {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}

.file-action {
	flex-shrink: 0;
	margin-left: 12px;
	display: flex;
	gap: 8px;

	.retry-btn,
	.delete-btn {
		cursor: pointer;
		transition: color 0.2s;
	}

	.retry-btn:hover {
		color: #0958d9 !important;
	}

	.delete-btn:hover {
		color: #ff4d4f !important;
	}
}

.upload-drag-area {
	flex: 1;
	min-height: 280px;
	border: 1px dashed #d9d9d9;
	background: #fafafa;
	border-radius: 8px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: border-color 0.2s, background-color 0.2s;

	&:hover,
	&.active {
		border-color: #1677ff;
		background: #f0f5ff;
	}

	.upload-icon-box {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 56px;
		border: 1px solid #adc6ff;
		border-radius: 8px;
		background: #fff;
	}

	.upload-tip {
		font-size: 16px;
		color: #262626;
		margin-top: 14px;
		font-weight: 600;
	}

	.upload-sub-tip {
		font-size: 13px;
		color: #8c8c8c;
		margin-top: 8px;
	}
}

.action-bar {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 10px;
	padding-top: 16px;
	border-top: 1px solid #f0f0f0;
	flex-shrink: 0;
}

.action-summary {
	margin-right: auto;
	font-size: 12px;
	color: #8c8c8c;
}

@media screen and (max-width: 760px) {
	.upload-page {
		padding: 16px;
	}

	.config-grid {
		grid-template-columns: 1fr;
	}

	.file-list-header {
		align-items: flex-start;
	}

	.action-bar {
		flex-wrap: wrap;
	}

	.action-summary {
		width: 100%;
	}
}
</style>
