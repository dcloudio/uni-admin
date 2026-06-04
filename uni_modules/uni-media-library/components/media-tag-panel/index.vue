<template>
	<view class="tag-panel">
		<view class="tag-create">
			<uni-easyinput
				v-model="newTagName"
				class="tag-input"
				placeholder="输入标签名称..."
				@confirm="createTag"
			></uni-easyinput>
			<media-button type="primary" size="small" @click="createTag">添加</media-button>
		</view>
		<view v-if="loading" class="loading">
			<uni-icons class="icon" type="spinner-cycle" size="24" color="#000"></uni-icons>
		</view>
		<view v-else-if="!tags || tags.length === 0" class="empty">
			<text>暂无标签</text>
		</view>
		<view v-else class="tag-list">
			<view class="tag-item" v-for="tag in tags" :key="tag._id">
				<template v-if="editingTagId === tag._id">
					<uni-easyinput
						v-model="editingName"
						class="tag-edit-input"
						@confirm="saveTag(tag._id)"
						@blur="saveTag(tag._id)"
					></uni-easyinput>
					<view class="tag-actions">
						<view class="action-icon save" @click="saveTag(tag._id)">
							<uni-icons type="checkmarkempty" size="18" color="#52c41a"></uni-icons>
						</view>
						<view class="action-icon cancel" @click="cancelEdit">
							<uni-icons type="closeempty" size="18" color="#8c8c8c"></uni-icons>
						</view>
					</view>
				</template>
				<template v-else>
					<text class="tag-name">{{ tag.name }}</text>
					<text class="tag-count">{{ tag.count || 0 }}</text>
					<view class="tag-actions">
						<view class="action-icon edit" @click="startEdit(tag)">
							<uni-icons type="compose" size="16" color="#8c8c8c"></uni-icons>
						</view>
						<view class="action-icon delete" @click="confirmDelete(tag)">
							<uni-icons type="trash" size="16" color="#8c8c8c"></uni-icons>
						</view>
					</view>
				</template>
			</view>
		</view>
		<uni-popup ref="deletePopup" type="dialog">
			<uni-popup-dialog
				title="删除标签"
				confirmText="确定删除"
				cancelText="取消"
				:before-close="true"
				@close="closeDeletePopup"
				@confirm="deleteTag"
			>
				<text class="delete-tip">删除标签将同时移除所有关联媒体的此标签，确定要删除吗？</text>
			</uni-popup-dialog>
		</uni-popup>
	</view>
</template>

<script>
import {getMediaLibraryCo} from "../../common/cloud-object";
import MediaButton from "../media-button/index.vue";

const db = uniCloud.database()

export default {
	name: "media-tag-panel",
	components: {
		MediaButton
	},
	emits: ['tagsChanged'],
	props: {
		tags: {
			type: Array,
			default: () => []
		},
		loading: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			creating: false,
			newTagName: '',
			editingTagId: null,
			editingName: '',
			deletingTagId: null
		}
	},
	methods: {
		normalizeTagName(name = '') {
			return String(name).trim().toLowerCase()
		},
		async createTag() {
			if (this.creating) return
			const name = this.newTagName.trim()
			if (!name) {
				uni.showToast({ title: '标签名称不能为空', icon: 'none' })
				return
			}

			try {
				this.creating = true
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

				this.newTagName = ''
				this.$emit('tagsChanged', { type: 'create', tag: { ...tag, count: 0 } })
			} catch (e) {
				console.error('Failed to create tag', e)
				uni.showToast({ title: '创建标签失败', icon: 'none' })
			} finally {
				this.creating = false
			}
		},
		startEdit(tag) {
			this.editingTagId = tag._id
			this.editingName = tag.name
		},
		cancelEdit() {
			this.editingTagId = null
			this.editingName = ''
		},
		async saveTag(tagId) {
			const name = this.editingName.trim()
			if (!name) {
				uni.showToast({ title: '标签名称不能为空', icon: 'none' })
				return
			}
			const normalizedName = this.normalizeTagName(name)
			if (this.tags.some(tag => tag._id !== tagId && this.normalizeTagName(tag.name) === normalizedName)) {
				uni.showToast({ title: '标签名称已存在', icon: 'none' })
				return
			}

			try {
				await db.collection('uni-media-tags').doc(tagId).update({ name })
				this.cancelEdit()
				this.$emit('tagsChanged', { type: 'update', tagId, name })
			} catch (e) {
				console.error('Failed to update tag', e)
				uni.showToast({ title: '更新标签失败', icon: 'none' })
			}
		},
		confirmDelete(tag) {
			this.deletingTagId = tag._id
			this.$refs.deletePopup.open()
		},
		closeDeletePopup() {
			this.deletingTagId = null
			this.$refs.deletePopup.close()
		},
		async deleteTag() {
			if (!this.deletingTagId) return

			try {
				const tagId = this.deletingTagId
				const uniMediaLibraryCo = getMediaLibraryCo({
					loadingOptions: { title: '正在删除', mask: true }
				})
				await uniMediaLibraryCo.deleteTag({ tagId })

				this.closeDeletePopup()
				this.$emit('tagsChanged', { type: 'delete', tagId })
			} catch (e) {
				console.error('Failed to delete tag', e)
				uni.showToast({ title: '删除标签失败', icon: 'none' })
			}
		}
	}
}
</script>

<style lang="scss">
.tag-panel {
	padding: 16px;
	height: 100%;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
}

.tag-create {
	display: flex;
	gap: 8px;
	margin-bottom: 16px;

	.tag-input {
		flex: 1;
	}
}

.loading {
	display: flex;
	justify-content: center;
	padding: 40px 0;

	.icon {
		animation: rotate 1s linear infinite;
	}
}

.empty {
	display: flex;
	justify-content: center;
	padding: 40px 0;
	color: #bfbfbf;
	font-size: 14px;
}

.tag-list {
	flex: 1;
	overflow-y: auto;
}

.tag-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px 12px;
	border: 1px solid #f0f0f0;
	border-radius: 6px;
	margin-bottom: 8px;
	transition: border-color 0.2s;

	&:hover {
		border-color: #d9d9d9;
	}
}

.tag-name {
	flex: 1;
	font-size: 14px;
	color: #262626;
}

.tag-count {
	font-size: 12px;
	color: #8c8c8c;
	background: #f5f5f5;
	padding: 2px 8px;
	border-radius: 10px;
	margin-left: 8px;
	flex-shrink: 0;
}

.tag-edit-input {
	flex: 1;
}

.tag-actions {
	display: flex;
	gap: 8px;
	margin-left: 8px;
}

.action-icon {
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 4px;
	cursor: pointer;
	transition: background-color 0.2s;

	&:hover {
		background: #f5f5f5;
	}

	&.edit:hover {
		.uni-icons {
			color: #1677ff !important;
		}
	}

	&.delete:hover {
		.uni-icons {
			color: #ff4d4f !important;
		}
	}

	&.save:hover {
		.uni-icons {
			color: #389e0d !important;
		}
	}
}

.delete-tip {
	font-size: 14px;
	color: #595959;
	line-height: 1.6;
}

@keyframes rotate {
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
}
</style>
