<template>
	<view class="media-library-warp">
		<view class="sidebar" v-show="showSidebar">
			<view class="sidebar-header">
				<view class="sidebar-title">媒体库</view>
				<view class="toggle-sidebar-btn" @click="toggleSidebar">
					<text class="ri-side-bar-line sidebar-toggle-icon"></text>
				</view>
			</view>
			<scroll-view scroll-y class="sidebar-menu">
				<!-- Media Group -->
				<view class="menu-group">
					<view
						class="menu-item"
						v-for="tab in tabs"
						:key="tab.key"
						:class="{active: currentMenu === 'media' && currentTab === tab.key}"
						@click="selectMenu('media', tab.key)"
					>
						<text :class="getTabIcon(tab.key)" class="menu-icon"></text>
						<text>{{ tab.label }}</text>
					</view>
				</view>

				<!-- Upload & Free Media -->
				<view class="menu-group">
					<view class="menu-item" :class="{active: currentMenu === 'upload'}" @click="selectMenu('upload')">
						<text class="ri-upload-cloud-line menu-icon"></text>
						<text>上传</text>
					</view>

					<template v-if="hasFreeProviders">
						<view class="menu-item" @click="toggleFreeMedia">
							<text class="ri-multi-image-fill menu-icon"></text>
							<text>免费素材库</text>
							<text :class="showFreeMedia ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'" class="menu-arrow"></text>
						</view>
						<view class="sub-menu-list" v-show="showFreeMedia">
							<view
								class="menu-item sub-item"
								v-for="providerItem in freeProviders"
								:key="providerItem.provider"
								:class="{active: currentMenu === 'free-media' && currentProvider === providerItem.provider}"
								@click="selectFreeMenu(providerItem)"
							>
								<image-library-logos :provider="providerItem.provider" style="width:16px;height:16px;margin-right:8px;" />
								<text>{{ providerItem.name }}</text>
							</view>
						</view>
					</template>
				</view>

				<!-- Tags -->
				<view class="menu-group tags-group">
					<view class="group-title">
						<text>标签</text>
						<view class="group-title-actions">
							<uni-icons v-if="tagsLoading" class="tag-loading-icon" type="spinner-cycle" size="14" color="#8c8c8c"></uni-icons>
							<text v-if="currentTagId" class="ri-close-circle-line clear-tag-icon" @click="clearTagFilter"></text>
							<text class="ri-add-line add-tag-icon" @click="showQuickAddTag = !showQuickAddTag"></text>
						</view>
					</view>
					<view class="quick-add-tag" v-if="showQuickAddTag">
						<uni-easyinput
							v-model="quickTagName"
							class="quick-tag-input"
							placeholder="标签名称..."
							@confirm="addQuickTag"
						></uni-easyinput>
						<text class="ri-check-line quick-tag-confirm" @click="addQuickTag"></text>
					</view>
					<view
						class="menu-item sub-item"
						v-for="tag in tagsList"
						:key="tag._id"
						:class="{active: currentTagId === tag._id}"
						@click="selectTag(tag)"
					>
						<text class="tag-name-text">{{ tag.name }}</text>
						<text class="tag-count">{{ tag.count || 0 }}</text>
					</view>
					<view class="tag-empty" v-if="!tagsLoading && !tagsList.length && !showQuickAddTag">
						<text>暂无标签</text>
					</view>
					<view v-if="tagsList.length" class="menu-item sub-item" :class="{active: currentMenu === 'tags'}" @click="selectMenu('tags')">
						<text class="ri-list-settings-line menu-icon"></text>
						<text>管理标签...</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<view class="main-content">
			<view class="content-body">
				<template v-if="currentMenu === 'media'">
					<media-panel
						:key="currentTab"
						ref="mediaPanel"
						:media-type="currentTab"
						:tag-filter="currentTagId"
						:tags="tagsList"
						:selected-count="selectedCount"
						:storage-provider="currentStorageProvider"
						@onUploadMedia="selectMenu('upload')"
						@tagsChanged="onTagsChanged"
					>
						<template #header>
							<view class="top-nav">
								<view v-if="!showSidebar" class="toggle-sidebar-btn" @click="toggleSidebar">
									<text class="ri-side-bar-line sidebar-toggle-icon"></text>
								</view>
								<view class="nav-title">{{ currentTabLabel }}</view>
								<view v-if="currentTagId" class="active-tag-filter">
									<text>{{ currentTagName }}</text>
									<uni-icons type="clear" size="14" color="#1677ff" @click="clearTagFilter" class="clear-btn"></uni-icons>
								</view>
								<view style="flex:1"></view>
								<view class="external-options" v-if="mode === 'picker'">
									<media-button type="primary" size="small" @click="insertMedia">插入媒体</media-button>
								</view>
							</view>
						</template>
					</media-panel>
				</template>

				<template v-else-if="currentMenu === 'free-media'">
						<view class="other-view-wrapper">
							<view class="top-nav">
							<view v-if="!showSidebar" class="toggle-sidebar-btn" @click="toggleSidebar">
								<text class="ri-side-bar-line sidebar-toggle-icon"></text>
							</view>
							<view class="provider-desc">
								<text class="ri-multi-image-fill provider-icon"></text>
								<text class="provider-label">素材来源</text>
								<a v-if="providerWebsite" class="provider-link uni-link" :href="providerWebsite" target="_blank">{{ providerName }}</a>
								<text v-else class="provider-link">{{ providerName }}</text>
							</view>
						</view>
						<view class="other-view-content">
							<image-library-panel :provider="currentProvider" @onCopyToMediaLibrary="onCopyToMediaLibrary"></image-library-panel>
						</view>
					</view>
				</template>

				<template v-else-if="currentMenu === 'upload'">
						<view class="other-view-wrapper">
							<view class="top-nav">
							<view v-if="!showSidebar" class="toggle-sidebar-btn" @click="toggleSidebar">
								<text class="ri-side-bar-line sidebar-toggle-icon"></text>
							</view>
							<view class="nav-title">上传</view>
						</view>
						<view class="other-view-content">
							<media-upload
								ref="mediaUpload"
								:show-storage-selector="true"
								:current-storage-provider="currentStorageProvider"
								:media-tabs="mediaTabs"
								:tags="tagsList"
								@onStorageChange="onStorageBucketChange"
								@onUploadSuccess="onUploadSuccess"
								@tagsChanged="onTagsChanged"
							></media-upload>
						</view>
					</view>
				</template>

				<template v-else-if="currentMenu === 'tags'">
						<view class="other-view-wrapper">
							<view class="top-nav">
							<view v-if="!showSidebar" class="toggle-sidebar-btn" @click="toggleSidebar">
								<text class="ri-side-bar-line sidebar-toggle-icon"></text>
							</view>
							<view class="nav-title">管理标签</view>
						</view>
						<view class="other-view-content">
							<media-tag-panel :tags="tagsList" :loading="tagsLoading" @tagsChanged="onTagsChanged"></media-tag-panel>
						</view>
					</view>
				</template>
			</view>
		</view>
	</view>
