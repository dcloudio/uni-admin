<template>
	<scroll-view
		class="media-view"
		scroll-y
		@scrolltolower="loadMore"
	>
		<unicloud-db
			ref="mediaUdb"
			v-slot:default="{data, loading, error, pagination}"
			:collection="collection"
			orderby="createDate desc"
			loadtime="manual"
			:page-size="pageSize"
			@load="onMediaListLoad"
		>
			<view v-if="(loading || processing) && pagination.current === 1" class="loading">
				<uni-icons class="icon" type="spinner-cycle" size="30" color="#000"></uni-icons>
			</view>
			<view class="items" v-else-if="mediaList.length">
				<view
					class="media-item"
					:class="{active: mediaItem.active, selected: mediaItem.selected}"
					v-for="(mediaItem, index) in mediaList"
					@click="onSelect(index)"
					:key="mediaItem._id"
				>
					<view class="image" v-if="mediaItem.type === 'image'">
						<image
							:src="coverImage(mediaItem.cover, mediaItem.thumbRules && mediaItem.thumbRules.listCover)"
							lazy-load
							mode="aspectFill" class="img"></image>
					</view>
					<view class="image" v-if="mediaItem.type === 'video'">
						<video
							class="v"
							:src="mediaItem.src"
							:controls="false"
							:show-center-play-btn="false"
							:poster="coverImage(mediaItem.cover, mediaItem.thumbRules && mediaItem.thumbRules.listCover)"
							v-if="/^cloud:\/\//.test(mediaItem._src)"
						></video>
						<image
							v-else
							:src="coverImage(mediaItem.cover, mediaItem.thumbRules && mediaItem.thumbRules.listCover)"
							lazy-load
							mode="aspectFill"
							class="img"></image>
						<view class="video-mask">
							<view class="video-type-badge">
								<uni-icons type="videocam" size="13" color="#fff"></uni-icons>
								<text>视频</text>
							</view>
							<view class="video-play-icon">
								<view class="video-play-triangle"></view>
							</view>
							<view class="video-duration">{{ formatDuration(mediaItem.duration) }}</view>
						</view>
					</view>
				</view>
			</view>
			<view class="media-library-isnull" v-else>
				<uni-icons type="images" size="60" color="#ccc"></uni-icons>
				<view class="text">媒体库资源为空，是否上传资源？</view>
				<media-button
					type="primary"
					size="small"
					icon="cloud-upload"
					@click="$emit('onUploadMedia');"
				>上传媒体资源</media-button>
			</view>
		</unicloud-db>

	</scroll-view>
</template>

<script>
import {generateCoverURL} from "../../common/crop";
import {getMediaLibraryCo} from "../../common/cloud-object";
import MediaButton from "../media-button/index.vue";

const db = uniCloud.database()

