<template>
	<view class="media-panel">
		<view class="middle-wrapper">
			<slot name="header"></slot>
			<view class="content">
				<view class="media-workspace">
					<view class="media-list-section">
						<media-filter
							:selectMediaItems="selectedMediaItems"
							:tags="tags"
							@onSearch="onSearchEvent"
							@onCancelSelect="() => $refs.mediaList.cancelAllSelected()"
							@onDeleteSelect="(e) => $refs.mediaList.deleteSelectedMedia(e)"
							@onBatchSetTags="onBatchSetTags"
						></media-filter>
						<media-list
							ref="mediaList"
							:media-group="filter.mediaGroup"
							:media-type="mediaType"
							:keyword="filter.keyword"
							:tag-filter="tagFilter"
							:selectedCount="selectedCount"
							:auto-load="autoLoad"
							@onUploadMedia="onUploadMediaEvent"
							@onSelect="onSelectEvent"
						></media-list>
					</view>
					<view class="media-info-view">
						<media-info
							:current-media="currentMedia"
							:storage-provider="storageProvider"
							:tags="tags"
							@tagsChanged="$emit('tagsChanged', $event)"
							@cropUploaded="onCropUploaded"
						></media-info>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>

import MediaInfo from "../media-info/index.vue";
import MediaFilter from "../media-filter/index.vue";
import MediaList from "../media-list/index.vue";

export default {
	name: "media-panel",
	props: {
		mediaType: String,
			storageProvider: {
			type: String,
			default: () => 'internal'
			},
		tagFilter: String,
		tags: {
			type: Array,
			default: () => []
		},
		selectedCount: Number,
		autoLoad: {
			type: Boolean,
			default: true
		}
	},
	emits: ['onUploadMedia', 'tagsChanged'],
	expose: ['getSelectedMediaItems'],
	components: {
		MediaList,
		MediaFilter,
		MediaInfo
	},
	data() {
		return {
			currentMedia: null,
			selectedMediaItems: [],
			filter: {
				mediaGroup: null,
				keyword: null
			}
		}
	},
	methods: {
		onUploadMediaEvent() {
			this.$emit('onUploadMedia')
		},
		onSearchEvent(filter) {
			this.filter = filter
		},
		onSelectEvent(selectedMediaItems) {
			const currentMedia = selectedMediaItems.find(item => item.active)
			this.selectedMediaItems = selectedMediaItems
			this.currentMedia = currentMedia
		},
		async onBatchSetTags(payload) {
			const result = await this.$refs.mediaList.batchSetTags(payload)
			this.$emit('tagsChanged', {
				type: 'batch-count',
				addedTagCounts: result?.addedTagCounts || {}
			})
		},
		onCropUploaded() {
			this.$refs.mediaList && this.$refs.mediaList.loadMediaList(true)
		},
		getSelectedMediaItems() {
			return this.selectedMediaItems
		}
	}
}
</script>

<style lang="scss" scoped>
.media-panel {
	flex: 1;
	display: flex;
	min-height: 0;
	position: relative;
	overflow: hidden;

	.middle-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		user-select: none;
		min-width: 0;
		background: #fff;
		overflow: hidden;
		box-sizing: border-box;
	}
}

.media-workspace {
	flex: 1;
	display: flex;
	min-height: 0;
	min-width: 0;
	overflow: hidden;
}

.media-list-section {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.media-info-view {
	width: 320px;
	flex-shrink: 0;
	min-height: 0;
	display: flex;
}

@media screen and (max-width: 1024px) {
	.media-workspace {
		flex-direction: column;
	}

	.media-info-view {
		width: 100%;
		height: 320px;
		border-top: 1px solid #f0f0f0;
	}
}
</style>