</template>

<script>
import MediaPanel from "../media-panel"
import ImageLibraryPanel from "../image-library-panel";
import ImageLibraryLogos from '../image-library-logos'
import MediaUpload from "../media-upload/index.vue";
import MediaButton from "../media-button/index.vue";
import MediaTagPanel from "../media-tag-panel/index.vue";
import {getMediaLibraryCo} from "../../common/cloud-object";

const tabs = [{key: "all", label: "全部媒体"}, {key: "image", label: "图片"}, {key: "video", label: "视频"}]

const db = uniCloud.database()

export default {
	name: "uni-media-library",
	emits: ['onInsert'],
	props: {
		mode: { type: String, default: () => "manager" },
		mediaTabs: { type: Array, default: () => [] },
		selectedCount: { type: Number, default: () => 0 }
	},
	components: {
		MediaPanel,
		ImageLibraryPanel,
		MediaUpload,
		ImageLibraryLogos,
		MediaButton,
		MediaTagPanel
	},
	data() {
		return {
			currentMenu: "media",
			currentTab: "all",
			currentProvider: "internal",
			currentStorageProvider: "internal",

			freeProviders: [],
			showFreeMedia: true,
			showSidebar: true,

			currentTagId: null,
			showQuickAddTag: false,
			quickTagName: '',
			creatingTag: false,
			tagsLoading: false,
			tagsList: []
		}
	},
	computed: {
		tabs() { return this.mediaTabs.length > 0 ? tabs.filter(tab => this.mediaTabs.includes(tab.key)) : tabs },
		providerWebsite () { const p = this.freeProviders.find(item => item.provider === this.currentProvider); return p ? p.website : '' },
		providerName () { const p = this.freeProviders.find(item => item.provider === this.currentProvider); return p ? p.name : '' },
		currentTabLabel() { const t = this.tabs.find(tab => tab.key === this.currentTab); return t ? t.label : '媒体资源' },
		currentTagName() { const t = this.tagsList.find(tag => tag._id === this.currentTagId); return t ? t.name : '' },
		hasFreeProviders() { return this.freeProviders.length > 0 }
	},
	watch: {
		mediaTabs() {
			this.ensureAllowedTab()
		}
	},
	created() {
		this.ensureAllowedTab()
		this.loadFreeImageLibraryProviders()
		this.loadAllTags()

		const savedSidebar = uni.getStorageSync('umi_media_library_sidebar')
		if (savedSidebar !== '') {
			this.showSidebar = savedSidebar
		}
	},
	methods: {
		normalizeTagName(name = '') {
			return String(name).trim().toLowerCase()
		},
		getTabIcon(tab) {
			const iconMap = {
				all: 'ri-gallery-line',
				image: 'ri-image-line',
				video: 'ri-video-line'
			}
			return iconMap[tab] || 'ri-gallery-line'
		},
		ensureAllowedTab() {
			if (this.tabs.some(tab => tab.key === this.currentTab)) return
			this.currentTab = this.tabs[0]?.key || 'all'
		},
		toggleSidebar() {
			this.showSidebar = !this.showSidebar
			uni.setStorageSync('umi_media_library_sidebar', this.showSidebar)
		},
		selectMenu(menu, tab = '') {
			this.currentMenu = menu
			if (menu === 'media' && tab) {
				if (!this.tabs.some(item => item.key === tab)) return
				this.currentTab = tab
			} else if (menu !== 'media') {
				this.currentTagId = null
			}
		},
		toggleFreeMedia() {
			this.showFreeMedia = !this.showFreeMedia
		},
		selectFreeMenu(providerItem) {
			this.currentMenu = 'free-media'
			this.currentProvider = providerItem.provider
			this.currentTagId = null
		},
		async loadFreeImageLibraryProviders () {
			try {
				const uniMediaLibraryCo = getMediaLibraryCo()
				const result = await uniMediaLibraryCo.getImageLibraryProviders()
				this.freeProviders = result.data.filter(p => p.provider !== 'internal')
				if (!this.hasFreeProviders && this.currentMenu === 'free-media') {
					this.selectMenu('media', this.currentTab)
				}
			} catch (e) {
				console.error('Failed to load free media providers', e)
				this.freeProviders = []
				if (this.currentMenu === 'free-media') {
					this.selectMenu('media', this.currentTab)
				}
			}
		},
		async loadAllTags() {
			this.tagsLoading = true
			try {
				const uniMediaLibraryCo = getMediaLibraryCo()
				const res = await uniMediaLibraryCo.getTags()
				this.tagsList = res.data || []
			} catch (e) {
				console.error('Failed to load tags', e)
			} finally {
				this.tagsLoading = false
			}
		},
		selectTag(tag) {
			this.currentMenu = 'media'
			this.ensureAllowedTab()
			if (this.currentTagId === tag._id) {
				this.currentTagId = null
			} else {
				this.currentTagId = tag._id
			}
		},
		clearTagFilter() {
			this.currentTagId = null
		},
		async addQuickTag() {
			if (this.creatingTag) return
			const name = this.quickTagName.trim()
			if (!name) {
				uni.showToast({ title: '标签名称不能为空', icon: 'none' })
				return
			}

			try {
				this.creatingTag = true
				const normalizedName = this.normalizeTagName(name)
				if (this.tagsList.some(tag => this.normalizeTagName(tag.name) === normalizedName)) {
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

				this.quickTagName = ''
				this.showQuickAddTag = false
				this.onTagsChanged({ type: 'create', tag: { ...tag, count: 0 } })
			} catch (e) {
				console.error('Failed to create tag', e)
				uni.showToast({ title: '创建标签失败', icon: 'none' })
			} finally {
				this.creatingTag = false
			}
		},
		onTagsChanged(change = {}) {
			const syncTags = (updater) => {
				const next = updater([...(this.tagsList || [])])
				this.tagsList = next
			}

			if (change.type === 'create' && change.tag) {
				syncTags(tags => {
					if (tags.some(tag => tag._id === change.tag._id)) return tags
					if (tags.some(tag => this.normalizeTagName(tag.name) === this.normalizeTagName(change.tag.name))) return tags
					return [change.tag, ...tags]
				})
				return
			}

			if (change.type === 'update') {
				syncTags(tags => tags.map(tag => tag._id === change.tagId ? { ...tag, name: change.name } : tag))
				return
			}

			if (change.type === 'delete') {
				if (this.currentTagId === change.tagId) {
					this.currentTagId = null
				}
				syncTags(tags => tags.filter(tag => tag._id !== change.tagId))
				return
			}

			if (change.type === 'count') {
				const tagIds = change.tagIds || (change.tagId ? [change.tagId] : [])
				const delta = change.delta || 0
				if (!tagIds.length || !delta) return
				syncTags(tags => tags.map(tag => {
					if (!tagIds.includes(tag._id)) return tag
					return { ...tag, count: Math.max((tag.count || 0) + delta, 0) }
				}))
				return
			}

			if (change.type === 'batch-count') {
				const addedTagCounts = change.addedTagCounts || {}
				const tagIds = Object.keys(addedTagCounts)
				if (!tagIds.length) return
				syncTags(tags => tags.map(tag => {
					const delta = addedTagCounts[tag._id] || 0
					if (!delta) return tag
					return { ...tag, count: Math.max((tag.count || 0) + delta, 0) }
				}))
			}
		},
		insertMedia() {
			const mediaPanel = this.$refs.mediaPanel
			if (!mediaPanel) return
			const selectedMediaItems = mediaPanel.getSelectedMediaItems()
			if (selectedMediaItems.length <= 0) return
			const allowAll = !this.mediaTabs.length || this.mediaTabs.includes('all')
			const mediaList = selectedMediaItems.reduce((list, item) => {
				if (!allowAll && !this.mediaTabs.includes(item.type)) return list
				list.push({
					src: item.storageProvider === 'ext-qiniu' ? item.src: item._src,
					cover: item.storageProvider === 'ext-qiniu' ? item.cover: item._cover,
					type: item.type, alt: item.alt, size: item.size, duration: item.duration
				})
				return list
			}, [])
			this.$emit('onInsert', mediaList)
		},
		onStorageBucketChange(provider) {
			this.currentStorageProvider = provider
		},
		onCopyToMediaLibrary(images) {
			const imageLibraryProvider = this.currentProvider
			this.currentMenu = 'upload'
			this.$nextTick(() => {
				setTimeout(() => {
					if (this.$refs.mediaUpload) {
						this.$refs.mediaUpload.addUrlFiles(images, imageLibraryProvider)
					}
				}, 100)
			})
		},
		onUploadSuccess() {
			this.currentMenu = 'media'
			this.ensureAllowedTab()
		}
	}
}
</script>

<style lang="scss">
@import "../../font/remixicon.css";

.media-library-warp {
	height: 100%;
	display: flex;
	background-color: #fff;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.sidebar {
	width: 240px;
	background-color: #fff;
	border-right: 1px solid #f0f0f0;
	display: flex;
	flex-direction: column;
	flex-shrink: 0;

	.sidebar-header {
		height: 64px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 12px;
		border-bottom: 1px solid #f0f0f0;
		box-sizing: border-box;
		flex-shrink: 0;

		.sidebar-title {
			font-size: 16px;
			font-weight: 600;
			color: #1f1f1f;
			letter-spacing: 0.5px;
		}

		.toggle-sidebar-btn {
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 32px;
			height: 32px;
			border-radius: 6px;
			transition: background-color 0.2s;

			&:hover {
				background-color: #f5f5f5;
			}

			.sidebar-toggle-icon {
				font-size: 22px;
				line-height: 1;
				color: #595959;
				transition: color 0.2s;
			}

			&:hover .sidebar-toggle-icon {
				color: #1677ff;
			}
		}
	}

	.sidebar-menu {
		flex: 1;
		height: 0;
	}

	.menu-group {
		padding: 10px 0;
		border-bottom: 1px solid #f6f6f6;

		&:last-child {
			border-bottom: none;
		}

		.group-title {
			padding: 0 24px;
			font-size: 12px;
			color: #8c8c8c;
			margin-top: 12px;
			margin-bottom: 8px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			font-weight: 500;

			.add-tag-icon {
				cursor: pointer;
				font-size: 16px;
				line-height: 1;
				color: #999;
				transition: color 0.2s;
				&:hover {
					color: #1677ff !important;
				}
			}
		}
	}

	.menu-item {
		display: flex;
		align-items: center;
		padding: 9px 12px;
		margin: 2px 12px;
		border-radius: 8px;
		font-size: 14px;
		color: #434343;
		cursor: pointer;
		user-select: none;
		transition: all 0.2s ease;

		.menu-icon {
			width: 18px;
			font-size: 18px;
			line-height: 1;
			margin-left: 0;
			text-align: center;
			color: currentColor;
		}

		.menu-arrow {
			margin-left: auto;
			font-size: 16px;
			line-height: 1;
			color: #8c8c8c;
		}

		text {
			margin-left: 10px;
		}

		&:hover {
			background-color: #f5f5f5;
			color: #1f1f1f;
		}

		&.active {
			background-color: #eef2ff;
			color: #1677ff;
			font-weight: 500;
		}

		&.sub-item {
			padding-left: 40px;
			font-size: 13px;
			color: #595959;

			.menu-icon {
				margin-right: 8px;
			}

			text {
				margin-left: 0;
			}

			&.active {
				color: #1677ff;
			}
		}
	}

	.quick-add-tag {
		display: flex;
		align-items: center;
		padding: 0 12px 8px;
		gap: 6px;

		.quick-tag-input {
			flex: 1;
		}

		.quick-tag-confirm {
			cursor: pointer;
			font-size: 18px;
			color: #52c41a;
			transition: color 0.2s;

			&:hover {
				color: #389e0d;
			}
		}
	}

	.tag-name-text {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.tag-count {
		font-size: 12px;
		color: #8c8c8c;
		background: #f5f5f5;
		padding: 2px 6px;
		border-radius: 10px;
		margin-left: 4px;
	}

	.tag-empty {
		padding: 12px 24px;
		color: #9ca3af;
		font-size: 12px;
		box-sizing: border-box;
		text-align: center;
	}

	.tags-group .menu-item.sub-item.active {
		background-color: #eef2ff;
		border-left: 3px solid #1677ff;
		padding-left: 37px;
	}
}

.main-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;

	.top-nav {
		height: 64px;
		background-color: #fff;
		border-bottom: 1px solid #f0f0f0;
		display: flex;
		align-items: center;
		padding: 0 12px;
		box-sizing: border-box;
		flex-shrink: 0;
		z-index: 10;

		.toggle-sidebar-btn {
			margin-right: 10px;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 32px;
			height: 32px;
			border-radius: 6px;
			transition: background-color 0.2s;
			&:hover {
				background-color: #f5f5f5;
			}

			.sidebar-toggle-icon {
				font-size: 22px;
				line-height: 1;
				color: #595959;
				transition: color 0.2s;
			}

			&:hover .sidebar-toggle-icon {
				color: #1677ff;
			}
		}

		.nav-title {
			font-size: 16px;
			font-weight: 600;
			color: #1f1f1f;
		}

		.provider-desc {
			display: inline-flex;
			align-items: center;
			gap: 8px;
			min-width: 0;
			height: 32px;
			padding: 0 12px;
			box-sizing: border-box;
			border: 1px solid #edf0f5;
			border-radius: 6px;
			background: #fafbfc;
			color: #6b7280;
			font-size: 13px;
			line-height: 1;
			white-space: nowrap;

			.provider-icon {
				font-size: 16px;
				line-height: 1;
				color: #8c8c8c;
				flex-shrink: 0;
			}

			.provider-label {
				color: #8c8c8c;
				flex-shrink: 0;
			}

			.provider-link {
				max-width: 220px;
				overflow: hidden;
				text-overflow: ellipsis;
				color: #1f1f1f;
				font-weight: 500;
				text-decoration: none;
				transition: color .2s;

				&:hover {
					color: #1677ff;
				}
			}
		}
	}

	.content-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		position: relative;
	}
}

.other-view-wrapper {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.other-view-content {
	flex: 1;
	overflow: hidden;
}

.group-title-actions {
	display: flex;
	align-items: center;
	gap: 8px;

	.tag-loading-icon {
		animation: rotate 1s linear infinite;
	}

	.clear-tag-icon {
		cursor: pointer;
		font-size: 14px;
		line-height: 1;
		color: #ff4d4f;
		transition: color 0.2s;
		&:hover {
			color: #ff7875;
		}
	}
}

.active-tag-filter {
	display: flex;
	align-items: center;
	gap: 4px;
	margin-left: 12px;
	padding: 3px 10px;
	background: #f0f5ff;
	border: 1px solid #adc6ff;
	border-radius: 4px;
	font-size: 12px;
	color: #1677ff;
	flex-shrink: 0;

	.clear-btn {
		cursor: pointer;
		font-size: 14px;
		opacity: 0.6;
		transition: opacity 0.2s;
		&:hover {
			opacity: 1;
		}
	}
}

@keyframes rotate {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}
</style>