export default {
	name: "media-list",
	components: {
		MediaButton
	},
	emits: ['onSelect', 'onUploadMedia'],
	expose: ['cancelAllSelected', 'deleteSelectedMedia', 'loadMediaList', 'batchSetTags'],
	props: {
		mediaType: {
			type: String,
			default: () => "all"
		},
		mediaGroup: String,
		keyword: String,
		tagFilter: String,
		selectedCount: Number,
		autoLoad: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			lastSelectedIndex: 0,
			remoteMediaList: [],
			shiftKey: false,
			processing: true,
			loadingMore: false,
			fillingViewport: false,
			noMore: false,
			pageSize: 50,
			loadId: 0
		}
	},
	watch: {
		mediaGroup() {
			this.loadMediaList(true)
		},
		keyword() {
			this.loadMediaList(true)
		},
		tagFilter() {
			this.loadMediaList(true)
		}
	},
	computed: {
		collection() {
			return [
				db.collection('uni-media-library').where(this.mediaListWhere || {}).getTemp(),
				db.collection('uni-id-users').field('_id, nickname').getTemp()
			]
		},
		mediaList() {
			return this.remoteMediaList
		},
		mediaListWhere() {
			const cond = []

			if (this.mediaType !== 'all') {
				cond.push(`type=="${this.mediaType}"`)
			}
			if (this.mediaGroup) {
				cond.push(`group=="${this.mediaGroup}"`)
			}

			if (this.keyword) {
				cond.push(`${new RegExp(this.keyword, 'i')}.test(description)`)
			}

			if (this.tagFilter) {
				cond.push(`tags=="${this.tagFilter}"`)
			}

			return cond.join('&&')
		}
	},
	mounted() {
		if (this.autoLoad) {
			this.loadMediaList()
		}
		// #ifdef H5
		document.addEventListener('keydown', this.onKeyDown)
		document.addEventListener('keyup', this.onKeyUp)
		// #endif
	},
	destroyed() {
		// #ifdef H5
		document.removeEventListener('keydown', this.onKeyDown)
		document.removeEventListener('keyup', this.onKeyUp)
		// #endif
	},
	methods: {
		coverImage(url, rule) {
			return generateCoverURL(url, rule)
		},
		formatDuration(duration) {
			const totalSeconds = Math.floor(Number(duration) || 0)
			if (totalSeconds <= 0) return '视频'

			const hours = Math.floor(totalSeconds / 3600)
			const minutes = Math.floor((totalSeconds % 3600) / 60)
			const seconds = totalSeconds % 60
			const pad = value => String(value).padStart(2, '0')

			if (hours > 0) {
				return `${hours}:${pad(minutes)}:${pad(seconds)}`
			}

			return `${minutes}:${pad(seconds)}`
		},
		onKeyDown(e) {
			if (e.keyCode === 16) {
				this.shiftKey = true
			}
		},
		onKeyUp(e) {
			if (e.keyCode === 16) {
				this.shiftKey = false
			}
		},
		async onMediaListLoad(data = []) {
			const cloudFiles = []
			const qiniuFiles = []

			// 保存原始图片
			data.forEach(item => {
				item._src = item.src
				item._cover = item.cover
			})

			for (let i = 0; i < data.length; i++) {
				const media = data[i]
				if (media.src?.startsWith('cloud://')) {
					cloudFiles.push({
						index: i,
						type: media.type,
						src: media.src,
						cover: media.cover,
					})
				} else if (media.src?.startsWith('qiniu://')) {
					qiniuFiles.push({
						index: i,
						type: media.type,
						src: media.src,
						cover: media.cover,
					})
				}
			}

			if (cloudFiles.length) {
				const res = await this.getMediaAssetTempURLs(
					new Set(
						[].concat.call([], ...cloudFiles.map(item => [item.src, item.cover])).filter(item => item)
					)
				)

				res.fileList.forEach(item => {
					const srcTempFile = cloudFiles.find(file => file.src === item.fileID)
					const coverTempFile = cloudFiles.find(file => file.cover === item.fileID)

					if (srcTempFile) {
						data[srcTempFile.index].src = item.tempFileURL
					}
					if (coverTempFile) {
						data[coverTempFile.index].cover = item.tempFileURL
					}
				})
			}

			if (qiniuFiles.length) {
				try {
					const res = await getMediaLibraryCo().getTempFileURL({
						fileList: [].concat.call([], ...qiniuFiles.map(item => [item.src, item.cover])).filter(Boolean)
					})
					if (res.data?.fileList) {
						res.data.fileList.forEach(item => {
							const srcFile = qiniuFiles.find(file => file.src === item.fileID)
							const coverFile = qiniuFiles.find(file => file.cover === item.fileID)
							if (srcFile) {
								data[srcFile.index].src = item.tempFileURL
							}
							if (coverFile) {
								data[coverFile.index].cover = item.tempFileURL
							}
						})
					}
				} catch (e) {
					console.error('解析扩展存储URL失败', e)
				}
			}

			this.remoteMediaList = this.remoteMediaList.concat(data)
			this.noMore = data.length < this.pageSize
			this.loadingMore = false
			this.processing = false
			this.$nextTick(() => this.ensureViewportFilled())
		},
		async getMediaAssetTempURLs(listSet) {
			const limit = 30

			const fileList = Array.from(listSet)

			const res = {
				fileList: []
			}

			for (let i = 0; i < fileList.length; i += limit) {
				const resTemp = await uniCloud.getTempFileURL({
					fileList: fileList.slice(i, i + limit)
				})
				res.fileList = res.fileList.concat(resTemp.fileList)
			}

			return res
		},
		loadMediaList(reset = false) {
			if (reset) {
				this.remoteMediaList = []
				this.cancelAllSelected()
				this.loadId++
			}

			this.processing = true
			this.loadingMore = false
			this.fillingViewport = false
			this.noMore = false
			this.$nextTick(() => this.$refs.mediaUdb.loadData({
				clear: reset
			}))
		},
		loadMore() {
			if (this.noMore || this.loadingMore || this.processing) return

			this.loadingMore = true
			this.$refs.mediaUdb.loadMore()
		},
		ensureViewportFilled() {
			if (this.fillingViewport || this.noMore || this.loadingMore || !this.mediaList.length) return

			this.fillingViewport = true
			this.$nextTick(() => {
				const query = uni.createSelectorQuery().in(this)
				query.select('.media-view').boundingClientRect()
				query.select('.items').boundingClientRect()
				query.exec((rects) => {
					this.fillingViewport = false
					const [viewRect, itemsRect] = rects || []

					if (!viewRect || !itemsRect) return
					if (itemsRect.height <= viewRect.height + 1) {
						this.loadMore()
					}
				})
			})
		},
		onSelect(index) {
			let minIndex = index
			let maxIndex = index
			// shift 多选
			if (this.shiftKey) {
				minIndex = Math.min(this.lastSelectedIndex, index)
				maxIndex = Math.max(this.lastSelectedIndex, index)
			}

			const mediaItem = this.mediaList[index]

			// 如果设置了最大选择数量，判断是否超过最大数量
			if (this.selectedCount > 0 && !mediaItem.selected && !mediaItem.active) {
				const selectedMediaCount = this.mediaList.reduce((count, item) => item.selected || item.active ? count + 1 : count, 0)
				if (selectedMediaCount + (maxIndex - minIndex + 1) > this.selectedCount) {
					uni.showToast({
						title: `最多只能选择${this.selectedCount}个媒体文件`,
						icon: 'none'
					})
					return
				}
			}

			// 选择
			if (!mediaItem.selected) {
				// 选中当前
				for (let i = minIndex; i <= maxIndex; i++) {
					this.$set(this.mediaList[i], 'active', !mediaItem.active)
				}

				// 取消其他当前选中并设置为已选择
				for (const otherMediaItem of this.mediaList) {
					if (otherMediaItem.active && otherMediaItem._id !== mediaItem._id) {
						this.$set(otherMediaItem, 'active', false)
						this.$set(otherMediaItem, 'selected', true)
					}
				}
			} else {
				// 取消选择
				this.$set(this.mediaList[index], 'selected', false)
			}

			this.lastSelectedIndex = index

			this.$nextTick(() => {
				this.$emit('onSelect', this.mediaList.filter(item => item.selected || item.active))
			})
		},
		cancelAllSelected() {
			for (const mediaItem of this.mediaList) {
				if (mediaItem.active || mediaItem.selected) {
					this.$set(mediaItem, 'active', false)
					this.$set(mediaItem, 'selected', false)
				}
			}
			this.$nextTick(() => {
				this.$emit('onSelect', [])
			})
		},
		deleteSelectedMedia(mediaIds) {
			for (const id of mediaIds) {
				const index = this.remoteMediaList.findIndex(item => item._id === id)
				this.remoteMediaList.splice(index, 1)
			}

			this.$nextTick(() => {
				this.$emit('onSelect', [])
			})
		},
		async batchSetTags({ mediaIds = [], tagIds = [] }) {
			if (!mediaIds.length || !tagIds.length) return

			uni.showLoading({
				title: '正在设置标签',
				mask: true
			})

			try {
				const uniMediaLibraryCo = getMediaLibraryCo()
				const res = await uniMediaLibraryCo.batchAddTagsToMedia({ mediaIds, tagIds })
				const addedTagCounts = res.data?.addedTagCounts || {}
				const addedCount = res.data?.addedCount || 0

				for (const mediaItem of this.remoteMediaList) {
					if (!mediaIds.includes(mediaItem._id)) continue
					const oldTags = Array.isArray(mediaItem.tags) ? mediaItem.tags : []
					this.$set(mediaItem, 'tags', Array.from(new Set(oldTags.concat(tagIds))))
				}

				this.$nextTick(() => {
					this.$emit('onSelect', this.mediaList.filter(item => item.selected || item.active))
				})
				uni.showToast({
					title: addedCount > 0 ? '标签设置成功' : '所选资源已包含这些标签',
					icon: 'none'
				})

				return { addedTagCounts }
			} catch (e) {
				console.error('Batch set tags failed', e)
				uni.showToast({
					title: '设置标签失败',
					icon: 'none'
				})
				throw e
			} finally {
				uni.hideLoading()
			}
		},
	}
}
</script>

