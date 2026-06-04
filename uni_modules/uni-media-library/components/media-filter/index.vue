<template>
	<view class="media-filter-warp">
		<view class="filter-options">
			<!--      <uni-data-select-->
			<!--          v-model="mediaGroup"-->
			<!--          class="group-select"-->
			<!--          @change="search"-->
			<!--      ></uni-data-select>-->
			<uni-easyinput
				v-model="keyword"
				class="search-input"
				suffixIcon="search"
				placeholder="搜索所有媒体..."
				@iconClick="search"
				@confirm="search"
			></uni-easyinput>
		</view>
		<view class="filter-spacer"></view>
		<view class="select-options" v-if="isSelected">
			<media-button type="default" size="small" @click="$emit('onCancelSelect')">
				取消选中 ({{ selectedCount }})
			</media-button>
			<media-button type="default" size="small" icon="compose" @click="openTagPopup">
				设置标签
			</media-button>
			<media-button type="warn" size="small" icon="trash" @click="deleteMedia">
				删除资源
			</media-button>
			<uni-popup ref="tagPopup" type="dialog">
				<uni-popup-dialog
					:title="`为${selectedCount}项资源设置标签`"
					confirmText="确定"
					cancelText="取消"
					:before-close="true"
					@close="closeTagPopup"
					@confirm="confirmTags"
				>
					<view class="batch-tag-dialog">
						<checkbox-group class="batch-tag-list" @change="onTagCheckChange">
							<label class="batch-tag-item" v-for="tag in tags" :key="tag._id">
								<checkbox color="#1677ff" :value="tag._id" :checked="selectedTagIds.includes(tag._id)" />
								<text>{{ tag.name }}</text>
							</label>
						</checkbox-group>
						<view class="batch-tag-empty" v-if="!tags.length">暂无标签</view>
					</view>
				</uni-popup-dialog>
			</uni-popup>
			<uni-popup ref="popup" type="dialog">
				<uni-popup-dialog
					:title="`删除${selectedCount}项媒体资源?`"
					confirmText="确定删除"
					cancelText="取消"
					:duration="2000"
					:before-close="true"
					@close="close"
					@confirm="confirm"
				>
					<label style="font-size: 14px;">
						<checkbox-group style="display: flex; align-items: center" @change="deleteOriFile">
							<checkbox color="#269939" style="transform:scale(0.7); --HOVER-BD-COLOR: #269939;"
							          :checked="deleteOriFileChecked" :value="deleteOriFileChecked"/>
							同时删除源文件
						</checkbox-group>
					</label>
				</uni-popup-dialog>
			</uni-popup>
		</view>
	</view>
</template>

<script>
import {getMediaLibraryCo} from "../../common/cloud-object";
import MediaButton from "../media-button/index.vue";

export default {
	name: "media-filter",
	components: {
		MediaButton
	},
	emits: ['onUploadMedia', 'onSearch', 'onCancelSelect', 'onDeleteSelect', 'onBatchSetTags'],
	props: {
		selectMediaItems: {
			type: Array,
			default: () => []
		},
		tags: {
			type: Array,
			default: () => []
		}
	},
	computed: {
		isSelected() {
			return this.selectMediaItems.length > 0
		},
		selectedCount() {
			return this.selectMediaItems.length
		}
	},
	data() {
		return {
			mediaGroup: '',
			keyword: '',
			lastKeyword: '',
			deleteOriFileChecked: true,
			selectedTagIds: []
		}
	},
	methods: {
		deleteOriFile() {
			this.deleteOriFileChecked = !this.deleteOriFileChecked
		},
		close() {
			this.$refs.popup.close()
			this.deleteOriFileChecked = true
		},
		search() {
			if (this.keyword === this.lastKeyword) return

			this.$emit('onSearch', {
				mediaGroup: this.mediaGroup,
				keyword: this.keyword
			})

			this.lastKeyword = this.keyword
		},
		deleteMedia() {
			this.$refs.popup.open()
		},
		openTagPopup() {
			this.selectedTagIds = []
			this.$refs.tagPopup.open()
		},
		closeTagPopup() {
			this.selectedTagIds = []
			this.$refs.tagPopup.close()
		},
		onTagCheckChange(e) {
			this.selectedTagIds = e.detail.value || []
		},
		confirmTags() {
			if (!this.selectedTagIds.length) {
				uni.showToast({ title: '请选择标签', icon: 'none' })
				return
			}
			this.$emit('onBatchSetTags', {
				mediaIds: this.selectMediaItems.map(item => item._id),
				tagIds: [...this.selectedTagIds]
			})
			this.closeTagPopup()
		},
		async confirm() {
			if (this.selectedCount > 50) {
				uni.showToast({
					title: '每次最多删除50项媒体资源',
					icon: 'none'
				})
				return
			}

			const uniMediaLibraryCo = getMediaLibraryCo({
				loadingOptions: {
					title: "正在删除",
					mask: true
				}
			})
			const mediaIds = this.selectMediaItems.map(item => item._id)
			await uniMediaLibraryCo.deleteMedia({
				mediaIds,
				deleteOriginalFile: this.deleteOriFileChecked
			})

			this.$emit('onDeleteSelect', mediaIds)
			this.deleteOriFileChecked = true
		}
	}
}
</script>

<style lang="scss">
.media-filter-warp {
	display: flex;
	align-items: center;
	padding: 12px;
	gap: 12px;

	.split {
		width: 1px;
		height: 14px;
		background: #f0f0f0;
		margin: 0 5px;
	}

	.filter-options {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;

		.search-input {
			min-width: 260px;

			.uni-easyinput__content {
				background-color: #fafafa !important;
				border-color: #e4e4e7 !important;
				border-radius: 6px !important;
				transition: all 0.3s;

				&:focus-within {
					background-color: #fff !important;
					border-color: #1677ff !important;
					box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1) !important;
				}
			}
		}
	}

	.filter-spacer {
		flex: 1;
		min-width: 0;
	}

	.select-options {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-shrink: 0;
	}
}

.batch-tag-dialog {
	min-width: 260px;
	max-width: 360px;
}

.batch-tag-list {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	max-height: 220px;
	overflow-y: auto;
}

.batch-tag-item {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 5px 8px 5px 4px;
	border: 1px solid #f0f0f0;
	border-radius: 6px;
	font-size: 13px;
	color: #595959;
	cursor: pointer;

	checkbox {
		transform: scale(0.72);
	}
}

.batch-tag-empty {
	padding: 24px 0;
	text-align: center;
	font-size: 13px;
	color: #bfbfbf;
}

@media screen and (max-width: 1120px) {
	.media-filter-warp {
		flex-wrap: wrap;
		align-items: stretch;

		.filter-options {
			width: 100%;

			.search-input {
				width: 100%;
				min-width: 0;
			}
		}

		.filter-spacer {
			display: none;
		}

		.select-options {
			width: 100%;
			flex-wrap: wrap;
			gap: 8px;
		}
	}
}

@media screen and (max-width: 768px) {
	.media-filter-warp {
		.select-options {
			gap: 8px;
		}
	}
}
</style>