<style lang="scss">
.media-view {
	flex: 1;
	overflow-y: auto;

	.items {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
		gap: 14px;
		align-items: start;
		padding: 12px;
	}
}

.loading {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;

	.icon {
		animation: rotate 1s linear infinite;
	}
}

.media-item {
	width: 100%;
	aspect-ratio: 1;
	background: #fff;
	border-radius: 10px;
	box-sizing: border-box;
	cursor: pointer;
	position: relative;
	overflow: hidden;
	box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
	transition: box-shadow .2s, transform .2s;

	&::after {
		content: "";
		position: absolute;
		inset: 0;
		z-index: 2;
		pointer-events: none;
		border-radius: 9px;
		box-shadow: inset 0 0 0 0 rgba(22, 119, 255, 0);
		transition: box-shadow .2s;
	}

	&:hover {
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
		transform: translateY(-1px);
	}

	&.selected {
		box-shadow: 0 0 0 2px rgba(22, 119, 255, .12);

		&::after {
			box-shadow: inset 0 0 0 4px rgba(22, 119, 255, .65);
		}
	}

	&.active {
		box-shadow: 0 0 0 2px rgba(22, 119, 255, .2), 0 8px 20px rgba(0, 0, 0, 0.08);

		&::after {
			box-shadow: inset 0 0 0 4px #1677ff;
		}
	}

	.image {
		width: 100%;
		height: 100%;
		position: relative;
		background: #f5f5f5;

		.img, .v {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			display: block;
		}

		.video-mask {
			position: absolute;
			inset: 0;
			z-index: 1;
			pointer-events: none;
			background: linear-gradient(180deg, rgba(0, 0, 0, .28) 0%, rgba(0, 0, 0, 0) 38%, rgba(0, 0, 0, .42) 100%);
		}

		.video-type-badge,
		.video-duration {
			position: absolute;
			display: flex;
			align-items: center;
			height: 24px;
			padding: 0 7px;
			border-radius: 6px;
			background: rgba(0, 0, 0, .58);
			color: #fff;
			font-size: 12px;
			line-height: 1;
			backdrop-filter: blur(4px);
			box-sizing: border-box;
		}

		.video-type-badge {
			top: 8px;
			left: 8px;
			gap: 3px;
		}

		.video-duration {
			right: 8px;
			bottom: 8px;
			font-variant-numeric: tabular-nums;
		}

		.video-play-icon {
			position: absolute;
			top: 50%;
			left: 50%;
			width: 40px;
			height: 40px;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 50%;
			background: rgba(0, 0, 0, .42);
			box-shadow: 0 4px 14px rgba(0, 0, 0, .18);
			transform: translate(-50%, -50%);
			backdrop-filter: blur(4px);
		}

		.video-play-triangle {
			width: 0;
			height: 0;
			margin-left: 3px;
			border-top: 9px solid transparent;
			border-bottom: 9px solid transparent;
			border-left: 13px solid #fff;
		}
	}
}

.media-library-isnull {
	padding-top: 50px;
	text-align: center;

	.text {
		font-size: 18px;
		color: #ccc;
		margin-top: 5px;
		margin-bottom: 30px;
	}
}

@keyframes rotate {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg)
	}
}

@media screen and (max-width: 768px) {
	.media-view {
		.items {
			grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
			gap: 10px;
		}
	}
}

@media screen and (min-width: 768px) {
	.media-item {
		--row-media-item: 5;
	}
}

@media screen and (min-width: 1360px) {
	.media-item {
		--row-media-item: 7;
	}
}

@media screen and (min-width: 1920px) {
	.media-item {
		--row-media-item: 10;
	}
}

@media screen and (min-width: 2560px) {
	.media-item {
		--row-media-item: 15;
	}
}
</style>
